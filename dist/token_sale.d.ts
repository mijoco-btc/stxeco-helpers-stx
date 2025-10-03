export type TokenSalePurchase = {
    amount: number;
};
export type TokenSaleStage = {
    price: number;
    maxSupply: number;
    tokensSold: number;
    cancelled: boolean;
};
export type TokenSale = {
    stages: Array<TokenSaleStage>;
    currentStageStart: number;
    currentStage: number;
};
export declare function fetchTokenSaleStages(stacksApi: string, contractAddress: string, contractName: string, stacksHiroKey?: string): Promise<TokenSale>;
export declare function fetchTokenSaleUserData(stacksApi: string, contractAddress: string, contractName: string, user: string, stage?: number, stacksHiroKey?: string): Promise<Array<TokenSalePurchase> | TokenSalePurchase>;
