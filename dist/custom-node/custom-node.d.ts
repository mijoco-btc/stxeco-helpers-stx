import { WalletBalances } from "../sbtc";
export declare function getWalletBalances(stacksApi: string, mempoolApi: string, stxAddress: string, cardinal: string, ordinal: string): Promise<WalletBalances>;
export declare function getBalanceAtHeight(stacksApi: string, stxAddress: string, height: number): Promise<any>;
