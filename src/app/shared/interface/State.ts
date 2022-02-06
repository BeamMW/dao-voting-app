import { SharedStateType } from '@app/shared/interface/SharedStateType';
import { EpochesStateType } from '@app/containers/Main/interfaces';

export interface AppState {
  shared: SharedStateType;
  main: EpochesStateType;
}
