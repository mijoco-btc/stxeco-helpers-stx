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
exports.BigRepTierMetadata = exports.BigRepTier = void 0;
exports.readReputationContractData = readReputationContractData;
exports.readUserReputationContractData = readUserReputationContractData;
exports.fetchBalanceAtTier = fetchBalanceAtTier;
exports.fetchBalances = fetchBalances;
exports.fetchOverallBalance = fetchOverallBalance;
exports.fetchWeightedReputation = fetchWeightedReputation;
exports.fetchCurrentEpoch = fetchCurrentEpoch;
exports.fetchTotalSupplies = fetchTotalSupplies;
exports.fetchWeightedSupply = fetchWeightedSupply;
const transactions_1 = require("@stacks/transactions");
const stacks_node_1 = require("../stacks-node");
const predictions_1 = require("../predictions");
function readReputationContractData(stacksApi, contractAddress, contractName) {
    return __awaiter(this, void 0, void 0, function* () {
        let rewardPerEpoch = yield (0, predictions_1.extractValue)(stacksApi, contractAddress, contractName, "reward-per-epoch");
        let overallSupply = yield (0, predictions_1.extractValue)(stacksApi, contractAddress, contractName, "overall-supply");
        let tokenName = yield (0, predictions_1.extractValue)(stacksApi, contractAddress, contractName, "token-name");
        let tokenSymbol = yield (0, predictions_1.extractValue)(stacksApi, contractAddress, contractName, "token-symbol");
        return {
            overallSupply,
            rewardPerEpoch,
            tokenName,
            tokenSymbol,
            currentEpoch: yield fetchCurrentEpoch(stacksApi, contractAddress, contractName),
            weightedSupply: 0, //Number(await fetchWeightedSupply(stacksApi, contractAddress, contractName)),
            totalSupplies: [], //await fetchTotalSupplies(stacksApi, contractAddress, contractName),
            tierMetaData: exports.BigRepTierMetadata,
        };
    });
}
function readUserReputationContractData(stacksApi, contractAddress, contractName, address) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            balances: yield fetchBalances(stacksApi, contractAddress, contractName, address),
            overallBalance: yield fetchOverallBalance(stacksApi, contractAddress, contractName, address),
            weightedReputation: yield fetchWeightedReputation(stacksApi, contractAddress, contractName, address),
        };
    });
}
var BigRepTier;
(function (BigRepTier) {
    BigRepTier[BigRepTier["Newcomer"] = 1] = "Newcomer";
    BigRepTier[BigRepTier["CommunityMember"] = 2] = "CommunityMember";
    BigRepTier[BigRepTier["ForumParticipant"] = 3] = "ForumParticipant";
    BigRepTier[BigRepTier["ContributorI"] = 4] = "ContributorI";
    BigRepTier[BigRepTier["ContributorII"] = 5] = "ContributorII";
    BigRepTier[BigRepTier["ContributorIII"] = 6] = "ContributorIII";
    BigRepTier[BigRepTier["ProposalAuthor"] = 7] = "ProposalAuthor";
    BigRepTier[BigRepTier["Facilitator"] = 8] = "Facilitator";
    BigRepTier[BigRepTier["Campaigner"] = 9] = "Campaigner";
    BigRepTier[BigRepTier["ProjectLeader"] = 10] = "ProjectLeader";
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
})(BigRepTier || (exports.BigRepTier = BigRepTier = {}));
exports.BigRepTierMetadata = {
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
function fetchBalanceAtTier(stacksApi, contractAddress, contractName, address, tier) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const data = {
            contractAddress: contractAddress,
            contractName: contractName,
            functionName: "get-balance",
            functionArgs: [`0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(tier))}`, `0x${(0, transactions_1.serializeCV)((0, transactions_1.principalCV)(address))}`],
        };
        const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
        console.log("fetchBalanceAtTier: tier: " + tier, result);
        return Number(((_a = result.value) === null || _a === void 0 ? void 0 : _a.value) || 0);
    });
}
function fetchBalances(stacksApi, contractAddress, contractName, address) {
    return __awaiter(this, void 0, void 0, function* () {
        const supplies = [];
        for (let tokenId = 1; tokenId <= 10; tokenId++) {
            try {
                const value = yield fetchBalanceAtTier(stacksApi, contractAddress, contractName, address, tokenId);
                supplies.push(Number(value));
            }
            catch (err) {
                console.error(`Failed to fetch supply for tokenId ${tokenId}:`, err);
                supplies.push(0);
            }
        }
        return supplies;
    });
}
function fetchOverallBalance(stacksApi, contractAddress, contractName, address) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const data = {
            contractAddress: contractAddress,
            contractName: contractName,
            functionName: "get-overall-balance",
            functionArgs: [`0x${(0, transactions_1.serializeCV)((0, transactions_1.principalCV)(address))}`],
        };
        const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
        return Number(((_a = result.value) === null || _a === void 0 ? void 0 : _a.value) || 0);
    });
}
function fetchWeightedReputation(stacksApi, contractAddress, contractName, address) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const data = {
            contractAddress: contractAddress,
            contractName: contractName,
            functionName: "get-weighted-rep",
            functionArgs: [`0x${(0, transactions_1.serializeCV)((0, transactions_1.principalCV)(address))}`],
        };
        const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
        return Number(((_a = result.value) === null || _a === void 0 ? void 0 : _a.value) || 0);
    });
}
function fetchCurrentEpoch(stacksApi, contractAddress, contractName) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = {
            contractAddress,
            contractName,
            functionName: "get-epoch",
            functionArgs: [],
            // functionArgs: [`0x${serializeCV(principalCV(marketContract))}`, `0x${serializeCV(uintCV(marketId))}`]
        };
        const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
        console.log("fetchCurrentEpoch: ", result);
        return Number(result.value || "0");
    });
}
function fetchTotalSupplies(stacksApi, contractAddress, contractName) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const supplies = [];
        for (let tokenId = 1; tokenId <= 10; tokenId++) {
            const data = {
                contractAddress,
                contractName,
                functionName: "get-total-supply",
                functionArgs: [`0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(tokenId))}`], // SIP-013 total supply takes token-id as argument
            };
            try {
                const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
                const value = (_a = result === null || result === void 0 ? void 0 : result.value) === null || _a === void 0 ? void 0 : _a.value;
                supplies.push(Number(value));
            }
            catch (err) {
                console.error(`Failed to fetch supply for tokenId ${tokenId}:`, err);
                supplies.push(0); // fallback
            }
        }
        return supplies;
    });
}
function fetchWeightedSupply(stacksApi, contractAddress, contractName) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = {
            contractAddress: contractAddress,
            contractName: contractName,
            functionName: "get-weighted-supply",
            functionArgs: [],
        };
        const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
        return result.value.value;
    });
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
