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
exports.getStackerInfo = exports.getBalanceAtHeight = exports.getBitcoinBalances = void 0;
function getBitcoinBalances(api, stxAddress, cardinal, ordinal) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${api}/sbtc/address/balances/${stxAddress}/${cardinal}/${ordinal}`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
exports.getBitcoinBalances = getBitcoinBalances;
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
