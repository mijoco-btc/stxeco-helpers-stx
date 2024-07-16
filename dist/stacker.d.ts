import { ProposalData, VoteEvent } from "./dao";
import { PoolStackerEvent, PoxEntry, StackerInfo } from "./pox_types";
export type StacksBalance = {
    stx: {
        balance: number;
        total_sent: number;
        total_received: number;
        total_fees_sent: number;
        total_miner_rewards_received: number;
        lock_tx_id: string;
        locked: number;
        lock_height: number;
        burnchain_lock_height: number;
        burnchain_unlock_height: number;
    };
    fungible_tokens: Array<FungibleToken>;
    non_fungible_tokens: Array<NonFungibleToken>;
};
export type FungibleToken = {
    identifier: {
        balance: number;
        total_sent: number;
        total_received: number;
    };
};
export type NonFungibleToken = {
    identifier: {
        count: number;
        total_sent: number;
        total_received: number;
    };
};
export type StackerStats = {
    address: string;
    addressType: string;
    cycle: number;
    stackerInfo?: Array<StackerInfo>;
    rewardSlots?: Array<any>;
    poxEntries: Array<PoxEntry>;
    votes: Array<VoteEvent>;
    stackerEvents: Array<PoolStackerEvent>;
    stackerEventsAsDelegator?: Array<PoolStackerEvent>;
    stackerEventsAsPoxAddress?: Array<PoolStackerEvent>;
};
export type ResultAggregate = {
    _id: {
        event: string;
        for: boolean;
    };
    total: number;
    totalNested: number;
    count: number;
};
export type ResultsSummary = {
    uniqueDaoVoters: number;
    uniquePoolVoters: number;
    uniqueSoloVoters: number;
    summary: Array<ResultAggregate>;
    summaryWithZeros: Array<ResultAggregate>;
    proposalData: ProposalData;
};
