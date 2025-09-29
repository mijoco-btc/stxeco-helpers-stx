"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolutionState = exports.MARKET_BINARY_OPTION = void 0;
exports.fetchMarketData = fetchMarketData;
exports.getCostPerShare = getCostPerShare;
exports.fetchUserStake = fetchUserStake;
exports.fetchUserTokens = fetchUserTokens;
exports.marketDataToTupleCV = marketDataToTupleCV;
exports.createBasicEvent = createBasicEvent;
exports.getArgsCV = getArgsCV;
exports.getClarityProofForCreateMarket = getClarityProofForCreateMarket;
const transactions_1 = require("@stacks/transactions");
const stacks_node_1 = require("../stacks-node");
const common_1 = require("@stacks/common");
const gating_1 = require("../gating");
function fetchMarketData(stacksApi, marketId, contractAddress, contractName) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        let sbtcContract = stacksApi.indexOf("localhost") > -1 ? "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc" : "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token";
        const data = {
            contractAddress,
            contractName,
            functionName: "get-market-data",
            functionArgs: [`0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(marketId))}`],
        };
        try {
            const type2 = contractName.indexOf("scalar") > -1;
            const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
            let categories;
            if (!type2) {
                categories = result.value.value["categories"].value.map((item) => item.value);
            }
            else {
                categories = result.value.value["categories"].value.map((item) => ({
                    min: Number(item.value.min.value),
                    max: Number(item.value.max.value),
                }));
            }
            const stakes = result.value.value["stakes"].value.map((item) => Number(item.value));
            const stakeTokens = result.value.value["stake-tokens"].value.map((item) => Number(item.value));
            let resolutionBurnHeight = Number(result.value.value["resolution-burn-height"].value);
            let marketStart = Number(result.value.value["market-start"].value);
            let marketDuration = Number(result.value.value["market-duration"].value);
            let coolDownPeriod = Number(result.value.value["cool-down-period"].value);
            let priceFeedId = type2 ? result.value.value["price-feed-id"].value : undefined;
            let startPrice = type2 ? result.value.value["start-price"].value : undefined;
            return {
                concluded: Boolean(result.value.value.concluded.value),
                creator: result.value.value.creator.value,
                token: ((_a = result.value.value.token) === null || _a === void 0 ? void 0 : _a.value) || sbtcContract,
                treasury: result.value.value.treasury.value,
                outcome: ((_c = (_b = result.value.value.outcome) === null || _b === void 0 ? void 0 : _b.value) === null || _c === void 0 ? void 0 : _c.value) ? Number(result.value.value.outcome.value.value) : undefined,
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
        }
        catch (err) {
            return undefined;
        }
    });
}
function getCostPerShare(stacksApi, marketId, outcome, amount, contractAddress, contractName) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = {
            contractAddress,
            contractName,
            functionName: "get-share-cost",
            functionArgs: [`0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(marketId))}`, typeof outcome === "string" ? `0x${(0, transactions_1.serializeCV)((0, transactions_1.stringAsciiCV)(outcome))}` : `0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(outcome))}`, `0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(amount))}`],
        };
        try {
            const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
            return result.value.value.cost.value;
        }
        catch (err) {
            return -1;
        }
    });
}
function fetchUserStake(stacksApi, marketId, contractAddress, contractName, user) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const data = {
                contractAddress,
                contractName,
                functionName: "get-stake-balances",
                functionArgs: [`0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(marketId))}`, `0x${(0, transactions_1.serializeCV)((0, transactions_1.principalCV)(user))}`],
            };
            const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
            const stakes = ((_a = result.value) === null || _a === void 0 ? void 0 : _a.value.map((item) => Number(item.value))) || undefined;
            if (!result.value)
                return;
            return {
                stakes,
            };
        }
        catch (err) {
            return;
        }
    });
}
function fetchUserTokens(stacksApi, marketId, contractAddress, contractName, user) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const data = {
                contractAddress,
                contractName,
                functionName: "get-token-balances",
                functionArgs: [`0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(marketId))}`, `0x${(0, transactions_1.serializeCV)((0, transactions_1.principalCV)(user))}`],
            };
            const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
            const stakes = ((_a = result.value) === null || _a === void 0 ? void 0 : _a.value.map((item) => Number(item.value))) || undefined;
            if (!result.value)
                return;
            return {
                stakes,
            };
        }
        catch (err) {
            return;
        }
    });
}
// ✅ / ❌ 🟢 / 🔴 👍 / 👎 ⭕ / ❌ 🤝 Agree / 🚫 Disagree 🆗 Agree / 🛑 Disagree 📈 For / 📉 Against 1️⃣ Yes / 0️⃣ No
exports.MARKET_BINARY_OPTION = [
    { label: "AGAINST", displayName: "against", icon: "👎" },
    { label: "FOR", displayName: "for", icon: "👍" },
];
function marketDataToTupleCV(name, category, createdAt, proposer, token) {
    return (0, transactions_1.tupleCV)({
        name: (0, transactions_1.stringAsciiCV)(name),
        category: (0, transactions_1.stringAsciiCV)(category),
        createdAt: (0, transactions_1.uintCV)(createdAt),
        proposer: (0, transactions_1.principalCV)(proposer),
        token: (0, transactions_1.stringAsciiCV)(token),
    });
}
var ResolutionState;
(function (ResolutionState) {
    ResolutionState[ResolutionState["RESOLUTION_OPEN"] = 0] = "RESOLUTION_OPEN";
    ResolutionState[ResolutionState["RESOLUTION_RESOLVING"] = 1] = "RESOLUTION_RESOLVING";
    ResolutionState[ResolutionState["RESOLUTION_DISPUTED"] = 2] = "RESOLUTION_DISPUTED";
    ResolutionState[ResolutionState["RESOLUTION_RESOLVED"] = 3] = "RESOLUTION_RESOLVED";
})(ResolutionState || (exports.ResolutionState = ResolutionState = {}));
function createBasicEvent(id, event, daoContract, extension, eventType) {
    return {
        _id: id,
        event: eventType,
        event_index: Number(event.event_index),
        txId: event.tx_id,
        daoContract,
        extension,
    };
}
function getArgsCV(gateKeeper, creationGated, token, treasury, stxAddress, marketFee, dataHash, marketInitialLiquidity, priceFeedIdOrCatData, marketDuration, coolDownDuration, hedgeStrategy) {
    return __awaiter(this, void 0, void 0, function* () {
        const [contractAddress, contractName] = token.split(".");
        if (!contractAddress || !contractName) {
            throw new Error("Invalid token format. Expected 'address.contract-name'");
        }
        const marketFeeCV = marketFee === 0 ? (0, transactions_1.noneCV)() : (0, transactions_1.someCV)((0, transactions_1.uintCV)(marketFee * 100));
        const hedgeCV = hedgeStrategy ? (0, transactions_1.contractPrincipalCV)(hedgeStrategy.split(".")[0], hedgeStrategy.split(".")[1]) : (0, transactions_1.noneCV)();
        // Assumes `dataHash` is a 64-character hex string (32 bytes)
        const metadataHash = (0, transactions_1.bufferCV)((0, common_1.hexToBytes)(dataHash));
        let proof = creationGated ? yield getClarityProofForCreateMarket(gateKeeper, stxAddress) : transactions_1.Cl.list([]);
        if (typeof priceFeedIdOrCatData === "string") {
            console.log("priceFeedId ===> " + priceFeedIdOrCatData);
            return [
                marketFeeCV,
                (0, transactions_1.contractPrincipalCV)(contractAddress, contractName),
                metadataHash,
                proof,
                (0, transactions_1.principalCV)(treasury),
                (0, transactions_1.someCV)((0, transactions_1.uintCV)(marketDuration)),
                (0, transactions_1.someCV)((0, transactions_1.uintCV)(coolDownDuration)),
                transactions_1.Cl.bufferFromHex(priceFeedIdOrCatData),
                (0, transactions_1.uintCV)(marketInitialLiquidity),
                hedgeCV,
            ];
        }
        else {
            console.log("CatData ===> ", priceFeedIdOrCatData);
            const cats = (0, transactions_1.listCV)(priceFeedIdOrCatData.map((o) => (0, transactions_1.stringAsciiCV)(o.label)));
            return [cats, marketFeeCV, (0, transactions_1.contractPrincipalCV)(contractAddress, contractName), metadataHash, proof, (0, transactions_1.principalCV)(treasury), (0, transactions_1.someCV)((0, transactions_1.uintCV)(marketDuration)), (0, transactions_1.someCV)((0, transactions_1.uintCV)(coolDownDuration)), (0, transactions_1.uintCV)(marketInitialLiquidity), hedgeCV];
        }
    });
}
function getClarityProofForCreateMarket(gateKeeper, stxAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        // const path = `${bigMarketApi}/gating/create-market`;
        // const response = await fetch(path);
        // const gateKeeper = await response.json();
        const { tree, root } = (0, gating_1.generateMerkleTreeUsingStandardPrincipal)(gateKeeper.merkleRootInput);
        const { proof, valid } = (0, gating_1.generateMerkleProof)(tree, stxAddress);
        if (!valid)
            throw new Error("Invalid proof - user will be denied this operation in contract");
        return (0, gating_1.proofToClarityValue)(proof);
    });
}
