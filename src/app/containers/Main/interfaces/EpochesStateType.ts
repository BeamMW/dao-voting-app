import { VotingAppParams, UserViewParams } from '@core/types';

export interface EpochesStateType {
  appParams: VotingAppParams;
  proposals: [];
  contractHeight: number;
  userView: UserViewParams;
}
