import { createSelector } from 'reselect';
import { AppState } from '../../../shared/interface';

const selectMain = (state: AppState) => state.main;

export const selectAppParams = () => createSelector(selectMain, (state) => state.appParams);

export const selectContractHeight = () => createSelector(selectMain, (state) => state.contractHeight);
export const selectUserView = () => createSelector(selectMain, (state) => state.userView);

export const selectPrevProposals = () => createSelector(selectMain, (state) => state.proposals.prev);
export const selectCurrentProposals= () => createSelector(selectMain, (state) => state.proposals.current);
export const selectFutureProposals = () => createSelector(selectMain, (state) => state.proposals.future);