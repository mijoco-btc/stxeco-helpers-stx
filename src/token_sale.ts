import { Cl, principalCV, serializeCV, uintCV } from "@stacks/transactions";
import { callContractReadOnly } from "./stacks-node";
import { extractValue } from "./predictions";

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
export async function fetchTokenSaleStages(
  stacksApi: string,
  contractAddress: string,
  contractName: string
): Promise<TokenSale> {
  const data = {
    contractAddress,
    contractName,
    functionName: "get-ido-stages",
    functionArgs: [],
  };
  const result = await callContractReadOnly(stacksApi, data);
  const stages = result.value.map((stage: any) => {
    if (stage.value) {
      return {
        cancelled: stage.value.value.cancelled.value || false,
        maxSupply: Number(stage.value.value["max-supply"].value) || 0,
        price: Number(stage.value.value.price.value) || 0,
        tokensSold: Number(stage.value.value["tokens-sold"].value) || 0,
      };
    }
  });
  let currentStageStart = await extractValue(
    stacksApi,
    contractAddress,
    contractName,
    "current-stage-start"
  );
  let currentStage = await extractValue(
    stacksApi,
    contractAddress,
    contractName,
    "current-stage"
  );

  return {
    stages,
    currentStage,
    currentStageStart,
  };
}

export async function fetchTokenSaleUserData(
  stacksApi: string,
  contractAddress: string,
  contractName: string,
  user: string,
  stage?: number
): Promise<Array<TokenSalePurchase> | TokenSalePurchase> {
  const functionArgs = stage
    ? [`0x${serializeCV(uintCV(1))}`, `0x${serializeCV(principalCV(user))}`]
    : [`0x${serializeCV(principalCV(user))}`];
  const data = {
    contractAddress,
    contractName,
    functionName: stage ? "get-ido-user-for-stage" : "get-ido-user",
    functionArgs,
  };
  const result = await callContractReadOnly(stacksApi, data);
  const purchases =
    result?.value?.map((stage: any) => {
      if (stage) {
        return {
          amount: Number(stage.value) || 0,
        };
      }
    }) || [];
  return purchases;
}
