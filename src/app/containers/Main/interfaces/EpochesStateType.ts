import { VotingAppParams, UserViewParams, ProposalState, TotalViewParams } from '@core/types';

export interface EpochesStateType {
  appParams: VotingAppParams;
  proposals: {
    prev: ProposalState,
    current: ProposalState,
    future: ProposalState
  };
  blocks_left: number;
  is_moderator: boolean;
  public_key: string;
  contractHeight: number;
  userView: UserViewParams;
  totalsView: TotalViewParams;
  rate: number;
  popupsState: {
    deposit: boolean;
    withdraw: boolean;
    pkey: boolean;
  },
  prevEpoches: number[];
  withdrawedAmount: number;
  depositedAmount: number;
  filterEpochSelected: number;
  localVoteData: {
    state: number[],
    counter: number
  };
}
