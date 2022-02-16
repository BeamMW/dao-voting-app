import { VotingAppParams, UserViewParams, ProcessedProposal } from '@core/types';

export interface EpochesStateType {
  appParams: VotingAppParams;
  proposals: {
    prev: ProcessedProposal[],
    current: ProcessedProposal[],
    future: ProcessedProposal[]
  };
  contractHeight: number;
  userView: UserViewParams;
  rate: number;
}
