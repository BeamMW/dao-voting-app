export type Pallete = 'green' | 'ghost' | 'purple' | 'blue' | 'red' | 'white';

export type ButtonVariant = 'regular' | 'ghost' | 'block' | 'link' | 'icon';

export interface CurrentEpoch {
    iEpoch: number;
    proposals: number;
}

export interface NextEpoch {
    proposals: number;
}

export interface VotingAppParams {
    aid: number;
    current: CurrentEpoch;
    epoch_dh: number;
    is_admin: number;
    next: NextEpoch;
    total_proposals: number;
    pkAdmin: string;
}

export interface UserViewParams {
    stake_active: number;
    stake_passive: number;
}

export interface SystemState {
    current_height: number
    current_state_hash: string
    current_state_timestamp: number
    is_in_sync: boolean
    prev_state_hash: string;
    tip_height: number;
    tip_prev_state_hash: string;
    tip_state_hash: string;
    tip_state_timestamp: number;
}

interface ManagetViewContract {
    cid: string,
    Height: number,
}

export interface ManagerViewData {
    contracts: ManagetViewContract[]
}
