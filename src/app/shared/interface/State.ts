import { SharedStateType } from '@app/shared/interface/SharedStateType';
import { EpochesStateType } from '@app/containers/Main/interfaces';
import { TreasuryStateType } from '@app/containers/Treasury/store/reducer';

export interface AppState {
  shared: SharedStateType;
  main: EpochesStateType;
  treasury: TreasuryStateType;
}
