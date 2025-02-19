import { TokenBalances } from "../sbtc";
import { ClarityValue } from "@stacks/transactions";
import { PoxInfo } from "../pox_types";
import { TokenPermissionEvent } from "../markets";
export type ContractAssets = {
    limit: number;
    offset: number;
    assets: Array<ContractAsset>;
};
export type ContractAsset = {
    limit: number;
    offset: number;
    results: Array<StacksAsset>;
};
export type StacksAsset = {
    event_index: number;
    event_type: string;
    tx_id: string;
    asset: {
        asset_event_type: string;
        sender: string;
        recipient: string;
        amount: string;
    };
};
export declare function fetchContractAssets(stacksApi: string, principal: string): Promise<ContractAssets>;
export declare function fetchSip10(stacksApi: string, principal: string): Promise<ContractAssets>;
export type ContractBalances = {
    fungible_tokens: any;
    non_fungible_tokens: any;
    stx: ContractStxBalance;
};
export type ContractStxBalance = {
    balance: string;
    burnchain_lock_height: number;
    burnchain_unlock_height: number;
    estimated_balance: string;
    lock_height: number;
    lock_tx_id: string;
    locked: string;
    total_fees_sent: string;
    total_miner_rewards_received: string;
    total_received: string;
    total_sent: string;
};
export declare function fetchContractBalances(stacksApi: string, principal: string): Promise<ContractBalances>;
export declare function fetchContractStxBalance(stacksApi: string, principal: string): Promise<ContractStxBalance>;
export declare function getTransaction(stacksApi: string, tx: string): Promise<any>;
export declare function fetchDataVar(stacksApi: string, contractAddress: string, contractName: string, dataVarName: string): Promise<any>;
export declare function fetchMapEntry(stacksApi: string, contractAddress: string, contractName: string, mapName: string, lookupKey: ClarityValue): Promise<any>;
export declare function getStacksNetwork(network: string): import("@stacks/network").StacksNetwork;
export declare function lookupContract(stacksApi: string, contract_id: string): Promise<any>;
export declare function isConstructed(stacksApi: string, contract_id: string): Promise<any>;
export declare function fetchStacksInfo(stacksApi: string): Promise<any>;
export declare function getTokenBalances(stacksApi: string, principal: string): Promise<TokenBalances>;
export declare function callContractReadOnly(stacksApi: string, data: any): Promise<any>;
export declare function getStacksHeightFromBurnBlockHeight(stacksApi: string, burnHeight: number): Promise<number>;
export declare function getFirstStacksBlock(stacksApi: string, burnBlockHeight: number): Promise<{
    stacksHeight: any;
    stacksHash: any;
    indexHash: any;
    burnBlockHeight: any;
} | undefined>;
export declare function getPoxInfo(stacksApi: string): Promise<PoxInfo>;
export declare function getSip10Properties(stacksApi: string, token: TokenPermissionEvent, owner?: string): Promise<{
    symbol: any;
    name: any;
    tokenUri: any;
    decimals: number;
    totalSupply: number;
    balance: number;
}>;
export declare function getSip10Balance(stacksApi: string, token: TokenPermissionEvent, owner: string): Promise<any>;
export declare function getSip10Property(stacksApi: string, token: TokenPermissionEvent, functionName: string): Promise<any>;
