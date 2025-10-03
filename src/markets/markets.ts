import { bufferCV, Cl, ClarityValue, contractPrincipalCV, ListCV, listCV, noneCV, principalCV, serializeCV, someCV, stringAsciiCV, tupleCV, uintCV } from "@stacks/transactions";
import { callContractReadOnly } from "../stacks-node";
import { hexToBytes } from "@stacks/common";
import { GateKeeper, generateMerkleProof, generateMerkleTreeUsingStandardPrincipal, proofToClarityValue } from "../gating";

export type ScalarMarketDataItem = {
  min: number;
  max: number;
};
export type CriterionSources = {
  criteria: string;
  sources: Array<string>;
};

export type CriterionDays = {
  duration: number;
  coolDown: number;
  startHeight: number;
  earliest_resolution_date?: string;
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
  stakeTokens: Array<number>;
  resolutionState: number;
  resolutionBurnHeight?: number;
  marketStart?: number;
  marketDuration?: number;
  coolDownPeriod?: number;
  priceFeedId?: string;
  priceOutcome?: string;
  startPrice?: number;
};

export interface StoredOpinionPoll extends OpinionPoll {
  _id?: string;
  objectHash: string;
  processed: boolean;
  signature: string;
  publicKey: string;
  merkelRoot?: string;
  outcomes?: Array<string | ScalarMarketDataItem>;
  contractIds?: Array<string>;
  featured: boolean;
  forumMessageId?: string;
}
export type OpinionPoll = {
  createdAt: number;
  priceFeedId?: string;
  marketType: number;
  marketFee: number;
  marketTypeDataCategorical?: Array<MarketCategoricalOption>;
  marketTypeDataScalar?: Array<ScalarMarketDataItem>;
  name: string;
  description: string;
  category: string;
  liquidity: number;
  criterionSources: CriterionSources;
  criterionDays: CriterionDays;
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

export async function fetchMarketData(stacksApi: string, marketId: number, contractAddress: string, contractName: string, stacksHiroKey?: string): Promise<MarketData | undefined> {
  let sbtcContract = stacksApi.indexOf("localhost") > -1 ? "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc" : "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token";
  const data = {
    contractAddress,
    contractName,
    functionName: "get-market-data",
    functionArgs: [`0x${serializeCV(uintCV(marketId))}`],
  };
  try {
    const type2 = contractName.indexOf("scalar") > -1;
    const result = await callContractReadOnly(stacksApi, data, stacksHiroKey);
    let categories;
    if (!type2) {
      categories = result.value.value["categories"].value.map((item: any) => item.value);
    } else {
      categories = result.value.value["categories"].value.map((item: any) => ({
        min: Number(item.value.min.value),
        max: Number(item.value.max.value),
      }));
    }

    const stakes = result.value.value["stakes"].value.map((item: any) => Number(item.value));
    const stakeTokens = result.value.value["stake-tokens"].value.map((item: any) => Number(item.value));

    let resolutionBurnHeight = Number(result.value.value["resolution-burn-height"].value);

    let marketStart = Number(result.value.value["market-start"].value);

    let marketDuration = Number(result.value.value["market-duration"].value);

    let coolDownPeriod = Number(result.value.value["cool-down-period"].value);

    let priceFeedId = type2 ? result.value.value["price-feed-id"].value : undefined;

    let startPrice = type2 ? result.value.value["start-price"].value : undefined;

    return {
      concluded: Boolean(result.value.value.concluded.value),
      creator: result.value.value.creator.value,
      token: result.value.value.token?.value || sbtcContract,
      treasury: result.value.value.treasury.value,
      outcome: result.value.value.outcome?.value?.value ? Number(result.value.value.outcome.value.value) : undefined,
      marketFeeBips: Number(result.value.value["market-fee-bips"].value),
      metadataHash: result.value.value["market-data-hash"].value,
      stakes,
      stakeTokens,
      categories,
      resolutionState: Number(result.value.value["resolution-state"].value),
      resolutionBurnHeight,
      marketStart,
      marketDuration,
      priceFeedId,
      coolDownPeriod,
      startPrice,
    };
  } catch (err: any) {
    return undefined;
  }
}

export async function getCostPerShare(stacksApi: string, marketId: number, outcome: number | string, amount: number, contractAddress: string, contractName: string, stacksHiroKey?: string): Promise<number> {
  const data = {
    contractAddress,
    contractName,
    functionName: "get-share-cost",
    functionArgs: [`0x${serializeCV(uintCV(marketId))}`, typeof outcome === "string" ? `0x${serializeCV(stringAsciiCV(outcome))}` : `0x${serializeCV(uintCV(outcome))}`, `0x${serializeCV(uintCV(amount))}`],
  };
  try {
    const result = await callContractReadOnly(stacksApi, data, stacksHiroKey);
    return result.value.value.cost.value;
  } catch (err: any) {
    return -1;
  }
}

export type UserStake = {
  stakes: Array<number>;
};

export async function fetchUserStake(stacksApi: string, marketId: number, contractAddress: string, contractName: string, user: string, stacksHiroKey?: string): Promise<UserStake | undefined> {
  try {
    const data = {
      contractAddress,
      contractName,
      functionName: "get-stake-balances",
      functionArgs: [`0x${serializeCV(uintCV(marketId))}`, `0x${serializeCV(principalCV(user))}`],
    };
    const result = await callContractReadOnly(stacksApi, data, stacksHiroKey);
    const stakes = result.value?.value.map((item: any) => Number(item.value)) || undefined;
    if (!result.value) return;
    return {
      stakes,
    };
  } catch (err: any) {
    return;
  }
}

export async function fetchUserTokens(stacksApi: string, marketId: number, contractAddress: string, contractName: string, user: string, stacksHiroKey?: string): Promise<UserStake | undefined> {
  try {
    const data = {
      contractAddress,
      contractName,
      functionName: "get-token-balances",
      functionArgs: [`0x${serializeCV(uintCV(marketId))}`, `0x${serializeCV(principalCV(user))}`],
    };
    const result = await callContractReadOnly(stacksApi, data, stacksHiroKey);
    const stakes = result.value?.value.map((item: any) => Number(item.value)) || undefined;
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
  { label: "AGAINST", displayName: "against", icon: "👎" },
  { label: "FOR", displayName: "for", icon: "👍" },
];

export type MarketCategory = {
  name: string;
  information: string;
  displayName: string;
  active: boolean;
};

export function marketDataToTupleCV(name: string, category: string, createdAt: number, proposer: string, token: string) {
  return tupleCV({
    name: stringAsciiCV(name),
    category: stringAsciiCV(category),
    createdAt: uintCV(createdAt),
    proposer: principalCV(proposer),
    token: stringAsciiCV(token),
  });
}

export type Sip10Data = {
  symbol: string;
  name: string;
  decimals: number;
  balance: number;
  totalSupply: number;
  tokenUri: string;
};

export enum ResolutionState {
  RESOLUTION_OPEN = 0,
  RESOLUTION_RESOLVING = 1,
  RESOLUTION_DISPUTED = 2,
  RESOLUTION_RESOLVED = 3,
}
export interface BasicEvent {
  _id?: string;
  event: string;
  event_index: number;
  txId: string;
  daoContract: string;
  extension: string;
}

export interface PredictionMarketCreateEvent extends BasicEvent {
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
  seedAmount?: number;
}

export interface PredictionMarketStakeEvent extends BasicEvent {
  marketId: number;
  marketType: number;
  amount: number;
  index: number;
  voter: string;
  fee: number;
  cost: number;
}

export interface TokenPermissionEvent extends BasicEvent {
  marketType: number;
  allowed: boolean;
  token: string;
  sip10Data?: Sip10Data;
  minLiquidity?: number;
}

export interface PredictionMarketClaimEvent extends BasicEvent {
  marketId: number;
  marketType: number;
  claimer: string;
  indexWon: number;
  userTokensInOutcome: number;
  userSharesInOutcome: number;
  winningPool: number;
  daoFee: number;
  marketFee: number;
  totalPool: ResolutionState;
  netRefund: number;
}

export type TopMarket = {
  market: PredictionMarketCreateEvent;
  totalStakes: number;
};
export type LeaderBoard = {
  latestPredicitons: Array<PredictionMarketStakeEvent>;
  topMarkets: Array<TopMarket>;
};
export interface CorePorposalsSetTeamMemberEvent extends BasicEvent {
  who: string;
  member: boolean;
}
export interface GovernanceTokenCoreClaimEvent extends BasicEvent {
  recipient: string;
  claimed: number;
  claimable: number;
  elapsed: number;
  vested: number;
}

export interface GovernanceTokenCoreVestingEvent extends BasicEvent {
  amount: number;
  startBlock: number;
  duration: number;
  currentKey: number;
}

export interface MarketGatingAccessByAccountEvent extends BasicEvent {
  contractKey: string;
  contractName: string;
  root: string;
  leaf: string;
  sender: string;
  txsender: string;
  proofValid: boolean;
}

export interface MarketGatingUpdateRootEvent extends BasicEvent {
  hashedId: string;
  merkleRoot: string;
}

export interface MarketGatingUpdateRootByPrincipalEvent extends BasicEvent {
  contractId: string;
  contractName: string;
  contractKey: string;
  merkleRoot: string;
}
export interface MarketVotingCreateEvent extends BasicEvent {
  marketId: number;
  market: string;
  proposer: string;
  concludeTxId?: string;
  isGated: boolean;
  winningCategory: number;
}
// export type PollCreateEvent = {
//   concludeTxId: string;
//   isGated: boolean;
//   pollId: number;
//   marketId: number;
//   metadataHash: string;
//   endBurnHeight: number;
//   startBurnHeight: number;
//   proposer: string;
//   winningCategory: boolean;
//   unhashedData: StoredOpinionPoll;
// };

export interface MarketVotingVoteEvent extends BasicEvent {
  marketId: number;
  voter: string;
  categoryFor: number;
  sip18: boolean;
  amount: number;
  prevMarketId?: number;
}
// export type PollVoteEvent = {
//   pollId: number;
//   voter: string;
//   for: number;
//   sip18: number;
//   amount: number;
//   reclaimId?: number;
// };

export interface MarketVotingConcludeEvent extends BasicEvent {
  marketId: number;
  winningCategory: number;
  result: boolean;
}
export interface TokenSaleInitialisationEvent extends BasicEvent {}

export interface TokenSalePurchaseEvent extends BasicEvent {
  buyer: string;
  stage: number;
  tokens: number;
  stxAmount?: number;
}

export interface TokenSaleAdvanceStageEvent extends BasicEvent {
  newStage: number;
  burnStart: number;
}

export interface TokenSaleCancelStageEvent extends BasicEvent {
  stage: number;
}

export interface TokenSaleRefundEvent extends BasicEvent {
  buyer: string;
  refunded: number;
  stage: number;
}

export interface ReputationSetTierEvent extends BasicEvent {
  weight: number;
  tokenId: number;
}

export interface MarketPriceBandWidth extends BasicEvent {
  feedId: string;
  bandBips: number;
}

export interface ReputationBigClaimEvent extends BasicEvent {
  batched: boolean;
  user: string;
  epoch: number;
  amount: number;
  rewardPerEpoch: number;
}

export interface PerformCustomHedgeEvent extends BasicEvent {
  marketId: number;
  predictedIndex: number;
}
export interface PerformSwapHedgeEvent extends BasicEvent {
  marketId: number;
  predictedIndex: number;
  feedId: string;
}
export interface SwapTokenPairHedgeEvent extends BasicEvent {
  marketId: number;
  predictedIndex: number;
  feedId: string;
  tokenIn: string;
  tokenOut: string;
  token0: string;
  token1: string;
}
export interface ScalarContractHedgeEvent extends BasicEvent {
  marketContract: string;
}
export interface MarketContractHedgeEvent extends BasicEvent {
  marketContract: string;
}
export interface MultipliersHedgeEvent extends BasicEvent {
  multipliers: Array<number>;
}

export interface ReputationSftTransferEvent extends BasicEvent {
  tokenId: number;
  sender: string;
  recipient: string;
  amount: number;
}

export interface ReputationSftBurnEvent extends BasicEvent {
  tokenId: number;
  sender: string;
  amount: number;
}

export interface ReputationSftMintEvent extends BasicEvent {
  tokenId: number;
  recipient: string;
  amount: number;
}

export interface LiquidityContributionEvent extends BasicEvent {
  bigr: number;
  from: string;
  amount: number;
}

export function createBasicEvent(id: string, event: any, daoContract: string, extension: string, eventType: string): BasicEvent {
  return {
    _id: id,
    event: eventType,
    event_index: Number(event.event_index),
    txId: event.tx_id,
    daoContract,
    extension,
  };
}

export async function getArgsCV(
  gateKeeper: GateKeeper,
  creationGated: boolean,
  token: string,
  treasury: string,
  stxAddress: string,
  marketFee: number,
  dataHash: string,
  marketInitialLiquidity: number,
  priceFeedIdOrCatData: string | Array<MarketCategoricalOption>,
  marketDuration: number,
  coolDownDuration: number,
  hedgeStrategy?: string
): Promise<ClarityValue[]> {
  const [contractAddress, contractName] = token.split(".");
  if (!contractAddress || !contractName) {
    throw new Error("Invalid token format. Expected 'address.contract-name'");
  }

  const marketFeeCV = marketFee === 0 ? noneCV() : someCV(uintCV(marketFee * 100));
  const hedgeCV = hedgeStrategy ? contractPrincipalCV(hedgeStrategy.split(".")[0], hedgeStrategy.split(".")[1]) : noneCV();
  // Assumes `dataHash` is a 64-character hex string (32 bytes)
  const metadataHash = bufferCV(hexToBytes(dataHash));
  let proof = creationGated ? await getClarityProofForCreateMarket(gateKeeper, stxAddress) : Cl.list([]);
  if (typeof priceFeedIdOrCatData === "string") {
    console.log("priceFeedId ===> " + priceFeedIdOrCatData);
    return [
      marketFeeCV,
      contractPrincipalCV(contractAddress, contractName),
      metadataHash,
      proof,
      principalCV(treasury),
      someCV(uintCV(marketDuration)),
      someCV(uintCV(coolDownDuration)),
      Cl.bufferFromHex(priceFeedIdOrCatData),
      uintCV(marketInitialLiquidity),
      hedgeCV,
    ];
  } else {
    console.log("CatData ===> ", priceFeedIdOrCatData);
    const cats = listCV(priceFeedIdOrCatData.map((o) => stringAsciiCV(o.label)));
    return [cats, marketFeeCV, contractPrincipalCV(contractAddress, contractName), metadataHash, proof, principalCV(treasury), someCV(uintCV(marketDuration)), someCV(uintCV(coolDownDuration)), uintCV(marketInitialLiquidity), hedgeCV];
  }
}

export async function getClarityProofForCreateMarket(gateKeeper: GateKeeper, stxAddress: string): Promise<ListCV<ClarityValue>> {
  // const path = `${bigMarketApi}/gating/create-market`;
  // const response = await fetch(path);
  // const gateKeeper = await response.json();
  const { tree, root } = generateMerkleTreeUsingStandardPrincipal(gateKeeper.merkleRootInput);
  const { proof, valid } = generateMerkleProof(tree, stxAddress);
  if (!valid) throw new Error("Invalid proof - user will be denied this operation in contract");
  return proofToClarityValue(proof);
}
