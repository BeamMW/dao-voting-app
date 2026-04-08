import { AnyAction, combineReducers } from 'redux';
import { AppState } from '@app/shared/interface';
import { SharedReducer } from '@app/shared/store/reducer';
import { MainReducer } from '@app/containers/Main/store/reducer';
import { TreasuryReducer } from '@app/containers/Treasury/store/reducer';

export default () => {
  const appReducer = combineReducers({
    shared: SharedReducer,
    main: MainReducer,
    treasury: TreasuryReducer,
  });

  return (state: AppState | undefined, action: AnyAction) => appReducer(state, action);
};
