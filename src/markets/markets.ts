import { ObjectId } from "mongodb";
import {
  principalCV,
  serializeCV,
  stringAsciiCV,
  tupleCV,
  uintCV,
} from "@stacks/transactions";
import { callContractReadOnly } from "../stacks-node";

export type ScalarMarketDataItem = {
  min: number;
  max: number;
};

export type PredictionMarketCreateEvent = {
  _id: ObjectId;
  event: string;
  event_index: number;
  daoContract: string;
  txId: string;
  votingContract: string;
  marketId: number;
  marketType: number;
  unhashedData: StoredOpinionPoll;
  category?: string;
  resolver: string;
  disputer: string;
  daoFee: number;
  transferLosingStakes?: number;
  marketData: MarketData;
  priceOutcome?: number;
  stacksHeight?: number;
};

export type MarketData = {
  concluded: boolean;
  creator: string;
  token: string;
  treasury: string;
  outcome?: number;
  marketFeeBips: number;
  metadataHash: string;
  categories: Array<string | ScalarMarketDataItem>;
  stakes: Array<number>;
  resolutionState: number;
  resolutionBurnHeight?: number;
  marketStart?: number;
  marketDuration?: number;
  coolDownPeriod?: number;
  priceFeedId?: string;
  priceOutcome?: string;
};

export interface StoredOpinionPoll extends OpinionPoll {
  _id?: ObjectId;
  objectHash: string;
  processed: boolean;
  signature: string;
  publicKey: string;
  merkelRoot?: string;
  contractIds?: Array<string>;
  featured: boolean;
}
export type OpinionPoll = {
  createdAt: number;
  startBurnHeight: number;
  endBurnHeight: number;
  priceFeedId?: string;
  marketType: number;
  marketFee: number;
  marketTypeDataCategorical?: Array<MarketCategoricalOption>;
  marketTypeDataScalar?: Array<ScalarMarketDataItem>;
  name: string;
  description: string;
  category: string;
  criteria: string;
  logo: string;
  proposer: string;
  token: string;
  treasury: string;
  social: {
    twitter: {
      projectHandle?: string;
    };
    discord: {
      serverId?: string;
    };
    website: {
      url?: string;
    };
  };
};

export async function fetchMarketData(
  stacksApi: string,
  marketId: number,
  contractAddress: string,
  contractName: string
): Promise<MarketData | undefined> {
  const data = {
    contractAddress,
    contractName,
    functionName: "get-market-data",
    functionArgs: [`0x${serializeCV(uintCV(marketId))}`],
  };
  try {
    const type2 = contractName.indexOf("scalar") > -1;
    const result = await callContractReadOnly(stacksApi, data);
    let categories;
    if (!type2) {
      categories = result.value.value["categories"].value.map(
        (item: any) => item.value
      );
    } else {
      categories = result.value.value["categories"].value.map((item: any) => ({
        min: Number(item.value.min.value),
        max: Number(item.value.max.value),
      }));
    }

    const stakes = result.value.value["stakes"].value.map((item: any) =>
      Number(item.value)
    );

    let resolutionBurnHeight = type2
      ? undefined
      : Number(result.value.value["resolution-burn-height"].value);

    let marketStart = type2
      ? Number(result.value.value["market-start"].value)
      : undefined;

    let marketDuration = type2
      ? Number(result.value.value["market-duration"].value)
      : undefined;

    let coolDownPeriod = type2
      ? Number(result.value.value["cool-down-period"].value)
      : undefined;

    let priceFeedId = type2
      ? result.value.value["price-feed-id"].value
      : undefined;

    return {
      concluded: Boolean(result.value.value.concluded.value),
      creator: result.value.value.creator.value,
      token: result.value.value.token.value,
      treasury: result.value.value.treasury.value,
      outcome: result.value.value.outcome?.value?.value
        ? Number(result.value.value.outcome.value.value)
        : undefined,
      marketFeeBips: Number(result.value.value["market-fee-bips"].value),
      metadataHash: result.value.value["market-data-hash"].value,
      stakes,
      categories,
      resolutionState: Number(result.value.value["resolution-state"].value),
      resolutionBurnHeight,
      marketStart,
      marketDuration,
      priceFeedId,
      coolDownPeriod,
    };
  } catch (err: any) {
    return undefined;
  }
}

export type UserStake = {
  stakes: Array<number>;
};

export async function fetchUserStake(
  stacksApi: string,
  marketId: number,
  contractAddress: string,
  contractName: string,
  user: string
): Promise<UserStake | undefined> {
  try {
    const data = {
      contractAddress,
      contractName,
      functionName: "get-stake-balances",
      functionArgs: [
        `0x${serializeCV(uintCV(marketId))}`,
        `0x${serializeCV(principalCV(user))}`,
      ],
    };
    const result = await callContractReadOnly(stacksApi, data);
    const stakes =
      result.value?.value.map((item: any) => Number(item.value)) || undefined;
    if (!result.value) return;
    return {
      stakes,
    };
  } catch (err: any) {
    return;
  }
}

export type MarketCategoricalOption = {
  label: string;
  displayName?: string;
  icon?: string;
};

// ✅ / ❌ 🟢 / 🔴 👍 / 👎 ⭕ / ❌ 🤝 Agree / 🚫 Disagree 🆗 Agree / 🛑 Disagree 📈 For / 📉 Against 1️⃣ Yes / 0️⃣ No
export const MARKET_BINARY_OPTION: Array<MarketCategoricalOption> = [
  { label: "nay", displayName: "against", icon: "👎" },
  { label: "yay", displayName: "for", icon: "👍" },
];

export type MarketCategory = {
  name: string;
  information: string;
  displayName: string;
  active: boolean;
};

export function opinionPollToTupleCV(
  name: string,
  category: string,
  createdAt: number,
  proposer: string,
  token: string
) {
  return tupleCV({
    name: stringAsciiCV(name),
    category: stringAsciiCV(category),
    createdAt: uintCV(createdAt),
    proposer: principalCV(proposer),
    token: stringAsciiCV(token),
  });
}

export enum ResolutionState {
  RESOLUTION_OPEN = 0,
  RESOLUTION_RESOLVING = 1,
  RESOLUTION_DISPUTED = 2,
  RESOLUTION_RESOLVED = 3,
}
export type PredictionMarketStakeEvent = {
  _id: ObjectId;
  event: string;
  event_index: number;
  daoContract: string;
  txId: string;
  votingContract: string;
  marketId: number;
  marketType: number;
  amount: number;
  index: number;
  voter: string;
};

export type TokenPermissionEvent = {
  _id?: ObjectId;
  event: string;
  marketType: number;
  event_index: number;
  daoContract: string;
  txId: string;
  votingContract: string;
  allowed: boolean;
  token: string;
  sip10Data?: Sip10Data;
};

export type Sip10Data = {
  symbol: string;
  name: string;
  decimals: number;
  balance: number;
  totalSupply: number;
  tokenUri: string;
};
export type PredictionMarketClaimEvent = {
  _id: ObjectId;
  event: string;
  event_index: number;
  daoContract: string;
  txId: string;
  votingContract: string;
  marketId: number;
  marketType: number;
  claimer: string;
  indexWon: number;
  userStake: number;
  userShare: number;
  winningPool: number;
  daoFee: number;
  marketFee: number;
  totalPool: ResolutionState;
};
