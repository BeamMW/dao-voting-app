import { createAsyncAction, createAction } from 'typesafe-actions';
import React from 'react';
import { AuthActionTypes } from './constants';
import { VotingAppParams } from '@core/types';

export const setAppParams = createAction('@@MAIN/SET_PARAMS')<VotingAppParams>();

export const loadAppParams = createAsyncAction(
    '@@MAIN/LOAD_PARAMS',
    '@@MAIN/LOAD_PARAMS_SUCCESS',
    '@@MAIN/LOAD_PARAMS_FAILURE',
)<ArrayBuffer, VotingAppParams, any>();

export const loadPoposals = createAsyncAction(
    '@@MAIN/LOAD_PROPOSALS',
    '@@MAIN/LOAD_PROPOSALS_SUCCESS',
    '@@MAIN/LOAD_PROPOSALS_FAILURE',
)<void, any, any>();