import { SystemState } from '@core/types';

export interface SharedStateType {
  routerLink: string;
  errorMessage: string | null;
  systemState: SystemState;
  isLoaded: boolean;
}
