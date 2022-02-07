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
  proposals: [],
  contractHeight: 0
};

const reducer = createReducer<EpochesStateType, Action>(initialState)
  .handleAction(actions.loadAppParams.success, (state, action) => produce(state, (nexState) => {
    nexState.appParams = action.payload;
  }))
  .handleAction(actions.loadPoposals.success, (state, action) => produce(state, (nexState) => {
    nexState.appParams = action.payload;
  }))
  .handleAction(actions.loadContractInfo.success, (state, action) => produce(state, (nexState) => {
    nexState.contractHeight = action.payload;
  }));

export { reducer as MainReducer };
