import { createAction } from 'typesafe-actions';
import { SharedActionTypes } from './constants';
import { SystemState, Transaction } from '@core/types';

export const navigate = createAction(SharedActionTypes.NAVIGATE)<string>();
export const setError = createAction(SharedActionTypes.SET_ERROR)<string | null>();

export const setSystemState = createAction('@@SHARED/SET_SYSTEM_STATE')<SystemState>();
export const setTransactions = createAction('@@TRANSACTIONS/SET_TRANSACTIONS')<Transaction[]>();
export const setIsLoaded = createAction('@@SHARED/SET_IS_LOADED')<boolean>();