import { ObjectId } from "mongodb";
export type ScalarMarketDataItem = {
    min: number;
    max: number;
};
export type PredictionMarketCreateEvent = {
    _id: ObjectId;
    event: string;
    event_index: number;
    daoContract: string;
    txId: string;
    votingContract: string;
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
    resolutionState: number;
    resolutionBurnHeight?: number;
    marketStart?: number;
    marketDuration?: number;
    coolDownPeriod?: number;
    priceFeedId?: string;
    priceOutcome?: string;
};
export interface StoredOpinionPoll extends OpinionPoll {
    _id?: ObjectId;
    objectHash: string;
    processed: boolean;
    signature: string;
    publicKey: string;
    merkelRoot?: string;
    contractIds?: Array<string>;
    featured: boolean;
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
    criteria: string;
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
export type UserStake = {
    stakes: Array<number>;
};
export declare function fetchUserStake(stacksApi: string, marketId: number, contractAddress: string, contractName: string, user: string): Promise<UserStake | undefined>;
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
export declare function opinionPollToTupleCV(name: string, category: string, createdAt: number, proposer: string, token: string): import("@stacks/transactions").TupleCV<import("@stacks/transactions").TupleData<import("@stacks/transactions").UIntCV | import("@stacks/transactions").StringAsciiCV | import("@stacks/transactions").PrincipalCV>>;
export declare enum ResolutionState {
    RESOLUTION_OPEN = 0,
    RESOLUTION_RESOLVING = 1,
    RESOLUTION_DISPUTED = 2,
    RESOLUTION_RESOLVED = 3
}
export type PredictionMarketStakeEvent = {
    _id: ObjectId;
    event: string;
    event_index: number;
    daoContract: string;
    txId: string;
    votingContract: string;
    marketId: number;
    marketType: number;
    amount: number;
    index: number;
    voter: string;
};
export type TokenPermissionEvent = {
    _id?: ObjectId;
    event: string;
    marketType: number;
    event_index: number;
    daoContract: string;
    txId: string;
    votingContract: string;
    allowed: boolean;
    token: string;
    sip10Data?: Sip10Data;
};
export type Sip10Data = {
    symbol: string;
    name: string;
    decimals: number;
    balance: number;
    totalSupply: number;
    tokenUri: string;
};
export type PredictionMarketClaimEvent = {
    _id: ObjectId;
    event: string;
    event_index: number;
    daoContract: string;
    txId: string;
    votingContract: string;
    marketId: number;
    marketType: number;
    claimer: string;
    indexWon: number;
    userStake: number;
    userShare: number;
    winningPool: number;
    daoFee: number;
    marketFee: number;
    totalPool: ResolutionState;
};
