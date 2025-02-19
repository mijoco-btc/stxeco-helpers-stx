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
exports.fetchUserStake = fetchUserStake;
exports.opinionPollToTupleCV = opinionPollToTupleCV;
const transactions_1 = require("@stacks/transactions");
const stacks_node_1 = require("../stacks-node");
function fetchMarketData(stacksApi, marketId, contractAddress, contractName) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
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
                outcome: ((_b = (_a = result.value.value.outcome) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.value)
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
        }
        catch (err) {
            return undefined;
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
                functionArgs: [
                    `0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(marketId))}`,
                    `0x${(0, transactions_1.serializeCV)((0, transactions_1.principalCV)(user))}`,
                ],
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
    { label: "nay", displayName: "against", icon: "👎" },
    { label: "yay", displayName: "for", icon: "👍" },
];
function opinionPollToTupleCV(name, category, createdAt, proposer, token) {
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
