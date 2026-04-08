import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';
import { IAsset } from '@core/types';
import * as actions from './actions';

export interface VaultFund {
  aid: number;
  amount: number;
}

export interface CoreFarmTotals {
  duration: number;
  total: number;
  total_users: number;
  avail: number;
  received: number;
  beam_locked: number;
}

export interface CorePreallocTotals {
  total: number;
  avail: number;
  received: number;
}

export interface TreasuryData {
  vaultFunds: VaultFund[];
  coreFarmTotals: CoreFarmTotals | null;
  corePreallocTotals: CorePreallocTotals | null;
  assets: IAsset[];
}

export interface TreasuryStateType {
  vaultFunds: VaultFund[];
  coreFarmTotals: CoreFarmTotals | null;
  corePreallocTotals: CorePreallocTotals | null;
  assets: IAsset[];
  isLoading: boolean;
}

type Action = ActionType<typeof actions>;

const initialState: TreasuryStateType = {
  vaultFunds: [],
  coreFarmTotals: null,
  corePreallocTotals: null,
  assets: [],
  isLoading: false,
};

const reducer = createReducer<TreasuryStateType, Action>(initialState)
  .handleAction(actions.loadTreasuryData.request, (state) =>
    produce(state, (next) => { next.isLoading = true; })
  )
  .handleAction(actions.loadTreasuryData.success, (state, action) =>
    produce(state, (next) => {
      next.isLoading = false;
      next.vaultFunds = action.payload.vaultFunds;
      next.coreFarmTotals = action.payload.coreFarmTotals;
      next.corePreallocTotals = action.payload.corePreallocTotals;
      next.assets = action.payload.assets;
    })
  )
  .handleAction(actions.loadTreasuryData.failure, (state) =>
    produce(state, (next) => { next.isLoading = false; })
  );

export { reducer as TreasuryReducer };
