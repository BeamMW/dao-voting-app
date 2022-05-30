import { call, put, takeLatest, select } from 'redux-saga/effects';
import { navigate, setError } from '@app/shared/store/actions';
import * as selectors from './selectors';
import { ROUTES, CID, PROPOSALS, BEAMX_TVL } from '@app/shared/constants';
import { LoadViewParams, LoadProposals, LoadProposalData, 
  LoadTotals, LoadPublicKey, LoadVotes,
  LoadManagerView, LoadUserView, LoadModeratorsView } from '@core/api';

import { actions } from '.';
import store from '../../../../index';
import { VotingAppParams, ManagerViewData, UserViewParams, 
  ProposalData, InitialProposal, ProposalStats, Moderator, PrevEpochVote, ProposalState } from '@app/core/types';

import { SharedStateType } from '@app/shared/interface';
import { setIsLoaded } from '@app/shared/store/actions';
import { selectIsLoaded } from '@app/shared/store/selectors';
import { EpochesStateType, RateResponse } from '../interfaces';
import { Base64DecodeUrl, fromGroths, toGroths } from '@core/appUtils';
import { decode } from 'js-base64';

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

        const isLoaded = yield select(selectIsLoaded());
        if (!isLoaded) {
          const voteCounter = localStorage.getItem('voteCounter');
          const parsedCounter = voteCounter && voteCounter.length > 0 ? parseInt(voteCounter) : 0;
          yield put(actions.setLocalVoteCounter(parsedCounter > userView.voteCounter ? parsedCounter : userView.voteCounter));
        }
        
        const state = (yield select()) as {main: EpochesStateType, shared: SharedStateType};
        if (!state.shared.isLoaded) {
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

export function* loadProposalsSaga(
    action: ReturnType<typeof actions.loadPoposals.request>,
  ): Generator {
    try {
        const initProposals = (yield call(LoadProposals)) as InitialProposal[];
        const state = (yield select()) as {main: EpochesStateType, shared: SharedStateType};

        let proposalsData = {
          current: [],
          future: [],
          prev: [],
        };
        const nextEpochProps = state.main.appParams.next.proposals;
        const currentEpochProps = state.main.appParams.current.proposals;

        proposalsData.future = nextEpochProps > 0 ? 
          initProposals.splice(initProposals.length - nextEpochProps, nextEpochProps).reverse() : [];
        proposalsData.current = currentEpochProps > 0 ?
          initProposals.splice(initProposals.length - currentEpochProps, currentEpochProps).reverse() : [];
        proposalsData.prev = initProposals.length > 0 ? initProposals.reverse() : [];

        const prevVotes = (yield call(LoadVotes)) as PrevEpochVote[];
        let prevEpochVotes = {};
        for (let item of prevVotes) {
          item.votes.forEach((value, index) => {
            prevEpochVotes[item.id1 + index] = {value, stake: item.stake};
          });
        }

        const prevEpoches = [];
        for (let key in proposalsData) {
          const proposals = proposalsData[key];
          for (let i = 0; i < proposals.length; i++) {
            let item = proposals[i] as InitialProposal;
            if (key !== PROPOSALS.PREV) {
              const proposalRes = (yield call(LoadProposalData, item.id)) as ProposalStats;
              item['stats'] = proposalRes;
            } else {
              item['stats'] = null;
            }
            item['data'] = {};
            try {
              item['data'] = JSON.parse(decode(Base64DecodeUrl(item.text))) as ProposalData;
            } catch (e) {
              console.log(e)
            }

            if (key === PROPOSALS.CURRENT) {
              const userViewData = state.main.userView;
              if (userViewData.current_votes !== undefined && userViewData.current_votes.length > 0) {
                item['voted'] = state.main.userView.current_votes[proposals.length - i - 1];
              }
            }

            if (key === PROPOSALS.PREV) {
              item['is_passed'] = null;
              item['prevVoted'] = prevEpochVotes[item.id - 1] ? prevEpochVotes[item.id - 1] : null;
              item['epoch'] = Math.ceil((item.height - state.main.contractHeight) / state.main.appParams.epoch_dh) + 1;

              if (prevEpoches.indexOf(item['epoch']) === -1) {
                prevEpoches.push(item['epoch']);
              }
            }
          }

          if (key === PROPOSALS.CURRENT) {
            yield put(actions.setCurrentProposals(proposalsData.current.reverse()));
            const isLoaded = yield select(selectIsLoaded());
            if (!isLoaded) {
              store.dispatch(setIsLoaded(true));
            }
          } else if (key === PROPOSALS.FUTURE) {
            yield put(actions.setFutureProposals(proposalsData.future));
          } else if (key === PROPOSALS.PREV) {
            yield put(actions.setPrevProposals(proposalsData.prev));
          }
        }
        yield put(actions.setPrevEpoches(prevEpoches));


        const prevProposalsList = ((yield select(selectors.selectPrevProposals())) as ProposalState).items;
        for (let i = 0; i < prevProposalsList.length; i++) {
          const prevProposal = prevProposalsList[i];
          if (!prevProposal['stats']) {
            const stats = (yield call(LoadProposalData, prevProposal.id)) as ProposalStats;
            yield put(actions.loadPrevProposalStats({propId: i, stats}));

            if (prevProposal.data.quorum !== undefined) {
              if (prevProposal.data.quorum.type === 'beamx') {
                yield put(actions.setIsPassed({propId: i, isPassed: stats.result.variants[1] > toGroths(prevProposal.data.quorum.value)}));
              } else if (prevProposal.data.quorum.type === 'percent') {
                const isPassed = fromGroths(stats.result.variants[1]) > (BEAMX_TVL * (prevProposal.data.quorum.value / 100));
                yield put(actions.setIsPassed({propId: i, isPassed: isPassed}));
              }
            } else {
              yield put(actions.setIsPassed({propId: i, isPassed: stats.result.variants[1] > stats.result.variants[0]}));
            }
          }
        }

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
            yield put(actions.loadContractInfo.success(contract.version_history[0].Height));
        }

        const state = (yield select()) as {main: EpochesStateType, shared: SharedStateType};
        const epochEndsHeight = state.main.appParams.epoch_dh * state.main.appParams.current.iEpoch 
          + contract.version_history[0].Height;
        const epochStartsHeight = epochEndsHeight - state.main.appParams.epoch_dh;
        const blocksLeft = epochEndsHeight - state.shared.systemState.current_height;

        if (blocksLeft > 0) {
          yield put(actions.setBlocksLeft(blocksLeft));
        }

        let withdrawedAmount = 0;
        let depositedAmount = 0;
        for (let tr of state.shared.transactions) {
          if (tr.comment === 'dao-vote move funds' && tr.height >= epochStartsHeight && tr.height < epochEndsHeight) {
            if (tr.income) {
              withdrawedAmount += tr.invoke_data[0].amounts[0].amount * -1;
            } else {
              depositedAmount += tr.invoke_data[0].amounts[0].amount;
            }
          }
        }
        yield put(actions.setWithdrawedAmount(withdrawedAmount));
        yield put(actions.setDepositedAmount(depositedAmount));
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
