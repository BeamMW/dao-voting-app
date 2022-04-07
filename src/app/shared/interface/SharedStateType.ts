import { SystemState, Transaction } from '@core/types';

export interface SharedStateType {
  routerLink: string;
  errorMessage: string | null;
  systemState: SystemState;
  transactions: Transaction[];
  isLoaded: boolean;
}
