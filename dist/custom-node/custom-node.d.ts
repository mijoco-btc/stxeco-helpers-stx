import { WalletBalances } from "../sbtc";
export declare function getWalletBalances(api: string, stxAddress: string, cardinal: string, ordinal: string): Promise<WalletBalances>;
export declare function fetchSbtcWalletAddress(api: string): Promise<any>;
export declare function getBalanceAtHeight(api: string, stxAddress: string, height: number): Promise<any>;
export declare function getStackerInfo(api: string, address: string, cycle: number): Promise<any>;
