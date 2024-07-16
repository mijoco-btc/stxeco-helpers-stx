import { UserSession } from '@stacks/connect';
import { AddressObject, ExchangeRate } from '../sbtc';
import * as btc from '@scure/btc-signer';
export declare const userSession: UserSession;
export declare function getBalances(stacksApi: string, mempoolApi: string, contractId: string, stxAddress: string, cardinal: string, ordinal: string): Promise<AddressObject>;
export declare function isXverse(): boolean;
export declare function isHiro(): boolean;
export declare function isAsigna(): boolean;
export declare function isLeather(): boolean;
export declare function appDetails(): {
    name: string;
    icon: string;
};
export declare function isLoggedIn(): boolean;
export declare function getStacksAddress(network: string): any;
export declare function loginStacks(appDetails: {
    name: string;
    icon: string;
}, callback: any): Promise<void>;
export declare function loginStacksFromHeader(document: any): any;
export declare function logUserOut(): void;
export declare function checkAddressForNetwork(net: string, address: string | undefined): void;
export declare function decodeStacksAddress(stxAddress: string): [number, string];
export declare function encodeStacksAddress(network: string, b160Address: string): string;
export declare function verifyStacksPricipal(network: string, stacksAddress?: string): string;
export declare function getNet(network: string): {
    bech32: string;
    pubKeyHash: number;
    scriptHash: number;
    wif: number;
};
export declare const REGTEST_NETWORK: typeof btc.NETWORK;
export declare function makeFlash(el1: HTMLElement | null): void;
export declare function isLegal(routeId: string): boolean;
export declare function verifyAmount(amount: number, balance: number): void;
export declare function verifySBTCAmount(amount: number, balance: number, fee: number): void;
export declare function initAddresses(network: string, sessionStore: any): void;
export declare function initApplication(stacksApi: string, mempoolApi: string, network: string, sessionStore: any, exchangeRates: Array<ExchangeRate>, ftContract: string): Promise<void>;
