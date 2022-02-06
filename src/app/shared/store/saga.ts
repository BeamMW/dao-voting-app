import {
  call, take, fork, takeLatest, put,
} from 'redux-saga/effects';

import { eventChannel, END } from 'redux-saga';
import { actions } from '@app/shared/store/index';
import { actions as mainActions } from '@app/containers/Main/store/index';
import { navigate, setSystemState } from '@app/shared/store/actions';
import { ROUTES, CID } from '@app/shared/constants';
import store from '../../../index';

import Utils from '@core/Utils.js';

export function remoteEventChannel() {
  return eventChannel((emitter) => {
    Utils.initialize({
      "appname": "BEAM DAO Voting app",
      "min_api_version": "6.2",
      "headless": false,
      "apiResultHandler": (error, result, full) => {
        console.log(result);
        emitter(full)
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


function* sharedSaga() {
  const remoteChannel = yield call(remoteEventChannel);

  while (true) {
    try {
      const payload: any = yield take(remoteChannel);

      switch (payload.id) {
        case 'ev_system_state':
          // trigger update
          console.log('system state update')          
          store.dispatch(setSystemState(payload.result));
          break;
        
        case 'ev_txs_changed':
          //in case in progress transacions actions

        default:
          break;
      }
    } catch (err) {
      remoteChannel.close();
    }
  }
}

export default sharedSaga;
