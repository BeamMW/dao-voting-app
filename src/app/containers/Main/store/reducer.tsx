import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';

import { EpochesStateType } from '../interfaces';
import * as actions from './actions';

type Action = ActionType<typeof actions>;

const initialState: EpochesStateType = {
  appParams: {
    aid: 0,
    current: {
      iEpoch: 0,
      proposals: 0
    },
    epoch_dh: 0,
    is_admin: 0,
    next: {
      proposals: 0
    },
    total_proposals: 0,
    pkAdmin: ''
  },
  is_moderator: false,
  public_key: '',
  blocks_left: null,
  proposals: {
    prev: {
      items: [],
      is_active: false,
    },
    current: {
      items: [],
      is_active: true,
    },
    future: {
      items: [],
      is_active: false,
    }
  },
  contractHeight: 0,
  userView: {
    stake_active: 0,
    stake_passive: 0,
    voteCounter: 0
  },
  totalsView: {
    stake_active: 0,
    stake_passive: 0
  },
  rate: 0,
  popupsState: {
    withdraw: false,
    deposit: false,
    pkey: false
  },
  prevEpoches: [],
  withdrawedAmount: 0,
  depositedAmount: 0,
  filterEpochSelected: 0,
  localVoteData: {
    state: [],
    counter: 0
  }
};

const reducer = createReducer<EpochesStateType, Action>(initialState)
  .handleAction(actions.setUserView, (state, action) => produce(state, (nexState) => {
    nexState.userView = action.payload;
  }))
  .handleAction(actions.setTotals, (state, action) => produce(state, (nexState) => {
    nexState.totalsView = action.payload;
  }))
  .handleAction(actions.setIsModerator, (state, action) => produce(state, (nexState) => {
    nexState.is_moderator = action.payload;
  }))
  .handleAction(actions.setPublicKey, (state, action) => produce(state, (nexState) => {
    nexState.public_key = action.payload;
  }))
  .handleAction(actions.setPrevProposals, (state, action) => produce(state, (nexState) => {
    if (state.proposals.prev.items.length) {
      let proposals = state.proposals.prev.items;
      action.payload.map((item) => {
        const isPrev = state.proposals.prev.items.find((prev) => prev.id === item.id);
        if (!isPrev) {
          proposals = [item, ...proposals];
        }
      });
      nexState.proposals.prev.items = proposals;
    } else {
      nexState.proposals.prev.items = action.payload;
    }
  }))
  .handleAction(actions.setCurrentProposals, (state, action) => produce(state, (nexState) => {
    nexState.proposals.current.items = action.payload;
  }))
  .handleAction(actions.setFutureProposals, (state, action) => produce(state, (nexState) => {
    nexState.proposals.future.items = action.payload;
  }))
  .handleAction(actions.setProposalsState, (state, action) => produce(state, (nexState) => {
    nexState.proposals[action.payload.type].is_active = action.payload.is_active;
  }))
  .handleAction(actions.loadPrevProposalStats, (state, action) => produce(state, (nexState) => {
    nexState.proposals.prev.items[action.payload.propId].stats = action.payload.stats;
  }))
  .handleAction(actions.setIsPassed, (state, action) => produce(state, (nexState) => {
    nexState.proposals.prev.items[action.payload.propId]['is_passed'] = action.payload.isPassed;
  }))
  .handleAction(actions.setPrevEpoches, (state, action) => produce(state, (nexState) => {
    nexState.prevEpoches = action.payload;
  }))
  .handleAction(actions.loadAppParams.success, (state, action) => produce(state, (nexState) => {
    nexState.appParams = action.payload;
  }))
  .handleAction(actions.loadPoposals.success, (state, action) => produce(state, (nexState) => {
    //nexState.appParams = action.payload;
  }))
  .handleAction(actions.loadRate.success, (state, action) => produce(state, (nexState) => {
    nexState.rate = action.payload;
  }))
  .handleAction(actions.loadContractInfo.success, (state, action) => produce(state, (nexState) => {
    nexState.contractHeight = action.payload;
  }))
  .handleAction(actions.setPopupState, (state, action) => produce(state, (nexState) => {
    nexState.popupsState[action.payload.type] = action.payload.state;
  }))
  .handleAction(actions.setBlocksLeft, (state, action) => produce(state, (nexState) => {
    nexState.blocks_left = action.payload;
  }))
  .handleAction(actions.setWithdrawedAmount, (state, action) => produce(state, (nexState) => {
    nexState.withdrawedAmount = action.payload;
  }))
  .handleAction(actions.setDepositedAmount, (state, action) => produce(state, (nexState) => {
    nexState.depositedAmount = action.payload;
  }))
  .handleAction(actions.setLocalVoteCounter, (state, action) => produce(state, (nexState) => {
    nexState.localVoteData.counter = action.payload;
  }))
  .handleAction(actions.setFitlerEpoch, (state, action) => produce(state, (nexState) => {
    nexState.filterEpochSelected = action.payload;
  }));

export { reducer as MainReducer };
