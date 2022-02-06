import { createAction } from 'typesafe-actions';
import { SharedActionTypes } from './constants';
import { SystemState } from '@core/types';

export const navigate = createAction(SharedActionTypes.NAVIGATE)<string>();
export const setError = createAction(SharedActionTypes.SET_ERROR)<string | null>();

export const setSystemState = createAction('@@SHARED/SET_SYSTEM_STATE')<SystemState>();