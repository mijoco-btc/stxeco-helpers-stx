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
exports.fetchResolutionVote = fetchResolutionVote;
exports.extractValue = extractValue;
exports.readPredictionContractData = readPredictionContractData;
const transactions_1 = require("@stacks/transactions");
const stacks_node_1 = require("./stacks-node");
function fetchResolutionVote(stacksApi, marketContract, marketId, contractAddress, contractName, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const data = {
            contractAddress,
            contractName,
            functionName: "get-poll-data",
            functionArgs: [`0x${(0, transactions_1.serializeCV)((0, transactions_1.principalCV)(marketContract))}`, `0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(marketId))}`],
        };
        const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data, stacksHiroKey);
        const votes = result.value.value["votes"].value.map((item) => Number(item.value));
        return {
            marketContract,
            marketId,
            proposer: result.value.value.proposer.value,
            endBurnHeight: Number(result.value.value["end-burn-height"].value),
            isGated: false,
            concluded: Boolean(result.value.value.concluded.value),
            votes,
            numCategories: Number(result.value.value["num-categories"].value),
            winningCategory: (_a = result.value.value["winning-category"]) === null || _a === void 0 ? void 0 : _a.value,
        };
    });
}
function extractValue(stacksApi, contractAddress, contractName, varName, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const delayMs = 100;
        return new Promise((resolve) => {
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    let token = yield (0, stacks_node_1.fetchDataVar)(stacksApi, contractAddress, contractName, varName, stacksHiroKey);
                    if (token.data && token.data === "0x04")
                        return resolve(false);
                    if (token.data && token.data === "0x03")
                        return resolve(true);
                    const cv = (0, transactions_1.deserializeCV)(token.data).value;
                    if (typeof cv === "object") {
                        resolve(cv.value.value);
                    }
                    else if (typeof cv === "bigint") {
                        resolve(Number(cv));
                    }
                    else {
                        resolve(cv);
                    }
                }
                catch (err) {
                    resolve(null);
                }
            }), delayMs);
        });
    });
}
function readPredictionContractData(stacksApi, contractAddress, contractName, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        let customMajority = yield extractValue(stacksApi, contractAddress, "bme021-0-market-voting", "custom-majority", stacksHiroKey);
        let marketVotingDuration = yield extractValue(stacksApi, contractAddress, "bme021-0-market-voting", "voting-duration", stacksHiroKey);
        let tokenUri = yield extractValue(stacksApi, contractAddress, "bme000-0-governance-token", "token-uri", stacksHiroKey);
        let tokenDecimals = yield extractValue(stacksApi, contractAddress, "bme000-0-governance-token", "token-decimals", stacksHiroKey);
        let tokenSymbol = yield extractValue(stacksApi, contractAddress, "bme000-0-governance-token", "token-symbol", stacksHiroKey);
        let tokenName = yield extractValue(stacksApi, contractAddress, "bme000-0-governance-token", "token-name", stacksHiroKey);
        let coreTeamSunsetHeight = yield extractValue(stacksApi, contractAddress, "bme003-0-core-proposals", "core-team-sunset-height", stacksHiroKey);
        let executiveSignalsRequired = yield extractValue(stacksApi, contractAddress, "bme004-0-core-execute", "executive-signals-required", stacksHiroKey);
        let marketCounter = yield extractValue(stacksApi, contractAddress, contractName, "market-counter", stacksHiroKey);
        let creationGated = yield extractValue(stacksApi, contractAddress, contractName, "creation-gated", stacksHiroKey);
        let devFeeBips = yield extractValue(stacksApi, contractAddress, contractName, "dev-fee-bips", stacksHiroKey);
        let daoFeeBips = yield extractValue(stacksApi, contractAddress, contractName, "dao-fee-bips", stacksHiroKey);
        let marketFeeBipsMax = yield extractValue(stacksApi, contractAddress, contractName, "market-fee-bips-max", stacksHiroKey);
        //let marketInitialLiquidity = await extractValue(stacksApi, contractAddress, contractName, "market-create-fee");
        let disputeWindowLength = yield extractValue(stacksApi, contractAddress, contractName, "dispute-window-length", stacksHiroKey);
        let resolutionAgent = yield extractValue(stacksApi, contractAddress, contractName, "resolution-agent", stacksHiroKey);
        let devFund = yield extractValue(stacksApi, contractAddress, contractName, "dev-fund", stacksHiroKey);
        let daoTreasury = yield extractValue(stacksApi, contractAddress, contractName, "dao-treasury", stacksHiroKey);
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
            marketInitialLiquidity: 100000000,
            disputeWindowLength,
            marketVotingDuration,
            resolutionAgent,
            devFund,
            daoTreasury,
            customMajority,
            creationGated,
        };
    });
}
