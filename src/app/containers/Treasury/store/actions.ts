import { createAsyncAction } from 'typesafe-actions';
import { TreasuryData } from './reducer';

export const loadTreasuryData = createAsyncAction(
  '@@TREASURY/LOAD_DATA',
  '@@TREASURY/LOAD_DATA_SUCCESS',
  '@@TREASURY/LOAD_DATA_FAILURE',
)<void, TreasuryData, any>();
