import { call, put, takeLatest } from 'redux-saga/effects';
import { navigate, setError } from '@app/shared/store/actions';
import { ROUTES, CID } from '@app/shared/constants';
import Utils from '@core/Utils.js';
import { LoadViewParams, LoadProposals, LoadProposalData } from '@core/api';
// import {
//   ConnectedData, Environment, NotificationType, SyncProgress,
// } from '@core/types';
//import { DatabaseSyncProgress, SyncStep } from '@app/containers/Auth/interfaces';

import { actions } from '.';
import store from '../../../../index';
import { VotingAppParams } from '@app/core/types';


export function* handleParams(payload: VotingAppParams) {
    yield put(actions.setAppParams(payload));
}

export function* loadParamsSaga(
    action: ReturnType<typeof actions.loadAppParams.request>,
  ): Generator {
    try {
        const result = (yield call(LoadViewParams, action.payload)) as VotingAppParams;
        yield put(actions.loadAppParams.success(result));
        store.dispatch(actions.loadPoposals.request());
    } catch (e) {
      yield put(actions.loadAppParams.failure(e));
    }
}

export function* loadProposalsSaga(
    action: ReturnType<typeof actions.loadPoposals.request>,
  ): Generator {
    try {
        const result = (yield call(LoadProposals)) as VotingAppParams;

        // yield put(actions.loadAppParams.success(result));
        // store.dispatch(actions.loadPoposals.request());
    } catch (e) {
      yield put(actions.loadPoposals.failure(e));
    }
}

function* mainSaga() {
    yield takeLatest(actions.loadAppParams.request, loadParamsSaga);
    yield takeLatest(actions.loadPoposals.request, loadProposalsSaga);
}

export default mainSaga;
