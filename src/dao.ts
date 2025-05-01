import { HeaderItem } from "./stxeco_types";
import { PoxAddress } from "./pox_types";
import { PredictionContractData } from "./predictions";
import { ContractBalances } from "./stacks-node";
import { TokenSale, TokenSalePurchase } from "./token_sale";
import { BasicEvent, ReputationContractData, StoredOpinionPoll } from "./markets";

export type DaoOverview = {
  contractData: PredictionContractData;
  reputationData?: ReputationContractData;
  scalarBalances: ContractBalances;
  contractBalances: ContractBalances;
  treasuryBalances: ContractBalances;
  tokenSale?: TokenSale;
  tokenSalePurchases?: Array<TokenSalePurchase>;
};

export type CurrentProposal = {
  _id?: string;
  configId?: number;
  contractId?: string;
  linkName?: string;
  linkAddress?: string;
};

export type HoldingsType = {
  nfts: any;
};
export type FileType = {
  name: string;
  timestamp: number;
  data: any;
};
export type TabType = {
  label: string;
  value: number;
  component: any;
};
export type ProfileType = {
  loggedIn: boolean;
  stxAddress: string | undefined;
};
export type ExtensionType = {
  contractId: string;
  valid: boolean;
  contract?: ProposalContract;
};
export type UserPropertyType = {
  id: string | null | undefined;
  stxAddress: string;
  value: {
    value: string | number;
  };
  contractName: string;
  functionName: string;
};
export type DaoEventEnableExtension = {
  event: string;
  event_index: number;
  daoContract: string;
  txId: string;
  extension: string;
  enabled: boolean;
};

export interface DaoEventExecuteProposal extends BasicEvent {
  event: string;
  event_index: number;
  daoContract: string;
  txId: string;
  proposal: string;
}

export interface VotingEventVoteOnProposal extends BasicEvent {
  proposal: string;
  voter: string;
  for: boolean;
  amount: number;
}

export interface VotingEventConcludeProposal extends BasicEvent {
  proposal: string;
  passed: boolean;
  proposalMeta: ProposalMeta;
  contract: ProposalContract;
  proposalData: ProposalData;
}

export interface VotingEventProposeProposal extends BasicEvent {
  submissionContract: string;
  txId: string;
  proposal: string;
  proposer: string;
  proposalMeta: ProposalMeta;
  contract: ProposalContract;
  proposalData: ProposalData;
  stackerData?: StackerProposalData;
  links?: Array<HeaderItem>;
  sip18: boolean;
}

export type StackerProposalData = {
  stacksAddressYes: string;
  stacksAddressNo: string;
  bitcoinAddressYes: string;
  bitcoinAddressNo: string;
  removed?: boolean;
  nodao: boolean;
  sip: boolean;
  reportedResults?: {
    soloFor: number;
    soloAgainst: number;
    poolFor: number;
    poolAgainst: number;
    soloAddresses: number;
    poolAddresses: number;
  };
  heights: {
    burnStart: number;
    burnEnd: number;
    stacksStart: number;
    stacksEnd: number;
  };
};

export type ProposalData = {
  concluded: boolean;
  passed: boolean;
  proposer: string;
  customMajority: number;
  endBlockHeight: number;
  startBlockHeight: number;
  votesAgainst: number;
  votesFor: number;
  burnStartHeight: number;
  burnEndHeight: number;
};

export type VoteEvent = {
  _id?: string;
  stackerData?: any;
  event: string;
  source: string;
  voter: string;
  voterProxy: string;
  for: boolean;
  amount: number;
  amountUnlocked: number;
  amountLocked: number;
  amountNested: number;
  votingContractId: string;
  proposalContractId: string;
  submitTxId: string;
  submitTxIdProxy: string;
  blockHeight: number;
  burnBlockHeight: number;
  delegateTo?: string;
  delegateTxId?: string;
  poxStacker?: string;
  poxAddr?: PoxAddress;
  reconciled: boolean;
};

export enum ProposalStage {
  UNFUNDED,
  PARTIAL_FUNDING,
  PROPOSED,
  ACTIVE,
  INACTIVE,
  CONCLUDED,
}

export type FundingData = {
  funding: number;
  parameters: {
    fundingCost: number;
    proposalDuration: number;
    proposalStartDelay: number;
  };
};

export type SignalData = {
  signals: number;
  parameters: {
    executiveSignalsRequired: number;
    executiveTeamSunsetHeight: number;
  };
};

export type GovernanceData = {
  totalSupply: number;
  userLocked: number;
  userBalance: number;
};

export type SubmissionData = {
  contractId: string;
  transaction?: any;
};
export type ProposalContract = {
  source: string;
  publish_height: number;
};
export type ProposalMeta = {
  dao: string;
  title: string;
  author: string;
  synopsis: string;
  description: string;
};
export type InFlight = {
  name?: string;
  txid?: string;
};

export type VotingAddresses = {
  yAddress: string;
  nAddress: string;
};

export type SoloPoolData = {
  soloAddresses: VotingAddresses;
  poolAddresses: VotingAddresses;
  poolVotes: Array<VoteEvent>;
  soloVotes: Array<VoteEvent>;
};

export type DaoTemplate = {
  deployer: string;
  projectName: string;
  addresses: Array<string>;
  tokenName?: string;
  tokenSymbol?: string;
  tokenUrl?: string;
};
