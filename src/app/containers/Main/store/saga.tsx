import { call, put, takeLatest, select } from 'redux-saga/effects';
import { navigate, setError } from '@app/shared/store/actions';
import { ROUTES, CID } from '@app/shared/constants';
import { LoadViewParams, LoadProposals, LoadProposalData, 
  LoadManagerView, UserDeposit, UserWithdraw,
  AddProposal, LoadUserView, VoteProposal } from '@core/api';

import { actions } from '.';
import store from '../../../../index';
import { VotingAppParams, ManagerViewData, UserViewParams, ProposalData, InitialProposal, ProposalStats } from '@app/core/types';

import { SharedStateType } from '@app/shared/interface';
import { EpochesStateType } from '../interfaces';

export function* handleParams(payload: VotingAppParams) {
    yield put(actions.setAppParams(payload));
}

export function* loadParamsSaga(
    action: ReturnType<typeof actions.loadAppParams.request>,
  ): Generator {
    try {
        const result = (yield call(LoadViewParams, action.payload)) as VotingAppParams;
        yield put(actions.loadAppParams.success(result));
        store.dispatch(actions.loadContractInfo.request());

        const userView = (yield call(LoadUserView)) as UserViewParams;
        yield put(actions.setUserView(userView));

        yield put(navigate(ROUTES.MAIN.EPOCHES));

        store.dispatch(actions.loadPoposals.request());
    } catch (e) {
      yield put(actions.loadAppParams.failure(e));
    }
}

export function* loadProposalsSaga(
    action: ReturnType<typeof actions.loadPoposals.request>,
  ): Generator {
    try {

        //yield call(AddProposal)

        const initProposals = (yield call(LoadProposals)) as InitialProposal[];

        const appParams = (yield select()) as {main: EpochesStateType, shared: SharedStateType};
        console.log('params', appParams.main.appParams);

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
              item['data'] = JSON.parse(item.text.replaceAll('±', ','));
            } catch (e) {
              
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
              item['data'] = JSON.parse(item.text.replaceAll('±', ','));
            } catch (e) {

            }
          }
        }
        yield put(actions.setCurrentProposals(proposalsData.current));

        if (initProposals.length > 0) {
          proposalsData.prev = initProposals;

          for ( let item of proposalsData.prev ) {
            const proposalRes = (yield call(LoadProposalData, item.id)) as ProposalStats;
  
            item['stats'] = proposalRes;
            item['data'] = {};
            try {
              item['data'] = JSON.parse(item.text.replaceAll('±', ','));
            } catch (e) {

            }
          }
        }
        yield put(actions.setPrevProposals(proposalsData.prev));
    
        console.log(proposalsData);

        yield put(actions.loadPoposals.success(true))

        //const prop = proposals[proposals.length - 1].text;
        //console.log('latest proposal: ', 

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

function* mainSaga() {
    yield takeLatest(actions.loadAppParams.request, loadParamsSaga);
    yield takeLatest(actions.loadPoposals.request, loadProposalsSaga);
    yield takeLatest(actions.loadContractInfo.request, loadContractInfoSaga);
}

export default mainSaga;
