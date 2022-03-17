import { VotingAppParams, UserViewParams, ProposalState } from '@core/types';

export interface EpochesStateType {
  appParams: VotingAppParams;
  proposals: {
    prev: ProposalState,
    current: ProposalState,
    future: ProposalState
  };
  is_moderator: boolean;
  public_key: string;
  contractHeight: number;
  userView: UserViewParams;
  totalsView: UserViewParams;
  rate: number;
}
