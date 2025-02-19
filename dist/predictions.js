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
function fetchResolutionVote(stacksApi, marketId, contractAddress, contractName) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const data = {
            contractAddress,
            contractName,
            functionName: "get-poll-data",
            functionArgs: [`0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(marketId))}`],
        };
        const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
        const votes = result.value.value["votes"].value.map((item) => Number(item.value));
        return {
            marketId: marketId,
            metadataHash: result.value.value["market-data-hash"].value,
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
function extractValue(stacksApi, contractAddress, contractName, varName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let token = yield (0, stacks_node_1.fetchDataVar)(stacksApi, contractAddress, contractName, varName);
            if (token.data && token.data === "0x04")
                return false;
            else if (token.data && token.data === "0x03")
                return true;
            const cv = (0, transactions_1.deserializeCV)(token.data).value;
            if (typeof cv === "object") {
                return cv.value.value;
            }
            else if (typeof cv === "bigint") {
                return Number(cv);
            }
            return cv;
        }
        catch (err) {
            return null;
        }
    });
}
function readPredictionContractData(stacksApi, contractAddress, contractName) {
    return __awaiter(this, void 0, void 0, function* () {
        let customMajority = yield extractValue(stacksApi, contractAddress, "bme021-0-market-voting", "custom-majority");
        let marketVotingDuration = yield extractValue(stacksApi, contractAddress, "bme021-0-market-voting", "voting-duration");
        let tokenUri = yield extractValue(stacksApi, contractAddress, "bme000-0-governance-token", "token-uri");
        let tokenDecimals = yield extractValue(stacksApi, contractAddress, "bme000-0-governance-token", "token-decimals");
        let tokenSymbol = yield extractValue(stacksApi, contractAddress, "bme000-0-governance-token", "token-symbol");
        let tokenName = yield extractValue(stacksApi, contractAddress, "bme000-0-governance-token", "token-name");
        let coreTeamSunsetHeight = yield extractValue(stacksApi, contractAddress, "bme003-0-core-proposals", "core-team-sunset-height");
        let executiveSignalsRequired = yield extractValue(stacksApi, contractAddress, "bme004-0-core-execute", "executive-signals-required");
        let marketCounter = yield extractValue(stacksApi, contractAddress, contractName, "market-counter");
        let creationGated = yield extractValue(stacksApi, contractAddress, contractName, "creation-gated");
        let devFeeBips = yield extractValue(stacksApi, contractAddress, contractName, "dev-fee-bips");
        let daoFeeBips = yield extractValue(stacksApi, contractAddress, contractName, "dao-fee-bips");
        let marketFeeBipsMax = yield extractValue(stacksApi, contractAddress, contractName, "market-fee-bips-max");
        let marketCreateFee = yield extractValue(stacksApi, contractAddress, contractName, "market-create-fee");
        let disputeWindowLength = yield extractValue(stacksApi, contractAddress, contractName, "dispute-window-length");
        let resolutionAgent = yield extractValue(stacksApi, contractAddress, contractName, "resolution-agent");
        let devFund = yield extractValue(stacksApi, contractAddress, contractName, "dev-fund");
        let daoTreasury = yield extractValue(stacksApi, contractAddress, contractName, "dao-treasury");
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
    });
}
