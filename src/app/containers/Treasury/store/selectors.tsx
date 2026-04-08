import { AppState } from '@app/shared/interface';

export const selectVaultFunds = () => (state: AppState) => state.treasury.vaultFunds;
export const selectCoreFarmTotals = () => (state: AppState) => state.treasury.coreFarmTotals;
export const selectCorePreallocTotals = () => (state: AppState) => state.treasury.corePreallocTotals;
export const selectTreasuryAssets = () => (state: AppState) => state.treasury.assets;
export const selectTreasuryIsLoading = () => (state: AppState) => state.treasury.isLoading;
