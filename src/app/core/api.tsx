import connector from '@core/connector';
import { CID } from '@app/shared/constants';
import { ProposalData, IAsset } from './types';
import { Base64EncodeUrl, parseMetadata } from '@core/appUtils';
import { ShaderRuntimeConfig } from '@core/shaderRegistry';

import React from 'react';
import { toast } from 'react-toastify';
import { encode } from 'js-base64';

function isWalletLockedError(error: unknown): boolean {
  return error instanceof Error && error.message === 'Wallet is locked';
}

function isUserCanceledError(error: unknown): boolean {
  return error instanceof Error
    && (error.message === 'Wallet is locked' || error.message === 'Request canceled by user');
}

async function callApiWithRecovery(method: string, params: Record<string, unknown>) {
  try {
    return await connector.callApi(method, params);
  } catch (error) {
    if (!isWalletLockedError(error) || method === 'wallet_status') {
      throw error;
    }
    await connector.callApi('wallet_status');
    return connector.callApi(method, params);
  }
}

export interface ContractCallConfig {
  cid?: string;
  contractBytes?: number[] | null;
}

function resolveCallConfig(
  config: ContractCallConfig | undefined,
  fallbackCid: string,
): Required<ContractCallConfig> {
  return {
    cid: config?.cid || fallbackCid,
    contractBytes: config?.contractBytes ?? null,
  };
}

export function toContractCallConfig(shader: ShaderRuntimeConfig | null | undefined): ContractCallConfig | undefined {
  if (!shader) return undefined;
  return {
    cid: shader.cid,
    contractBytes: shader.contractBytes,
  };
}

/**
 * invoke_contract preserving raw_data (same pattern as dex-app api).
 */
async function invokeRaw(args: string, contractBytes?: number[] | null) {
  const params: Record<string, unknown> = { create_tx: false, args };
  if (contractBytes?.length) {
    params.contract = contractBytes;
  }

  const result: any = await callApiWithRecovery('invoke_contract', params);

  let shaderResult: any = null;
  if (result?.output && typeof result.output === 'string') {
    const parsed = JSON.parse(result.output);
    if (parsed.error) throw new Error(parsed.error);
    shaderResult = parsed;
  }

  return { shaderResult, rawData: result?.raw_data ?? null };
}

async function submitAfterInvoke(
  rawData: unknown,
  voteParams: { id: number; vote: number } | null,
  toasted: string | null,
) {
  if (rawData == null || (Array.isArray(rawData) && rawData.length === 0)) {
    return;
  }

  try {
    const result: any = await callApiWithRecovery('process_invoke_data', { data: rawData });

    if (voteParams?.id) {
      const votes = localStorage.getItem('votes');
      let updatedVotes: { id: number; txid: string; vote: number }[] = [];
      if (votes) {
        updatedVotes = [...(JSON.parse(votes).votes)];
      }

      updatedVotes.push({ id: voteParams.id, txid: result.txid, vote: voteParams.vote });

      localStorage.setItem('votes', JSON.stringify({ votes: updatedVotes }));
    }

    if (toasted && result) {
      const CreatedProposalMsg = (text: string) => (
        <div>
          Voting <span style={{ fontWeight: 'bold' }}>{text}</span> created
        </div>
      );

      const text = toasted.length > 50 ? `${toasted.substring(0, 50)}...` : toasted;
      toast(CreatedProposalMsg(text));
    }
  } catch (e: unknown) {
    if (isUserCanceledError(e)) return;
    throw e;
  }
}

export async function LoadViewParams<T = unknown>(contractBytes?: number[] | null): Promise<T> {
  const { cid } = resolveCallConfig(undefined, CID);
  const { shaderResult } = await invokeRaw(`role=manager,action=view_params,cid=${cid}`, contractBytes);
  return shaderResult.params as T;
}

export async function LoadTotals<T = unknown>(): Promise<T> {
  const { cid } = resolveCallConfig(undefined, CID);
  const { shaderResult } = await invokeRaw(`role=manager,action=view_totals,cid=${cid}`);
  return shaderResult.res as T;
}

export async function LoadProposals<T = unknown>(): Promise<T> {
  const { cid } = resolveCallConfig(undefined, CID);
  const { shaderResult } = await invokeRaw(`role=manager,action=view_proposals,cid=${cid}`);
  return shaderResult.res as T;
}

export async function LoadProposalData<T = unknown>(id: number | string): Promise<T> {
  const { cid } = resolveCallConfig(undefined, CID);
  const { shaderResult } = await invokeRaw(
    `role=manager,action=view_proposal,id=${id},cid=${cid}`,
  );
  return shaderResult as T;
}

export async function LoadManagerView<T = unknown>(): Promise<T> {
  const { cid } = resolveCallConfig(undefined, CID);
  const { shaderResult } = await invokeRaw(`role=manager,action=view,cid=${cid}`);
  return shaderResult as T;
}

export async function LoadModeratorsView<T = unknown>(): Promise<T> {
  const { cid } = resolveCallConfig(undefined, CID);
  const { shaderResult } = await invokeRaw(`role=manager,action=view_moderators,cid=${cid}`);
  return shaderResult.res as T;
}

export async function LoadPublicKey<T = unknown>(): Promise<T> {
  const { cid } = resolveCallConfig(undefined, CID);
  const { shaderResult } = await invokeRaw(`role=user,action=my_key,cid=${cid}`);
  return shaderResult.key as T;
}

