import { principalCV, serializeCV, uintCV } from "@stacks/transactions";
import { callContractReadOnly } from "../stacks-node";
import { extractValue } from "../predictions";

export async function readReputationContractData(stacksApi: string, contractAddress: string, contractName: string): Promise<ReputationContractData> {
  let rewardPerEpoch = await extractValue(stacksApi, contractAddress, contractName, "reward-per-epoch");
  let overallSupply = await extractValue(stacksApi, contractAddress, contractName, "overall-supply");
  let tokenName = await extractValue(stacksApi, contractAddress, contractName, "token-name");
  let tokenSymbol = await extractValue(stacksApi, contractAddress, contractName, "token-symbol");

  return {
    overallSupply,
    rewardPerEpoch,
    tokenName,
    tokenSymbol,
    currentEpoch: await fetchCurrentEpoch(stacksApi, contractAddress, contractName),
    weightedSupply: 0, //Number(await fetchWeightedSupply(stacksApi, contractAddress, contractName)),
    totalSupplies: [], //await fetchTotalSupplies(stacksApi, contractAddress, contractName),
    tierMetaData: BigRepTierMetadata,
  };
}

/**
 * Note: in practice this is read from event data in mongo @see function getUserReputationContractData(address: string)
 */
export async function readUserReputationContractData(stacksApi: string, contractAddress: string, contractName: string, address: string): Promise<UserReputationContractData> {
  return {
    balances: await fetchBalances(stacksApi, contractAddress, contractName, address),
    overallBalance: await fetchOverallBalance(stacksApi, contractAddress, contractName, address),
    weightedReputation: await fetchWeightedReputation(stacksApi, contractAddress, contractName, address),
    lastClaimedEpoch: await fetchLastEpochClaimed(stacksApi, contractAddress, contractName, address),
  };
}

export type ReputationContractData = {
  overallSupply: number;
  tokenName: string;
  tokenSymbol: string;
  rewardPerEpoch: number;
  currentEpoch: number;
  weightedSupply: number;
  totalSupplies?: Array<number>;
  tierMetaData: Record<BigRepTier, { label: string; weight: number }>;
};

export type UserReputationContractData = {
  balances: Array<number>;
  overallBalance: number;
  weightedReputation: number;
  lastClaimedEpoch: number;
};

export enum BigRepTier {
  Newcomer = 1,
  CommunityMember,
  ForumParticipant,
  ContributorI,
  ContributorII,
  ContributorIII,
  ProposalAuthor,
  Facilitator,
  Campaigner,
  ProjectLeader,
  //   ProjectLeadII,
  //   CoreMaintainer,
  //   EcosystemAdvisorI,
  //   EcosystemAdvisorII,
  //   StrategicPartner,
  //   StewardI,
  //   StewardII,
  //   MultiRoleContributor,
  //   Founder,
  //   ExecutiveLead,
}
export const BigRepTierMetadata: Record<BigRepTier, { label: string; weight: number }> = {
  [BigRepTier.Newcomer]: { label: "Newcomer", weight: 1 },
  [BigRepTier.CommunityMember]: { label: "Community member", weight: 1 },
  [BigRepTier.ForumParticipant]: { label: "Forum participant", weight: 1 },

  [BigRepTier.ContributorI]: { label: "Contributor I", weight: 2 },
  [BigRepTier.ContributorII]: { label: "Contributor II", weight: 2 },
  [BigRepTier.ContributorIII]: { label: "Contributor III", weight: 2 },

  [BigRepTier.ProposalAuthor]: { label: "Proposal author", weight: 3 },
  [BigRepTier.Facilitator]: { label: "Facilitator", weight: 3 },
  [BigRepTier.Campaigner]: { label: "Campaigner", weight: 3 },

  [BigRepTier.ProjectLeader]: { label: "Project Lead", weight: 5 },
  //   [BigRepTier.ProjectLeadII]: { label: "Project Lead II", weight: 5 },
  //   [BigRepTier.CoreMaintainer]: { label: "Core Maintainer", weight: 5 },

  //   [BigRepTier.EcosystemAdvisorI]: { label: "Ecosystem Advisor I", weight: 8 },
  //   [BigRepTier.EcosystemAdvisorII]: { label: "Ecosystem Advisor II", weight: 8 },
  //   [BigRepTier.StrategicPartner]: { label: "Strategic Partner", weight: 8 },

  //   [BigRepTier.StewardI]: { label: "Steward I", weight: 13 },
  //   [BigRepTier.StewardII]: { label: "Steward II", weight: 13 },
  //   [BigRepTier.MultiRoleContributor]: { label: "Multi-role Contributor", weight: 13 },

  //   [BigRepTier.Founder]: { label: "Founder", weight: 21 },
  //   [BigRepTier.ExecutiveLead]: { label: "Executive DAO Lead", weight: 21 },
};

