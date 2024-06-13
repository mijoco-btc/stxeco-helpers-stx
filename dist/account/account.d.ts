import { UserSession } from '@stacks/connect';
export declare const userSession: UserSession;
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
export declare function loginStacks(callback: any): Promise<void>;
export declare function loginStacksFromHeader(document: any): any;
export declare function logUserOut(): void;
export declare function checkAddressForNetwork(net: string, address: string | undefined): void;
