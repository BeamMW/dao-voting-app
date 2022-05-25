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
    data?: any;
}

export interface ProposalStats {
    result: {
      total: number;
      stake_active: number;
      variants: number[];
    }
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
    prevVoted?: {value: number, stake: number};
    epoch?: number;
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
    voteCounter: number;
    stake_active: number;
    stake_passive: number;
}

export interface TotalViewParams {
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

interface ContractVersion {
  Height: number,
  version: number,
}
interface ManagerViewContract {
    cid: string,
    Height: number,
    version_history: ContractVersion[]
}

export interface ManagerViewData {
    contracts: ManagerViewContract[]
}

export enum TxStatusString {
    IN_PROGRESS = 'in progress',
    RECEIVING = 'receiving',
    SENDING = 'sending',
    PENDING = 'pending',
    WAITING_FOR_RECEIVER = 'waiting for receiver',
    WAITING_FOR_SENDER = 'waiting for sender',
    SENT = 'sent',
    RECEIVED = 'received',
    CANCELED = 'cancelled',
    EXPIRED = 'expired',
    FAILED = 'failed',
    COMPLETED = 'completed',
    SELF_SENDING = 'self sending',
    SENT_TO_OWN_ADDRESS = 'sent to own address',
  
    SENT_OFFLINE = 'sent offline',
    RECEIVED_OFFLINE = 'received offline',
    CANCELED_OFFLINE = 'canceled offline',
    IN_PROGRESS_OFFLINE = 'in progress offline',
    FAILED_OFFLINE = 'failed offline',
  
    SENT_MAX_PRIVACY = 'sent max privacy',
    RECEIVED_MAX_PRIVACY = 'received max privacy',
    CANCELED_MAX_PRIVACY = 'canceled max privacy',
    IN_PROGRESS_MAX_PRIVACY = 'in progress max privacy',
    FAILED_MAX_PRIVACY = 'failed max privacy',
  
    IN_PROGRESS_PUBLIC_OFFLINE = 'in progress public offline',
    FAILED_PUBLIC_OFFLINE = 'failed public offline',
    SENT_PUBLIC_OFFLINE = 'sent public offline',
    CANCELED_PUBLIC_OFFLINE = 'canceled public offline',
    RECEIVED_PUBLIC_OFFLINE = 'received public offline',
  }
  
  export enum TxStatus {
    PENDING,
    IN_PROGRESS,
    CANCELED,
    COMPLETED,
    FAILED,
    REGISTERING,
  }
  
  export enum TxType {
    SIMPLE = 0,
    ASSET_ISSUE = 2,
    ASSET_CONSUME = 3,
    ASSET_INFO = 6,
    PUSH_TX = 7,
    CONTRACT = 12,
  }
  
  export interface Amount {
    amount: number;
    asset_id: number;
  }
  export interface Contract {
    amounts?: Amount[];
    contract_id: string;
  }
  
  export interface Transaction {
    asset_id: number;
    comment: string;
    confirmations: number;
    create_time: number;
    fee: number;
    fee_only: boolean;
    height: number;
    income: boolean;
    kernel: string;
    receiver: string;
    sender: string;
    status: TxStatus;
    status_string: TxStatusString;
    txId: string;
    tx_type: TxType;
    tx_type_string: string;
    value: number;
    invoke_data: Contract[];
    appname: string;
  }
  export interface WalletChangeEvent {
    change: number;
    change_str: string;
  }
  
  export interface TxsEvent extends WalletChangeEvent {
    txs: Transaction[];
  }

  export interface PrevEpochVote {
    id1: number;
    stake: number;
    votes: number[];
  }