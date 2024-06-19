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
exports.fetchExchangeRates = exports.getPoxInfo = exports.getTokenBalances = exports.fetchStacksInfo = exports.isConstructed = exports.lookupContract = exports.getStacksNetwork = exports.fetchDataVar = void 0;
const network_1 = require("@stacks/network");
function fetchDataVar(stacksApi, contractAddress, contractName, dataVarName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //checkAddressForNetwork(getConfig().network, contractAddress)
            const url = `${stacksApi}/v2/data_var/${contractAddress}/${contractName}/${dataVarName}`;
            const response = yield fetch(url);
            const result = yield response.json();
            return result;
        }
        catch (err) {
            console.log('fetchDataVar: ' + err.message + ' contractAddress: ' + contractAddress);
        }
    });
}
exports.fetchDataVar = fetchDataVar;
function getStacksNetwork(network) {
    let stxNetwork;
    /**
    if (CONFIG.VITE_ENVIRONMENT === 'nakamoto') {
        stxNetwork = new StacksTestnet({
            url: 'https://api.nakamoto.testnet.hiro.so',
        });
        return stxNetwork
     }
      */
    if (network === 'devnet')
        stxNetwork = new network_1.StacksMocknet();
    else if (network === 'testnet')
        stxNetwork = new network_1.StacksTestnet();
    else if (network === 'mainnet')
        stxNetwork = new network_1.StacksMainnet();
    else
        stxNetwork = new network_1.StacksMocknet();
    return stxNetwork;
}
exports.getStacksNetwork = getStacksNetwork;
function lookupContract(stacksApi, contract_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/extended/v1/contract/${contract_id}`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
exports.lookupContract = lookupContract;
function isConstructed(stacksApi, contract_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/extended/v1/contract/${contract_id}`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
exports.isConstructed = isConstructed;
function fetchStacksInfo(stacksApi) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/v2/info`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
exports.fetchStacksInfo = fetchStacksInfo;
function getTokenBalances(stacksApi, principal) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/extended/v1/address/${principal}/balances`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
exports.getTokenBalances = getTokenBalances;
function getPoxInfo(stacksApi) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/v2/pox`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
exports.getPoxInfo = getPoxInfo;
function fetchExchangeRates(stxEcoApi) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stxEcoApi}/btc/tx/rates`;
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
exports.fetchExchangeRates = fetchExchangeRates;
