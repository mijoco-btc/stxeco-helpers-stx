import { ClarityValue, ListCV } from "@stacks/transactions";
import { GateKeeper } from "../gating";
export type ScalarMarketDataItem = {
    min: number;
    max: number;
};
export type Criterion = {
    criteria: string;
    resolvesAt: number;
    sources: Array<string>;
};
export type MarketData = {
    concluded: boolean;
    creator: string;
    token: string;
    treasury: string;
    outcome?: number;
    marketFeeBips: number;
    metadataHash: string;
    categories: Array<string | ScalarMarketDataItem>;
    stakes: Array<number>;
    stakeTokens: Array<number>;
    resolutionState: number;
    resolutionBurnHeight?: number;
    marketStart?: number;
    marketDuration?: number;
    coolDownPeriod?: number;
    priceFeedId?: string;
    priceOutcome?: string;
};
export interface StoredOpinionPoll extends OpinionPoll {
    _id?: string;
    objectHash: string;
    processed: boolean;
    signature: string;
    publicKey: string;
    merkelRoot?: string;
    outcomes?: Array<string | ScalarMarketDataItem>;
    contractIds?: Array<string>;
    featured: boolean;
    forumMessageId?: string;
}
export type OpinionPoll = {
    createdAt: number;
    startBurnHeight: number;
    endBurnHeight: number;
    priceFeedId?: string;
    marketType: number;
    marketFee: number;
    marketTypeDataCategorical?: Array<MarketCategoricalOption>;
    marketTypeDataScalar?: Array<ScalarMarketDataItem>;
    name: string;
    description: string;
    category: string;
    criterion: Criterion;
    logo: string;
    proposer: string;
    token: string;
    treasury: string;
    social: {
        twitter: {
            projectHandle?: string;
        };
        discord: {
            serverId?: string;
        };
        website: {
            url?: string;
        };
    };
};
export declare function fetchMarketData(stacksApi: string, marketId: number, contractAddress: string, contractName: string): Promise<MarketData | undefined>;
export declare function getCostPerShare(stacksApi: string, marketId: number, outcome: number | string, amount: number, contractAddress: string, contractName: string): Promise<number>;
export type UserStake = {
    stakes: Array<number>;
};
export declare function fetchUserStake(stacksApi: string, marketId: number, contractAddress: string, contractName: string, user: string): Promise<UserStake | undefined>;
export declare function fetchUserTokens(stacksApi: string, marketId: number, contractAddress: string, contractName: string, user: string): Promise<UserStake | undefined>;
export type MarketCategoricalOption = {
    label: string;
    displayName?: string;
    icon?: string;
};
export declare const MARKET_BINARY_OPTION: Array<MarketCategoricalOption>;
export type MarketCategory = {
    name: string;
    information: string;
    displayName: string;
    active: boolean;
};
export declare function marketDataToTupleCV(name: string, category: string, createdAt: number, proposer: string, token: string): import("@stacks/transactions").TupleCV<import("@stacks/transactions").TupleData<import("@stacks/transactions").UIntCV | import("@stacks/transactions").StringAsciiCV | import("@stacks/transactions").PrincipalCV>>;
export type Sip10Data = {
    symbol: string;
    name: string;
    decimals: number;
    balance: number;
    totalSupply: number;
    tokenUri: string;
};
export declare enum ResolutionState {
    RESOLUTION_OPEN = 0,
    RESOLUTION_RESOLVING = 1,
    RESOLUTION_DISPUTED = 2,
    RESOLUTION_RESOLVED = 3
}
export interface BasicEvent {
    _id?: string;
    event: string;
    event_index: number;
    txId: string;
    daoContract: string;
    extension: string;
}
export interface PredictionMarketCreateEvent extends BasicEvent {
    marketId: number;
    marketType: number;
    unhashedData: StoredOpinionPoll;
    category?: string;
    resolver: string;
    disputer: string;
    daoFee: number;
    transferLosingStakes?: number;
    marketData: MarketData;
    priceOutcome?: number;
    stacksHeight?: number;
    seedAmount?: number;
}
export interface PredictionMarketStakeEvent extends BasicEvent {
    marketId: number;
    marketType: number;
    amount: number;
    index: number;
    voter: string;
    fee: number;
    cost: number;
}
export interface TokenPermissionEvent extends BasicEvent {
    marketType: number;
    allowed: boolean;
    token: string;
    sip10Data?: Sip10Data;
    minLiquidity?: number;
}
export interface PredictionMarketClaimEvent extends BasicEvent {
    marketId: number;
    marketType: number;
    claimer: string;
    indexWon: number;
    userTokensInOutcome: number;
    userSharesInOutcome: number;
    winningPool: number;
    daoFee: number;
    marketFee: number;
    totalPool: ResolutionState;
    netRefund: number;
}
export type TopMarket = {
    market: PredictionMarketCreateEvent;
    totalStakes: number;
};
export type LeaderBoard = {
    latestPredicitons: Array<PredictionMarketStakeEvent>;
    topMarkets: Array<TopMarket>;
};
export interface CorePorposalsSetTeamMemberEvent extends BasicEvent {
    who: string;
    member: boolean;
}
export interface GovernanceTokenCoreClaimEvent extends BasicEvent {
    recipient: string;
    claimed: number;
    claimable: number;
    elapsed: number;
    vested: number;
}
export interface GovernanceTokenCoreVestingEvent extends BasicEvent {
    amount: number;
    startBlock: number;
    duration: number;
    currentKey: number;
}
export interface MarketGatingAccessByAccountEvent extends BasicEvent {
    contractKey: string;
    contractName: string;
    root: string;
    leaf: string;
    sender: string;
    txsender: string;
    proofValid: boolean;
}
export interface MarketGatingUpdateRootEvent extends BasicEvent {
    hashedId: string;
    merkleRoot: string;
}
export interface MarketGatingUpdateRootByPrincipalEvent extends BasicEvent {
    contractId: string;
    contractName: string;
    contractKey: string;
    merkleRoot: string;
}
export interface MarketVotingCreateEvent extends BasicEvent {
    marketId: number;
    market: string;
    proposer: string;
    concludeTxId?: string;
    isGated: boolean;
    winningCategory: number;
}
export interface MarketVotingVoteEvent extends BasicEvent {
    marketId: number;
    voter: string;
    categoryFor: number;
    sip18: boolean;
    amount: number;
    prevMarketId?: number;
}
export interface MarketVotingConcludeEvent extends BasicEvent {
    marketId: number;
    winningCategory: number;
    result: boolean;
}
export interface TokenSaleInitialisationEvent extends BasicEvent {
}
export interface TokenSalePurchaseEvent extends BasicEvent {
    buyer: string;
    stage: number;
    tokens: number;
    stxAmount?: number;
}
export interface TokenSaleAdvanceStageEvent extends BasicEvent {
    newStage: number;
    burnStart: number;
}
export interface TokenSaleCancelStageEvent extends BasicEvent {
    stage: number;
}
export interface TokenSaleRefundEvent extends BasicEvent {
    buyer: string;
    refunded: number;
    stage: number;
}
export interface ReputationSetTierEvent extends BasicEvent {
    weight: number;
    tokenId: number;
}
export interface MarketPriceBandWidth extends BasicEvent {
    feedId: string;
    bandBips: number;
}
export interface ReputationBigClaimEvent extends BasicEvent {
    batched: boolean;
    user: string;
    epoch: number;
    amount: number;
    rewardPerEpoch: number;
}
export interface ReputationSftTransferEvent extends BasicEvent {
    tokenId: number;
    sender: string;
    recipient: string;
    amount: number;
}
export interface ReputationSftBurnEvent extends BasicEvent {
    tokenId: number;
    sender: string;
    amount: number;
}
export interface ReputationSftMintEvent extends BasicEvent {
    tokenId: number;
    recipient: string;
    amount: number;
}
export interface LiquidityContributionEvent extends BasicEvent {
    bigr: number;
    from: string;
    amount: number;
}
export declare function createBasicEvent(id: string, event: any, daoContract: string, extension: string, eventType: string): BasicEvent;
export declare function getArgsCV(gateKeeper: GateKeeper, creationGated: boolean, token: string, treasury: string, stxAddress: string, marketFee: number, dataHash: string, marketInitialLiquidity: number, priceFeedIdOrCatData: string | Array<MarketCategoricalOption>, marketDuration: number, coolDownDuration: number, hedgeStrategy?: string): Promise<ClarityValue[]>;
export declare function getClarityProofForCreateMarket(gateKeeper: GateKeeper, stxAddress: string): Promise<ListCV<ClarityValue>>;
