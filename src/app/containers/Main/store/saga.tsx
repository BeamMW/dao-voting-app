import { call, put, takeLatest, select } from 'redux-saga/effects';
import { navigate, setError } from '@app/shared/store/actions';
import { ROUTES, CID } from '@app/shared/constants';
import { LoadViewParams, LoadProposals, LoadProposalData, LoadTotals, LoadPublicKey,
  LoadManagerView, LoadUserView, LoadModeratorsView } from '@core/api';

import { actions } from '.';
import store from '../../../../index';
import { VotingAppParams, ManagerViewData, UserViewParams, 
  ProposalData, InitialProposal, ProposalStats, Moderator } from '@app/core/types';

import { SharedStateType } from '@app/shared/interface';
import { setIsLoaded } from '@app/shared/store/actions';
import { EpochesStateType, RateResponse } from '../interfaces';

const FETCH_INTERVAL = 310000;
const API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const RATE_PARAMS = 'ids=beam&vs_currencies=usd';

export function* handleParams(payload: VotingAppParams) {
    yield put(actions.setAppParams(payload));
}

export function* loadParamsSaga(
    action: ReturnType<typeof actions.loadAppParams.request>,
  ): Generator {
    try {
        const result = (yield call(LoadViewParams, action.payload ? action.payload : null)) as VotingAppParams;
        yield put(actions.loadAppParams.success(result));
        store.dispatch(actions.loadContractInfo.request());

        const userView = (yield call(LoadUserView)) as UserViewParams;
        yield put(actions.setUserView(userView));
        
        const appParams = (yield select()) as {main: EpochesStateType, shared: SharedStateType};
        if (!appParams.shared.isLoaded) {
          yield put(navigate(ROUTES.MAIN.EPOCHS));
        }

        const pubKey = (yield call(LoadPublicKey)) as string;
        yield put(actions.setPublicKey(pubKey));

        const moderators = (yield call(LoadModeratorsView)) as Moderator[];
        if (moderators.length > 0) {
          const isMod = moderators.find((item) => item.pk === pubKey);
          yield put(actions.setIsModerator(!!isMod));
        }

        const totals = (yield call(LoadTotals)) as UserViewParams;
        yield put(actions.setTotals(totals));

        store.dispatch(actions.loadPoposals.request());
    } catch (e) {
      yield put(actions.loadAppParams.failure(e));
    }
}

function Base64DecodeUrl(str){
  if (str.length % 4 != 0)
    str += ('===').slice(0, 4 - (str.length % 4));
  return str.replace(/-/g, '+').replace(/_/g, '/');
}

export function* loadProposalsSaga(
    action: ReturnType<typeof actions.loadPoposals.request>,
  ): Generator {
    try {
        const initProposals = (yield call(LoadProposals)) as InitialProposal[];
        const appParams = (yield select()) as {main: EpochesStateType, shared: SharedStateType};
        //yield call(AddProposal)
        //yield call(VoteProposal)

        let proposalsData = {
          prev: [],
          current: [],
          next: []
        };
        const nextEpochProps = appParams.main.appParams.next.proposals;
        const currentEpochProps = appParams.main.appParams.current.proposals;

        if (nextEpochProps > 0) {
          proposalsData.next = initProposals.splice(initProposals.length - nextEpochProps, nextEpochProps);

          for ( let item of proposalsData.next ) {
            const proposalRes = (yield call(LoadProposalData, item.id)) as ProposalStats;
            item['stats'] = proposalRes;
            item['data'] = {};
            try {
              item['data'] = JSON.parse(window.atob(Base64DecodeUrl(item.text)));
            } catch (e) {
              console.log(e)
            }
          }
        }
        yield put(actions.setFutureProposals(proposalsData.next));

        if (currentEpochProps > 0) {
          proposalsData.current = initProposals.splice(initProposals.length - currentEpochProps, currentEpochProps);

          for ( let item of proposalsData.current ) {
            const proposalRes = (yield call(LoadProposalData, item.id)) as ProposalStats;
            item['stats'] = proposalRes;
            item['data'] = {};
            try {
              item['data'] = JSON.parse(window.atob(Base64DecodeUrl(item.text)));
            } catch (e) {
              console.log(e)
            }
          }
        }
        yield put(actions.setCurrentProposals(proposalsData.current));

        if (!appParams.shared.isLoaded) {
          store.dispatch(setIsLoaded(true));
        }

        if (initProposals.length > 0) {
          proposalsData.prev = initProposals;

          for ( let item of proposalsData.prev ) {
            const proposalRes = (yield call(LoadProposalData, item.id)) as ProposalStats;
            item['stats'] = proposalRes;
            item['data'] = {};
            try {
              item['data'] = JSON.parse(window.atob(Base64DecodeUrl(item.text)));
            } catch (e) {
              console.log(e)
            }
          }
        }
        yield put(actions.setPrevProposals(proposalsData.prev));
        yield put(actions.loadPoposals.success(true));
    } catch (e) {
      yield put(actions.loadPoposals.failure(e));
    }
}

export function* loadContractInfoSaga(
    action: ReturnType<typeof actions.loadContractInfo.request>,
  ): Generator {
    try {
        const managerViewData = (yield call(LoadManagerView)) as ManagerViewData;
        const contract = managerViewData.contracts.find((item)=>item.cid === CID);
        if (contract) {
            yield put(actions.loadContractInfo.success(contract.Height));
        }
    } catch (e) {
      yield put(actions.loadContractInfo.failure(e));
    }
}

async function loadRatesApiCall() {
  const response = await fetch(`${API_URL}?${RATE_PARAMS}`);
  const promise: RateResponse = await response.json();
  return promise.beam.usd;
}

export function* loadRate() {
  try {
    const result: number = yield call(loadRatesApiCall);

    yield put(actions.loadRate.success(result));
    setTimeout(() => store.dispatch(actions.loadRate.request()), FETCH_INTERVAL);
  } catch (e) {
    yield put(actions.loadRate.failure(e));
  }
}

function* mainSaga() {
    yield takeLatest(actions.loadAppParams.request, loadParamsSaga);
    yield takeLatest(actions.loadPoposals.request, loadProposalsSaga);
    yield takeLatest(actions.loadContractInfo.request, loadContractInfoSaga);
    yield takeLatest(actions.loadRate.request, loadRate);
}

export default mainSaga;
