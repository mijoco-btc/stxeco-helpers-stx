import { StacksMainnet, StacksTestnet } from "@stacks/network";
export declare function fetchDataVar(stacksApi: string, contractAddress: string, contractName: string, dataVarName: string): Promise<any>;
export declare function getStacksNetwork(network: string): StacksMainnet | StacksTestnet;
export declare function lookupContract(stacksApi: string, contract_id: string): Promise<any>;
export declare function isConstructed(stacksApi: string, contract_id: string): Promise<any>;
export declare function fetchStacksInfo(stacksApi: string): Promise<any>;
export declare function getStacksBalances(stacksApi: string, principal: string): Promise<any>;
export declare function getPoxInfo(stacksApi: string): Promise<any>;
export declare function fetchExchangeRates(stacksApi: string): Promise<any>;
