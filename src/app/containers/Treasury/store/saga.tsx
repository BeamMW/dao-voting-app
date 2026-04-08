import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  LoadVaultFunds,
  LoadCoreFarmTotals,
  LoadCorePreallocTotals,
  LoadAssetsList,
  GetAssetInfo,
} from '@core/api';
import { enrichAssetsWithMetadata } from '@core/appUtils';
import { actions } from '.';
import { ShaderRuntimeMap } from '@core/shaderRegistry';
import { AppState } from '@app/shared/interface';
import { TreasuryData } from './reducer';

type PromiseValue<T> = T extends PromiseLike<infer U> ? U : T;

function selectShaderRuntimeMap(state: AppState): ShaderRuntimeMap | null {
  return state.main.shaderRuntimeMap;
}

export function* loadTreasuryDataSaga(): Generator {
  try {
    const shaderMap = (yield select(selectShaderRuntimeMap)) as ShaderRuntimeMap | null;

    const daoVaultBytes = shaderMap?.daoVault?.contractBytes ?? null;
    const daoVaultCid = shaderMap?.daoVault?.cid ?? '';
    const daoCoreBytes = shaderMap?.daoCore?.contractBytes ?? null;
    const daoCoreCid = shaderMap?.daoCore?.cid ?? '';

    const [rawAssetsResult, vaultFundsResult, coreFarmResult, corePreallocResult] = (yield call(() =>
      Promise.allSettled([
        LoadAssetsList(),
        LoadVaultFunds(daoVaultBytes, daoVaultCid),
        LoadCoreFarmTotals(daoCoreBytes, daoCoreCid),
        LoadCorePreallocTotals(daoCoreBytes, daoCoreCid),
      ])
    )) as any[];

    const rawAssets = rawAssetsResult.status === 'fulfilled' ? rawAssetsResult.value : [];
    const vaultFunds = vaultFundsResult.status === 'fulfilled' ? vaultFundsResult.value : null;
    const coreFarmTotals = coreFarmResult.status === 'fulfilled' ? coreFarmResult.value : null;
    const corePreallocTotals = corePreallocResult.status === 'fulfilled' ? corePreallocResult.value : null;

    let assets = enrichAssetsWithMetadata(rawAssets || []);
    const funds = Array.isArray(vaultFunds) ? vaultFunds : [];
    const have = new Set(assets.map((a) => Number(a.asset_id)));
    const missingVaultAids = [
      ...new Set(
        funds
          .map((f: { aid?: number }) => Number(f.aid))
          .filter((id) => id > 0 && !have.has(id)),
      ),
    ];
    if (missingVaultAids.length) {
      const extra = (yield call(() =>
        Promise.all(missingVaultAids.map((id) => GetAssetInfo(id)))
      )) as (PromiseValue<ReturnType<typeof GetAssetInfo>>)[];
      const merged = extra.filter(Boolean) as typeof assets;
      assets = [...assets, ...merged];
    }

    const data: TreasuryData = {
      vaultFunds: Array.isArray(vaultFunds) ? vaultFunds : [],
      coreFarmTotals: coreFarmTotals ?? null,
      corePreallocTotals: corePreallocTotals ?? null,
      assets,
    };

    yield put(actions.loadTreasuryData.success(data));
  } catch (e) {
    yield put(actions.loadTreasuryData.failure(e));
  }
}

function* treasurySaga() {
  yield takeLatest(actions.loadTreasuryData.request, loadTreasuryDataSaga);
}

export default treasurySaga;
