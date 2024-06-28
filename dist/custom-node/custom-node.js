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
exports.getWalletBalances = getWalletBalances;
exports.getBalanceAtHeight = getBalanceAtHeight;
const sbtc_contract_1 = require("../sbtc-contract");
function getWalletBalances(stacksApi, mempoolApi, stxAddress, cardinal, ordinal) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const rawBal = yield (0, sbtc_contract_1.fetchUserBalances)(stacksApi, mempoolApi, stxAddress, cardinal, ordinal);
        return {
            stacks: {
                address: stxAddress,
                amount: Number(((_b = (_a = rawBal === null || rawBal === void 0 ? void 0 : rawBal.tokenBalances) === null || _a === void 0 ? void 0 : _a.stx) === null || _b === void 0 ? void 0 : _b.balance) || '0')
            },
            cardinal: {
                address: cardinal,
                amount: extractBtcBalance(rawBal === null || rawBal === void 0 ? void 0 : rawBal.cardinalInfo)
            },
            ordinal: {
                address: ordinal,
                amount: extractBtcBalance(rawBal === null || rawBal === void 0 ? void 0 : rawBal.ordinalInfo)
            }
        };
    });
}
function extractBtcBalance(addressMempoolObject) {
    var _a;
    if (!addressMempoolObject)
        return 0;
    return (((_a = addressMempoolObject === null || addressMempoolObject === void 0 ? void 0 : addressMempoolObject.chain_stats) === null || _a === void 0 ? void 0 : _a.funded_txo_sum) - addressMempoolObject.chain_stats.spent_txo_sum) || 0;
}
function getBalanceAtHeight(stacksApi, stxAddress, height) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!stxAddress)
            return {
                stx: {
                    balance: 0,
                    locked: 0,
                }
            };
        const url = `${stacksApi}/extended/v1/address/${stxAddress}/balances?until_block=${height}`;
        let val;
        try {
            const response = yield fetch(url);
            val = yield response.json();
        }
        catch (err) {
            console.log('getBalanceAtHeight: ', err);
        }
        return val;
    });
}