export async function fetchBalanceAtTier(stacksApi: string, contractAddress: string, contractName: string, address: string, tier: number): Promise<number> {
  const data = {
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: "get-balance",
    functionArgs: [`0x${serializeCV(uintCV(tier))}`, `0x${serializeCV(principalCV(address))}`],
  };
  const result = await callContractReadOnly(stacksApi, data);
  console.log("fetchBalanceAtTier: tier: " + tier, result);
  return Number(result.value?.value || 0);
}
export async function fetchBalances(stacksApi: string, contractAddress: string, contractName: string, address: string): Promise<number[]> {
  const supplies: number[] = [];

  for (let tokenId = 1; tokenId <= 10; tokenId++) {
    try {
      const value = await fetchBalanceAtTier(stacksApi, contractAddress, contractName, address, tokenId);
      supplies.push(Number(value));
    } catch (err) {
      console.error(`Failed to fetch supply for tokenId ${tokenId}:`, err);
      supplies.push(0);
    }
  }
  return supplies;
}

export async function fetchOverallBalance(stacksApi: string, contractAddress: string, contractName: string, address: string): Promise<any> {
  const data = {
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: "get-overall-balance",
    functionArgs: [`0x${serializeCV(principalCV(address))}`],
  };
  const result = await callContractReadOnly(stacksApi, data);
  return Number(result.value?.value || 0);
}

export async function fetchWeightedReputation(stacksApi: string, contractAddress: string, contractName: string, address: string): Promise<any> {
  const data = {
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: "get-weighted-rep",
    functionArgs: [`0x${serializeCV(principalCV(address))}`],
  };
  const result = await callContractReadOnly(stacksApi, data);
  return Number(result.value?.value || 0);
}

export async function fetchLastEpochClaimed(stacksApi: string, contractAddress: string, contractName: string, address: string): Promise<any> {
  const data = {
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: "get-last-claimed-epoch",
    functionArgs: [`0x${serializeCV(principalCV(address))}`],
  };
  const result = await callContractReadOnly(stacksApi, data);
  return Number(result.value?.value || 0);
}

export async function fetchCurrentEpoch(stacksApi: string, contractAddress: string, contractName: string): Promise<any> {
  const data = {
    contractAddress,
    contractName,
    functionName: "get-epoch",
    functionArgs: [],
    // functionArgs: [`0x${serializeCV(principalCV(marketContract))}`, `0x${serializeCV(uintCV(marketId))}`]
  };
  const result = await callContractReadOnly(stacksApi, data);
  console.log("fetchCurrentEpoch: ", result);
  return Number(result.value || "0");
}

export async function fetchTotalSupplies(stacksApi: string, contractAddress: string, contractName: string): Promise<number[]> {
  const supplies: number[] = [];

  for (let tokenId = 1; tokenId <= 10; tokenId++) {
    const data = {
      contractAddress,
      contractName,
      functionName: "get-total-supply",
      functionArgs: [`0x${serializeCV(uintCV(tokenId))}`], // SIP-013 total supply takes token-id as argument
    };

    try {
      const result = await callContractReadOnly(stacksApi, data);
      const value = result?.value?.value;
      supplies.push(Number(value));
    } catch (err) {
      console.error(`Failed to fetch supply for tokenId ${tokenId}:`, err);
      supplies.push(0); // fallback
    }
  }

  return supplies;
}

export async function fetchWeightedSupply(stacksApi: string, contractAddress: string, contractName: string): Promise<any> {
  const data = {
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: "get-weighted-supply",
    functionArgs: [],
  };
  const result = await callContractReadOnly(stacksApi, data);
  return result.value.value;
}

// async function extractValue(stacksApi: string, contractAddress: string, contractName: string, varName: string) {
//   try {
//     let token = await fetchDataVar(stacksApi, contractAddress, contractName, varName);

//     if (token.data && token.data === "0x04") return false;
//     else if (token.data && token.data === "0x03") return true;

//     const cv = (deserializeCV(token.data) as any).value;
//     if (typeof cv === "object") {
//       return cv.value.value;
//     } else if (typeof cv === "bigint") {
//       return Number(cv);
//     }
//     return cv;
//   } catch (err) {
//     return null;
//   }
// }
