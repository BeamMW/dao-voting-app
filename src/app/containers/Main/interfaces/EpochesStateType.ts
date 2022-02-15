import { VotingAppParams, UserViewParams, ProposalData } from '@core/types';

export interface EpochesStateType {
  appParams: VotingAppParams;
  proposals: {
    prev: ProposalData[],
    current: ProposalData[],
    future: ProposalData[]
  };
  contractHeight: number;
  userView: UserViewParams;
}
