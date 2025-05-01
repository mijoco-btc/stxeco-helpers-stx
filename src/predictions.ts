import { deserializeCV, principalCV, serializeCV, uintCV } from "@stacks/transactions";
import { callContractReadOnly, fetchDataVar } from "./stacks-node";

export type ResolutionVote = {
  marketContract: string;
  marketId: number;
  proposer: string;
  endBurnHeight: number;
  isGated: boolean;
  concluded: boolean;
  votes: Array<number>;
  numCategories: number;
  winningCategory?: number;
};
export type PredictionContractData = {
  marketCounter: number;
  disputeWindowLength: number;
  marketVotingDuration: number;
  resolutionAgent: string;
  devFeeBips: number;
  daoFeeBips: number;
  marketFeeBipsMax: number;
  marketCreateFee: number;
  devFund: string;
  daoTreasury: string;
  executiveSignalsRequired: number;
  coreTeamSunsetHeight: number;
  tokenName: string;
  tokenSymbol: string;
  tokenUri: string;
  tokenDecimals: number;
  customMajority: number;
  creationGated: boolean;
};

export async function fetchResolutionVote(stacksApi: string, marketContract: string, marketId: number, contractAddress: string, contractName: string): Promise<ResolutionVote> {
  const data = {
    contractAddress,
    contractName,
    functionName: "get-poll-data",
    functionArgs: [`0x${serializeCV(principalCV(marketContract))}`, `0x${serializeCV(uintCV(marketId))}`],
  };
  const result = await callContractReadOnly(stacksApi, data);
  const votes = result.value.value["votes"].value.map((item: any) => Number(item.value));

  return {
    marketContract,
    marketId,
    proposer: result.value.value.proposer.value,
    endBurnHeight: Number(result.value.value["end-burn-height"].value),
    isGated: false,
    concluded: Boolean(result.value.value.concluded.value),
    votes,
    numCategories: Number(result.value.value["num-categories"].value),
    winningCategory: result.value.value["winning-category"]?.value,
  };
}

export async function extractValue(stacksApi: string, contractAddress: string, contractName: string, varName: string): Promise<any> {
  const delayMs: number = 100;
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        let token = await fetchDataVar(stacksApi, contractAddress, contractName, varName);

        if (token.data && token.data === "0x04") return resolve(false);
        if (token.data && token.data === "0x03") return resolve(true);

        const cv = (deserializeCV(token.data) as any).value;
        if (typeof cv === "object") {
          resolve(cv.value.value);
        } else if (typeof cv === "bigint") {
          resolve(Number(cv));
        } else {
          resolve(cv);
        }
      } catch (err) {
        resolve(null);
      }
    }, delayMs);
  });
}

export async function readPredictionContractData(stacksApi: string, contractAddress: string, contractName: string): Promise<PredictionContractData> {
  let customMajority = await extractValue(stacksApi, contractAddress, "bme021-0-market-voting", "custom-majority");
  let marketVotingDuration = await extractValue(stacksApi, contractAddress, "bme021-0-market-voting", "voting-duration");
  let tokenUri = await extractValue(stacksApi, contractAddress, "bme000-0-governance-token", "token-uri");
  let tokenDecimals = await extractValue(stacksApi, contractAddress, "bme000-0-governance-token", "token-decimals");
  let tokenSymbol = await extractValue(stacksApi, contractAddress, "bme000-0-governance-token", "token-symbol");
  let tokenName = await extractValue(stacksApi, contractAddress, "bme000-0-governance-token", "token-name");
  let coreTeamSunsetHeight = await extractValue(stacksApi, contractAddress, "bme003-0-core-proposals", "core-team-sunset-height");
  let executiveSignalsRequired = await extractValue(stacksApi, contractAddress, "bme004-0-core-execute", "executive-signals-required");
  let marketCounter = await extractValue(stacksApi, contractAddress, contractName, "market-counter");
  let creationGated = await extractValue(stacksApi, contractAddress, contractName, "creation-gated");

  let devFeeBips = await extractValue(stacksApi, contractAddress, contractName, "dev-fee-bips");
  let daoFeeBips = await extractValue(stacksApi, contractAddress, contractName, "dao-fee-bips");
  let marketFeeBipsMax = await extractValue(stacksApi, contractAddress, contractName, "market-fee-bips-max");
  let marketCreateFee = await extractValue(stacksApi, contractAddress, contractName, "market-create-fee");

  let disputeWindowLength = await extractValue(stacksApi, contractAddress, contractName, "dispute-window-length");
  let resolutionAgent = await extractValue(stacksApi, contractAddress, contractName, "resolution-agent");
  let devFund = await extractValue(stacksApi, contractAddress, contractName, "dev-fund");
  let daoTreasury = await extractValue(stacksApi, contractAddress, contractName, "dao-treasury");
  console.log("daoTreasury:", daoTreasury);

  return {
    tokenUri,
    tokenName,
    tokenDecimals,
    tokenSymbol,
    executiveSignalsRequired,
    coreTeamSunsetHeight,
    marketCounter,
    devFeeBips,
    daoFeeBips,
    marketFeeBipsMax,
    marketCreateFee,
    disputeWindowLength,
    marketVotingDuration,
    resolutionAgent,
    devFund,
    daoTreasury,
    customMajority,
    creationGated,
  };
}
