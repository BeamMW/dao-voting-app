import { VotingAppParams, UserViewParams, ProposalState } from '@core/types';

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
  totalsView: UserViewParams;
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
}
