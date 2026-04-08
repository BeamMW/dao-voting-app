import { CID, DAO_CORE_CID, DAO_VAULT_CID } from '@app/shared/constants';

export type ShaderFeature = 'voting' | 'daoCore' | 'daoVault';

export interface ShaderRuntimeConfig {
  feature: ShaderFeature;
  cid: string;
  wasmPath: string;
  contractBytes: number[] | null;
}

export type ShaderRuntimeMap = Record<ShaderFeature, ShaderRuntimeConfig>;

const SHADER_REGISTRY: Record<ShaderFeature, Omit<ShaderRuntimeConfig, 'contractBytes'>> = {
  voting: {
    feature: 'voting',
    cid: CID,
    wasmPath: './votingAppShader.wasm',
  },
  daoCore: {
    feature: 'daoCore',
    cid: DAO_CORE_CID,
    wasmPath: './daoCoreShader.wasm',
  },
  daoVault: {
    feature: 'daoVault',
    cid: DAO_VAULT_CID,
    wasmPath: './daoVaultShader.wasm',
  },
};

export function getShaderDescriptor(feature: ShaderFeature) {
  return SHADER_REGISTRY[feature];
}

export function getShaderFeatures(): ShaderFeature[] {
  return Object.keys(SHADER_REGISTRY) as ShaderFeature[];
}

export function buildShaderRuntimeMap(
  bytesByFeature: Partial<Record<ShaderFeature, number[]>>,
): ShaderRuntimeMap {
  return {
    voting: { ...SHADER_REGISTRY.voting, contractBytes: bytesByFeature.voting || null },
    daoCore: { ...SHADER_REGISTRY.daoCore, contractBytes: bytesByFeature.daoCore || null },
    daoVault: { ...SHADER_REGISTRY.daoVault, contractBytes: bytesByFeature.daoVault || null },
  };
}
