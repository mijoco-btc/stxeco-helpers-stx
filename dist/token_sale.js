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
exports.fetchTokenSaleStages = fetchTokenSaleStages;
exports.fetchTokenSaleUserData = fetchTokenSaleUserData;
const transactions_1 = require("@stacks/transactions");
const stacks_node_1 = require("./stacks-node");
const predictions_1 = require("./predictions");
function fetchTokenSaleStages(stacksApi, contractAddress, contractName, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = {
            contractAddress,
            contractName,
            functionName: "get-ido-stages",
            functionArgs: [],
        };
        const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data, stacksHiroKey);
        const stages = result.value.map((stage) => {
            var _a, _b, _c, _d;
            if (stage === null || stage === void 0 ? void 0 : stage.value) {
                const val = stage.value.value;
                return {
                    cancelled: ((_a = val.cancelled) === null || _a === void 0 ? void 0 : _a.value) || false,
                    maxSupply: Number((_b = val["max-supply"]) === null || _b === void 0 ? void 0 : _b.value) || 0,
                    price: Number((_c = val.price) === null || _c === void 0 ? void 0 : _c.value) || 0,
                    tokensSold: Number((_d = val["tokens-sold"]) === null || _d === void 0 ? void 0 : _d.value) || 0,
                };
            }
            // fallback if stage.value is missing
            return {
                cancelled: false,
                maxSupply: 0,
                price: 0,
                tokensSold: 0,
            };
        });
        let currentStageStart = yield (0, predictions_1.extractValue)(stacksApi, contractAddress, contractName, "current-stage-start");
        let currentStage = yield (0, predictions_1.extractValue)(stacksApi, contractAddress, contractName, "current-stage");
        return {
            stages,
            currentStage,
            currentStageStart,
        };
    });
}
function fetchTokenSaleUserData(stacksApi, contractAddress, contractName, user, stage, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const functionArgs = stage ? [`0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(1))}`, `0x${(0, transactions_1.serializeCV)((0, transactions_1.principalCV)(user))}`] : [`0x${(0, transactions_1.serializeCV)((0, transactions_1.principalCV)(user))}`];
        const data = {
            contractAddress,
            contractName,
            functionName: stage ? "get-ido-user-for-stage" : "get-ido-user",
            functionArgs,
        };
        const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data, stacksHiroKey);
        const purchases = ((_a = result === null || result === void 0 ? void 0 : result.value) === null || _a === void 0 ? void 0 : _a.map((stage) => {
            if (stage) {
                return {
                    amount: Number(stage.value) || 0,
                };
            }
        })) || [];
        return purchases;
    });
}
