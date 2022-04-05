export type Pallete = 'green' | 'ghost' | 'purple' | 'blue' | 'red' | 'white' | 'vote-red';

export type ButtonVariant = 'regular' | 'ghost' | 'ghostBordered' | 'block' | 'link' | 'icon';

export interface CurrentEpoch {
    iEpoch: number;
    proposals: number;
}

export interface NextEpoch {
    proposals: number;
}

interface Quorum {
    type: string;
    value: number;
}

export interface InitialProposal {
    id: number;
    height: number;
    text: string;
    variants: number;
}

export interface ProposalStats {
    total: number;
    variants: number[];
}

export interface ProposalData {
    title: string;
    description: string;
    quorum?: Quorum;
    forum_link: string;
    ref_link?: string;
    timestamp?: number;
}

export interface ProcessedProposal extends InitialProposal{
    stats: ProposalStats;
    data: ProposalData;
    voted?: number;
}

export interface ProposalState {
    items: ProcessedProposal[];
    is_active: boolean;
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
    current_votes?: number[];
    stake_active: number;
    stake_passive: number;
}

export interface Moderator {
    height: number;
    pk: string;
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
