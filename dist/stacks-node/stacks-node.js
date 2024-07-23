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
exports.getTransaction = getTransaction;
exports.fetchDataVar = fetchDataVar;
exports.getStacksNetwork = getStacksNetwork;
exports.lookupContract = lookupContract;
exports.isConstructed = isConstructed;
exports.fetchStacksInfo = fetchStacksInfo;
exports.getTokenBalances = getTokenBalances;
exports.callContractReadOnly = callContractReadOnly;
exports.getStacksHeightFromBurnBlockHeight = getStacksHeightFromBurnBlockHeight;
exports.getPoxInfo = getPoxInfo;
const network_1 = require("@stacks/network");
const transactions_1 = require("@stacks/transactions");
function getTransaction(stacksApi, tx) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${stacksApi}/extended/v1/tx/${tx}`;
        let val;
        try {
            const response = yield fetch(url);
            val = yield response.json();
        }
        catch (err) {
            console.log('getTransaction: ', err);
        }
        return val;
    });
}
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
function lookupContract(stacksApi, contract_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/extended/v1/contract/${contract_id}`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
function isConstructed(stacksApi, contract_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/extended/v1/contract/${contract_id}`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
function fetchStacksInfo(stacksApi) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/v2/info`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
function getTokenBalances(stacksApi, principal) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/extended/v1/address/${principal}/balances`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
function callContractReadOnly(stacksApi, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `${stacksApi}/v2/contracts/call-read/${data.contractAddress}/${data.contractName}/${data.functionName}`;
        if (data.tip) {
            url += '?tip=' + data.tip;
        }
        let val;
        try {
            console.log('callContractReadOnly: url: ', url);
            const hiroApi1 = 'ae4ecb7b39e8fbc0326091ddac461bc6';
            const response = yield fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-hiro-api-key': hiroApi1
                },
                body: JSON.stringify({
                    arguments: data.functionArgs,
                    sender: data.contractAddress,
                })
            });
            val = yield response.json();
        }
        catch (err) {
            console.error('callContractReadOnly4: ', err);
        }
        try {
            const result = (0, transactions_1.cvToJSON)((0, transactions_1.deserializeCV)(val.result));
            return result;
        }
        catch (err) {
            console.error('Error: callContractReadOnly: ', val);
            return val;
        }
    });
}
function getStacksHeightFromBurnBlockHeight(stacksApi, burnHeight) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `${stacksApi}/extended/v2/burn-blocks/${burnHeight}/blocks`;
        let response = yield fetch(url);
        if (response.status !== 200) {
            return -1; // burn height in future.
        }
        let val = yield response.json();
        if (!val || !val.results || val.results.length === 0)
            return 0;
        console.log('getStacksHeightFromBurnBlockHeight: burnHeight: ' + burnHeight, val.results);
        return val.results[0].height;
    });
}
function getPoxInfo(stacksApi) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/v2/pox`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
