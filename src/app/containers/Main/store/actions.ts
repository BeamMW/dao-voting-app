import { createAsyncAction, createAction } from 'typesafe-actions';
import React from 'react';
import { ProcessedProposal, UserViewParams, VotingAppParams } from '@core/types';

export const setAppParams = createAction('@@MAIN/SET_PARAMS')<VotingAppParams>();

export const setUserView = createAction('@@MAIN/SET_USER_VIEW')<UserViewParams>()

export const loadAppParams = createAsyncAction(
    '@@MAIN/LOAD_PARAMS',
    '@@MAIN/LOAD_PARAMS_SUCCESS',
    '@@MAIN/LOAD_PARAMS_FAILURE',
)<ArrayBuffer, VotingAppParams, any>();

export const loadContractInfo = createAsyncAction(
    '@@MAIN/LOAD_CONTRACT_INFO',
    '@@MAIN/LOAD_CONTRACT_INFO_SUCCESS',
    '@@MAIN/LOAD_CONTRACT_INFO_FAILURE',
)<void, number, any>();

export const loadPoposals = createAsyncAction(
    '@@MAIN/LOAD_PROPOSALS',
    '@@MAIN/LOAD_PROPOSALS_SUCCESS',
    '@@MAIN/LOAD_PROPOSALS_FAILURE',
)<void, any, any>();

export const setPrevProposals = createAction('@@MAIN/SET_PREV_PROPOSALS')<ProcessedProposal[]>()
export const setCurrentProposals = createAction('@@MAIN/SET_CURRENT_PROPOSALS')<ProcessedProposal[]>()
export const setFutureProposals = createAction('@@MAIN/SET_FUTURE_PROPOSALS')<ProcessedProposal[]>()

