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
  proposals: {
    prev: [],
    current: [],
    future: []
  },
  contractHeight: 0,
  userView: {
    stake_active: 0,
    stake_passive: 0
  }
};

const reducer = createReducer<EpochesStateType, Action>(initialState)
  .handleAction(actions.setUserView, (state, action) => produce(state, (nexState) => {
    nexState.userView = action.payload;
  }))
  .handleAction(actions.setPrevProposals, (state, action) => produce(state, (nexState) => {
    nexState.proposals.prev = action.payload;
  }))
  .handleAction(actions.setCurrentProposals, (state, action) => produce(state, (nexState) => {
    nexState.proposals.current = action.payload;
  }))
  .handleAction(actions.setFutureProposals, (state, action) => produce(state, (nexState) => {
    nexState.proposals.future = action.payload;
  }))
  .handleAction(actions.loadAppParams.success, (state, action) => produce(state, (nexState) => {
    nexState.appParams = action.payload;
  }))
  .handleAction(actions.loadPoposals.success, (state, action) => produce(state, (nexState) => {
    //nexState.appParams = action.payload;
  }))
  .handleAction(actions.loadContractInfo.success, (state, action) => produce(state, (nexState) => {
    nexState.contractHeight = action.payload;
  }));

export { reducer as MainReducer };
