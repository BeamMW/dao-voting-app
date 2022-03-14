import { VotingAppParams, UserViewParams, ProcessedProposal } from '@core/types';

export interface EpochesStateType {
  appParams: VotingAppParams;
  proposals: {
    prev: ProcessedProposal[],
    current: ProcessedProposal[],
    future: ProcessedProposal[]
  };
  is_moderator: boolean;
  public_key: string;
  contractHeight: number;
  userView: UserViewParams;
  totalsView: UserViewParams;
  rate: number;
}
