import { PoxAddress } from "./pox";
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
export type ProposalEvent = {
    status?: {
        name: string;
        color: string;
        colorCode: string;
    };
    proposalMeta: ProposalMeta;
    contract: ProposalContract;
    proposalData: ProposalData;
    submissionData: SubmissionData;
    event: string;
    proposer: string;
    contractId: string;
    votingContract: string;
    submitTxId: string;
    funding: FundingData;
    signals?: SignalData;
    executedAt: number;
    stage: ProposalStage;
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
    stackerData?: any;
    event: string;
    voter: string;
    voterProxy: string;
    for: boolean;
    amount: number;
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
};
export declare enum ProposalStage {
    UNFUNDED = 0,
    PARTIAL_FUNDING = 1,
    PROPOSED = 2,
    ACTIVE = 3,
    INACTIVE = 4,
    CONCLUDED = 5
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
    transaction: any;
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
