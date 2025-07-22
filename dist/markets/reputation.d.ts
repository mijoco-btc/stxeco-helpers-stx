export declare function readReputationContractData(stacksApi: string, contractAddress: string, contractName: string): Promise<ReputationContractData>;
/**
 * Note: in practice this is read from event data in mongo @see function getUserReputationContractData(address: string)
 */
export declare function readUserReputationContractData(stacksApi: string, contractAddress: string, contractName: string, address: string): Promise<UserReputationContractData>;
export type ReputationContractData = {
    overallSupply: number;
    tokenName: string;
    tokenSymbol: string;
    rewardPerEpoch: number;
    currentEpoch: number;
    weightedSupply: number;
    totalSupplies?: Array<number>;
    tierMetaData: Record<BigRepTier, {
        label: string;
        weight: number;
    }>;
};
export type UserReputationContractData = {
    balances: Array<number>;
    overallBalance: number;
    weightedReputation: number;
    lastClaimedEpoch: number;
};
export declare enum BigRepTier {
    Newcomer = 1,
    CommunityMember = 2,
    ForumParticipant = 3,
    ContributorI = 4,
    ContributorII = 5,
    ContributorIII = 6,
    ProposalAuthor = 7,
    Facilitator = 8,
    Campaigner = 9,
    ProjectLeader = 10
}
export declare const BigRepTierMetadata: Record<BigRepTier, {
    label: string;
    weight: number;
}>;
export declare function fetchBalanceAtTier(stacksApi: string, contractAddress: string, contractName: string, address: string, tier: number): Promise<number>;
export declare function fetchBalances(stacksApi: string, contractAddress: string, contractName: string, address: string): Promise<number[]>;
export declare function fetchOverallBalance(stacksApi: string, contractAddress: string, contractName: string, address: string): Promise<any>;
export declare function fetchWeightedReputation(stacksApi: string, contractAddress: string, contractName: string, address: string): Promise<any>;
export declare function fetchLastEpochClaimed(stacksApi: string, contractAddress: string, contractName: string, address: string): Promise<any>;
export declare function fetchCurrentEpoch(stacksApi: string, contractAddress: string, contractName: string): Promise<any>;
export declare function fetchTotalSupplies(stacksApi: string, contractAddress: string, contractName: string): Promise<number[]>;
export declare function fetchWeightedSupply(stacksApi: string, contractAddress: string, contractName: string): Promise<any>;
