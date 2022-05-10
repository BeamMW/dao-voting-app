import {
  call, take, fork, takeLatest, put, select
} from 'redux-saga/effects';

import { eventChannel, END } from 'redux-saga';
import { actions } from '@app/shared/store/index';
import { actions as mainActions } from '@app/containers/Main/store/index';
import { navigate, setSystemState } from '@app/shared/store/actions';
import { ROUTES, CID } from '@app/shared/constants';
import store from '../../../index';
import { SharedStateType } from '../interface';
import { EpochesStateType } from '@app/containers/Main/interfaces';
import { TxsEvent } from '@core/types';

import Utils from '@core/utils.js';

export function remoteEventChannel() {
  return eventChannel((emitter) => {
    Utils.initialize({
      "appname": "BEAM DAO Voting app",
      "min_api_version": "6.2",
      "headless": false,
      "apiResultHandler": (error, result, full) => {
        console.log('api result data: ', result, full);
        if (!result.error) {
          emitter(full);
        }
      }
    }, (err) => {
        Utils.download("./votingAppShader.wasm", (err, bytes) => {
            Utils.callApi("ev_subunsub", {ev_txs_changed: true, ev_system_state: true}, 
              (error, result, full) => {
                if (result) {
                  store.dispatch(mainActions.loadAppParams.request(bytes));
                }
              }
            );
        })
    });

    const unsubscribe = () => {
      emitter(END);
    };

    return unsubscribe;
  });
}


export function* handleTransactions(payload: TxsEvent) {
  yield put(actions.setTransactions(payload.txs));
}

function* sharedSaga() {
  const remoteChannel = yield call(remoteEventChannel);

  while (true) {
    try {
      const payload: any = yield take(remoteChannel);
      switch (payload.id) {
        case 'ev_system_state':
          const appParams = (yield select()) as {main: EpochesStateType, shared: SharedStateType};
          store.dispatch(setSystemState(payload.result));

          if (appParams.shared.isLoaded) {
            store.dispatch(mainActions.loadAppParams.request(null));
          }

          break;
        
        case 'ev_txs_changed':
          yield fork(handleTransactions, payload.result);

        default:
          break;
      }
    } catch (err) {
      remoteChannel.close();
    }
  }
}

export default sharedSaga;
