import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';

import { SharedStateType } from '../interface';
import * as actions from './actions';

type Action = ActionType<typeof actions>;

const initialState: SharedStateType = {
  routerLink: '',
  errorMessage: null,
  systemState: {
    current_height: 0,
    current_state_hash: '',
    current_state_timestamp: 0,
    is_in_sync: false,
    prev_state_hash: '',
    tip_height: 0,
    tip_prev_state_hash: '',
    tip_state_hash: '',
    tip_state_timestamp: 0
  },
};

const reducer = createReducer<SharedStateType, Action>(initialState)
  .handleAction(actions.navigate, (state, action) => produce(state, (nexState) => {
    nexState.routerLink = action.payload;
  }))
  .handleAction(actions.setError, (state, action) => produce(state, (nexState) => {
    nexState.errorMessage = action.payload;
  }))
  .handleAction(actions.setSystemState, (state, action) => produce(state, (nexState) => {
    nexState.systemState = action.payload;
  }));

export { reducer as SharedReducer };
