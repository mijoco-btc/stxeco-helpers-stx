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
exports.getStackerInfo = exports.getBalanceAtHeight = exports.fetchSbtcWalletAddress = exports.getWalletBalances = void 0;
function getWalletBalances(api, stxAddress, cardinal, ordinal) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const rawBal = yield fetchUserBalances(api, stxAddress, cardinal, ordinal);
        return {
            stacks: {
                address: stxAddress,
                amount: Number(((_b = (_a = rawBal === null || rawBal === void 0 ? void 0 : rawBal.tokenBalances) === null || _a === void 0 ? void 0 : _a.stx) === null || _b === void 0 ? void 0 : _b.balance) || '0')
            },
            cardinal: {
                address: ((_c = rawBal.cardinalInfo) === null || _c === void 0 ? void 0 : _c.address) || 'unknown',
                amount: bitcoinBalanceFromMempool(rawBal === null || rawBal === void 0 ? void 0 : rawBal.cardinalInfo)
            },
            ordinal: {
                address: ((_d = rawBal.ordinalInfo) === null || _d === void 0 ? void 0 : _d.address) || 'unknown',
                amount: bitcoinBalanceFromMempool(rawBal === null || rawBal === void 0 ? void 0 : rawBal.ordinalInfo)
            }
        };
    });
}
exports.getWalletBalances = getWalletBalances;
function fetchSbtcWalletAddress(api) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${api}/sbtc/wallet-address`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
exports.fetchSbtcWalletAddress = fetchSbtcWalletAddress;
function bitcoinBalanceFromMempool(addressMempoolObject) {
    var _a;
    if (!addressMempoolObject)
        return 0;
    return (((_a = addressMempoolObject === null || addressMempoolObject === void 0 ? void 0 : addressMempoolObject.chain_stats) === null || _a === void 0 ? void 0 : _a.funded_txo_sum) - addressMempoolObject.chain_stats.spent_txo_sum) || 0;
}
function fetchUserBalances(api, stxAddress, cardinal, ordinal) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${api}/sbtc/address/balances/${stxAddress}/${cardinal}/${ordinal}`;
        const response = yield fetch(path);
        if (response.status !== 200) {
            console.log('Bitcoin address not known - is the network correct?');
        }
        const res = yield response.json();
        return res;
    });
}
function getBalanceAtHeight(api, stxAddress, height) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!stxAddress)
            return {
                stx: {
                    balance: 0,
                    locked: 0,
                }
            };
        const path = `${api}/dao/balance/${stxAddress}/${height}`;
        try {
            const response = yield fetch(path);
            const res = yield response.json();
            return res;
        }
        catch (err) {
            return undefined;
        }
    });
}
exports.getBalanceAtHeight = getBalanceAtHeight;
function getStackerInfo(api, address, cycle) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${api}/pox/stacker-info/${address}/${cycle}`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
exports.getStackerInfo = getStackerInfo;
