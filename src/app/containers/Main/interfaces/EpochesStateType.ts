import { VotingAppParams } from '@core/types';

export interface EpochesStateType {
  appParams: VotingAppParams;
  proposals: [];
  contractHeight: number;
}
