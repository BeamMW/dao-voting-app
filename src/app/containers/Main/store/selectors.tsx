import { createSelector } from 'reselect';
import { AppState } from '../../../shared/interface';

const selectMain = (state: AppState) => state.main;

export const selectAppParams = () => createSelector(selectMain, (state) => state.appParams);

export const selectContractHeight = () => createSelector(selectMain, (state) => state.contractHeight);