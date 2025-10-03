import { WalletBalances } from "../sbtc";
export declare function getWalletBalances(stacksApi: string, mempoolApi: string, stxAddress: string, cardinal: string, ordinal: string, stacksHiroKey?: string): Promise<WalletBalances>;
export declare function getBalanceAtHeight(stacksApi: string, stxAddress: string, height?: number, stacksHiroKey?: string): Promise<any>;