export async function AddProposal<T = unknown>(payload: ProposalData): Promise<T> {
  const jsonData = JSON.stringify(payload);
  const proposal = Base64EncodeUrl(encode(jsonData));
  const { cid } = resolveCallConfig(undefined, CID);
  const { shaderResult, rawData } = await invokeRaw(
    `role=manager,action=add_proposal,variants=2,text=${proposal},cid=${cid}`,
  );
  await submitAfterInvoke(rawData, null, payload.title);
  return shaderResult as T;
}

export async function VoteProposal<T = unknown>(
  votes: number[],
  id: number,
  vote: number,
  counter: number,
): Promise<T> {
  localStorage.setItem('voteCounter', `${counter}`);
  let votesParams = '';
  for (let i = 0; i < votes.length; i++) {
    votesParams += `vote_${i + 1}=${votes[i]},`;
  }

  const { cid } = resolveCallConfig(undefined, CID);
  const req = `role=user,action=vote,${votesParams}voteCounter=${counter},cid=${cid}`;
  console.log('VOTE PROCESS: ', req);
  const { shaderResult, rawData } = await invokeRaw(req);
  await submitAfterInvoke(rawData, { id, vote }, null);
  return shaderResult as T;
}

export async function LoadUserView<T = unknown>(): Promise<T> {
  const { cid } = resolveCallConfig(undefined, CID);
  const { shaderResult } = await invokeRaw(`role=user,action=view,cid=${cid}`);
  return shaderResult.res as T;
}

export async function LoadVotes<T = unknown>(): Promise<T> {
  const { cid } = resolveCallConfig(undefined, CID);
  const { shaderResult } = await invokeRaw(`role=user,action=view_votes,cid=${cid}`);
  return shaderResult.res as T;
}

export async function UserDeposit<T = unknown>(amount: number | string): Promise<T> {
  const { cid } = resolveCallConfig(undefined, CID);
  const { shaderResult, rawData } = await invokeRaw(
    `role=user,action=move_funds,amount=${amount},bLock=1,cid=${cid}`,
  );
  await submitAfterInvoke(rawData, null, null);
  return shaderResult as T;
}

export async function UserWithdraw<T = unknown>(amount: number | string): Promise<T> {
  const { cid } = resolveCallConfig(undefined, CID);
  const { shaderResult, rawData } = await invokeRaw(
    `role=user,action=move_funds,amount=${amount},bLock=0,cid=${cid}`,
  );
  await submitAfterInvoke(rawData, null, null);
  return shaderResult as T;
}

export async function LoadAssetsList(): Promise<IAsset[]> {
  const result: any = await callApiWithRecovery('assets_list', { refresh: true });
  const raw = Array.isArray(result)
    ? result
    : Array.isArray(result?.assets)
      ? result.assets
      : [];

  const assets: IAsset[] = raw.map((a: any) => {
    const n = Number(a.asset_id ?? a.aid ?? 0);
    return {
      ...a,
      asset_id: Number.isFinite(n) ? n : 0,
    };
  });
  return assets;
}

export async function GetAssetInfo(assetId: number): Promise<IAsset | null> {
  try {
    const result: any = await callApiWithRecovery('get_asset_info', { asset_id: assetId });
    if (result == null) {
      return null;
    }
    const r = result as any;
    const id = Number(r.asset_id ?? assetId);
    const parsed =
      r.metadata_pairs && typeof r.metadata_pairs === 'object' && !Array.isArray(r.metadata_pairs)
        ? r.metadata_pairs
        : typeof r.metadata === 'string'
          ? parseMetadata(r.metadata)
          : {};
    return {
      asset_id: Number.isFinite(id) ? id : 0,
      metadata: typeof r.metadata === 'string' ? r.metadata : '',
      parsedMetadata: parsed,
    };
  } catch {
    return null;
  }
}

export async function VaultDeposit<T = unknown>(
  contractBytes: number[] | null,
  cid: string,
  aid: number,
  amount: number,
): Promise<T> {
  const { shaderResult, rawData } = await invokeRaw(
    `role=manager,action=deposit,cid=${cid},aid=${aid},amount=${amount}`,
    contractBytes,
  );
  await submitAfterInvoke(rawData, null, null);
  return shaderResult as T;
}

export async function LoadVaultFunds<T = unknown>(
  contractBytes: number[] | null,
  cid: string,
): Promise<T> {
  const { shaderResult } = await invokeRaw(`role=manager,action=view_funds,cid=${cid}`, contractBytes);
  return (shaderResult.funds ?? shaderResult.res ?? shaderResult) as T;
}

export async function LoadCoreFarmTotals<T = unknown>(
  contractBytes: number[] | null,
  cid: string,
): Promise<T> {
  const { shaderResult } = await invokeRaw(`role=manager,action=farm_totals,cid=${cid}`, contractBytes);
  return (shaderResult.res ?? shaderResult) as T;
}

export async function LoadCorePreallocTotals<T = unknown>(
  contractBytes: number[] | null,
  cid: string,
): Promise<T> {
  const { shaderResult } = await invokeRaw(`role=manager,action=prealloc_totals,cid=${cid}`, contractBytes);
  return (shaderResult.res ?? shaderResult) as T;
}
