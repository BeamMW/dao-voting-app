import { createSelector } from 'reselect';
import { AppState } from '../../../shared/interface';
import { ProcessedProposal } from '@core/types';

const selectMain = (state: AppState) => state.main;

export const selectAppParams = () => createSelector(selectMain, (state) => state.appParams);

export const selectContractHeight = () => createSelector(selectMain, (state) => state.contractHeight);
export const selectUserView = () => createSelector(selectMain, (state) => state.userView);
export const selectTotalsView = () => createSelector(selectMain, (state) => state.totalsView);
export const selectIsModerator = () => createSelector(selectMain, (state) => state.is_moderator);
export const selectProposal = (id: number, type: string) => createSelector(selectMain, 
    (state) => state.proposals[type].items.find((item: ProcessedProposal) => item.id === id));

export const selectPrevProposals = () => createSelector(selectMain, (state) => state.proposals.prev);
export const selectCurrentProposals= () => createSelector(selectMain, (state) => state.proposals.current);
export const selectFutureProposals = () => createSelector(selectMain, (state) => state.proposals.future);
export const selectRate = () => createSelector(selectMain, (state) => state.rate);
export const selectPopupsState = () => createSelector(selectMain, 
    (state) => state.popupsState);