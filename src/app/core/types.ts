export interface CurrentEpoch {
    id: number;
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
