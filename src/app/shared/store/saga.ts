import {
  call, put, take, fork, select
} from 'redux-saga/effects';

import { eventChannel, END } from 'redux-saga';
import { actions } from '@app/shared/store/index';
import { actions as mainActions } from '@app/containers/Main/store/index';
import { navigate, setSystemState } from '@app/shared/store/actions';
import { ROUTES } from '@app/shared/constants';
import { buildShaderRuntimeMap, getShaderFeatures, getShaderDescriptor } from '@core/shaderRegistry';
import store from '../../../index';
import { SharedStateType } from '../interface';
import { EpochesStateType } from '@app/containers/Main/interfaces';
import { TxsEvent } from '@core/types';

import connector from '@core/connector';

const iFrameDetection = window !== window.parent;

async function warmupShaderCache(): Promise<Partial<Record<string, number[]>>> {
  const features = getShaderFeatures();
  const byteArrays = await Promise.all(
    features.map((feature) => connector.downloadShader(getShaderDescriptor(feature).wasmPath)),
  );
  const bytesByFeature: Partial<Record<string, number[]>> = {};
  features.forEach((feature, index) => {
    bytesByFeature[feature] = Array.from(byteArrays[index]);
  });
  return bytesByFeature;
}

export async function startWalletAndShaders() {
  const bytesByFeature = await warmupShaderCache();
  await connector.callApi('ev_subunsub', { ev_txs_changed: true, ev_system_state: true });
  store.dispatch(mainActions.loadAppParams.request(
    buildShaderRuntimeMap(bytesByFeature),
  ));
}

export function remoteEventChannel() {
  return eventChannel((emitter) => {
    connector.on('apiEvent', (response: unknown) => {
      if (response) {
        emitter(response);
      }
    });

    const headless = !iFrameDetection || connector.isHeadless();
    connector.connect({ headless })
      .then(() => startWalletAndShaders())
      .catch((e) => {
        console.error('Wallet connect failed', e);
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
