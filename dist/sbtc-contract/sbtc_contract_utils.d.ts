import { AddressMempoolObject, AddressObject, BalanceI, SbtcContractDataType } from '../sbtc';
export declare function fetchNoArgsReadOnly(stacksApi: string, network: string, contractId: string): Promise<SbtcContractDataType>;
export declare function fetchSbtcWalletAddress(stacksApi: string, network: string, contractId: string): Promise<any>;
export declare function fetchUserSbtcBalance(stacksApi: string, network: string, contractId: string, stxAddress: string): Promise<BalanceI>;
export declare function fetchUserBalances(stacksApi: string, mempoolApi: string, stxAddress: string, cardinal: string, ordinal: string): Promise<AddressObject>;
export declare function fetchAddress(mempoolUrl: string, address: string): Promise<AddressMempoolObject>;
export declare function getPegWalletAddressFromPublicKey(network: string, sbtcWalletPublicKey: string): string | undefined;
