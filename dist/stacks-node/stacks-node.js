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
exports.fetchContractAssets = fetchContractAssets;
exports.fetchSip10 = fetchSip10;
exports.fetchContractBalances = fetchContractBalances;
exports.fetchContractStxBalance = fetchContractStxBalance;
exports.getTransaction = getTransaction;
exports.fetchDataVar = fetchDataVar;
exports.fetchMapEntry = fetchMapEntry;
exports.getStacksNetwork = getStacksNetwork;
exports.lookupContract = lookupContract;
exports.isConstructed = isConstructed;
exports.fetchStacksInfo = fetchStacksInfo;
exports.getTokenBalances = getTokenBalances;
exports.callContractReadOnly = callContractReadOnly;
exports.getStacksHeightFromBurnBlockHeight = getStacksHeightFromBurnBlockHeight;
exports.getFirstStacksBlock = getFirstStacksBlock;
exports.getPoxInfo = getPoxInfo;
exports.getSip10Properties = getSip10Properties;
exports.getSip10Balance = getSip10Balance;
exports.getSip10Property = getSip10Property;
const transactions_1 = require("@stacks/transactions");
const network_1 = require("@stacks/network");
function fetchContractAssets(stacksApi, principal, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/extended/v1/address/${principal}/assets`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
function fetchSip10(stacksApi, principal, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/extended/v1/address/${principal}/assets`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
function fetchContractBalances(stacksApi, principal, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/extended/v1/address/${principal}/balances`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
function fetchContractStxBalance(stacksApi, principal, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/extended/v1/address/${principal}/stx`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
function getTransaction(stacksApi, tx, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${stacksApi}/extended/v1/tx/${tx}`;
        let val;
        try {
            const response = yield fetch(url, {
                headers: Object.assign({}, (stacksHiroKey ? { "x-api-key": stacksHiroKey } : {})),
            });
            val = yield response.json();
        }
        catch (err) {
            console.log("getTransaction: ", err);
        }
        return val;
    });
}
function fetchDataVar(stacksApi, contractAddress, contractName, dataVarName, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //checkAddressForNetwork(getConfig().network, contractAddress)
            const url = `${stacksApi}/v2/data_var/${contractAddress}/${contractName}/${dataVarName}`;
            const response = yield fetch(url, {
                headers: Object.assign({}, (stacksHiroKey ? { "x-api-key": stacksHiroKey } : {})),
            });
            const result = yield response.json();
            return result;
        }
        catch (err) {
            console.log("fetchDataVar: dataVarName: " + dataVarName + " : " + err.message + " contractName: " + contractName);
        }
    });
}
function fetchMapEntry(stacksApi, contractAddress, contractName, mapName, lookupKey, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //checkAddressForNetwork(getConfig().network, contractAddress)
            const url = `${stacksApi}/v2/map_entry/${contractAddress}/${contractName}/${mapName}`;
            const response = yield fetch(url, {
                method: "POST",
                headers: Object.assign({ "Content-Type": "application/json", Authorization: "" }, (stacksHiroKey ? { "x-api-key": stacksHiroKey } : {})),
                body: (0, transactions_1.serializeCV)(lookupKey),
            });
            const result = yield response.json();
            return result;
        }
        catch (err) {
            console.log("fetchMapEntry: mapName: " + mapName + " : " + " lookupKey: " + lookupKey + " : " + err.message + " contractAddress: " + contractAddress);
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
    if (network === "devnet")
        stxNetwork = network_1.STACKS_MOCKNET;
    else if (network === "testnet")
        stxNetwork = network_1.STACKS_TESTNET;
    else if (network === "mainnet")
        stxNetwork = network_1.STACKS_MAINNET;
    else
        stxNetwork = network_1.STACKS_MOCKNET;
    return stxNetwork;
}
function lookupContract(stacksApi, contract_id, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/extended/v1/contract/${contract_id}`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
function isConstructed(stacksApi, contract_id, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/extended/v1/contract/${contract_id}`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
function fetchStacksInfo(stacksApi, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/v2/info`;
        const response = yield fetch(path, {
            headers: Object.assign({}, (stacksHiroKey ? { "x-api-key": stacksHiroKey } : {})),
        });
        const res = yield response.json();
        return res;
    });
}
function getTokenBalances(stacksApi, principal, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/extended/v1/address/${principal}/balances`;
        const response = yield fetch(path, {
            headers: Object.assign({}, (stacksHiroKey ? { "x-api-key": stacksHiroKey } : {})),
        });
        const res = yield response.json();
        return res;
    });
}
function callContractReadOnly(stacksApi, data, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `${stacksApi}/v2/contracts/call-read/${data.contractAddress}/${data.contractName}/${data.functionName}`;
        if (data.tip) {
            url += "?tip=" + data.tip;
        }
        let val;
        try {
            console.log("callContractReadOnly: url: ", url);
            const response = yield fetch(url, {
                method: "POST",
                headers: Object.assign({ "Content-Type": "application/json" }, (stacksHiroKey ? { "x-api-key": stacksHiroKey } : {})),
                body: JSON.stringify({
                    arguments: data.functionArgs,
                    sender: data.contractAddress,
                }),
            });
            val = yield response.json();
        }
        catch (err) {
            console.error("callContractReadOnly4: ", err);
        }
        try {
            const result = (0, transactions_1.cvToJSON)((0, transactions_1.deserializeCV)(val.result));
            return result;
        }
        catch (err) {
            console.error("Error: callContractReadOnly: ", val);
            return val;
        }
    });
}
function getStacksHeightFromBurnBlockHeight(stacksApi, burnHeight, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `${stacksApi}/extended/v2/burn-blocks/${burnHeight}/blocks`;
        let response = yield fetch(url, {
            headers: Object.assign({}, (stacksHiroKey ? { "x-api-key": stacksHiroKey } : {})),
        });
        if (response.status !== 200) {
            return -1; // burn height in future.
        }
        let val = yield response.json();
        if (!val || !val.results || val.results.length === 0)
            return 0;
        console.log("getStacksHeightFromBurnBlockHeight: burnHeight: " + burnHeight, val.results);
        return val.results[0].height;
    });
}
function getFirstStacksBlock(stacksApi, burnBlockHeight, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        let stacksBlock = null;
        let currentBurnBlock = burnBlockHeight;
        while (!stacksBlock) {
            const url = `${stacksApi}/extended/v2/burn-blocks/${currentBurnBlock}/blocks`;
            const response = yield fetch(url, {
                headers: Object.assign({}, (stacksHiroKey ? { "x-api-key": stacksHiroKey } : {})),
            });
            const data = yield response.json();
            if (data.results && data.results.length > 0) {
                stacksBlock = data.results[0]; // Take first Stacks block
                return {
                    stacksHeight: stacksBlock.height,
                    stacksHash: stacksBlock.hash,
                    indexHash: stacksBlock.index_block_hash,
                    burnBlockHeight: data.burn_block_height,
                };
            }
            console.log(`No Stacks block found at burn block ${currentBurnBlock}, checking next...`);
            currentBurnBlock++; // Move to the next Bitcoin block
        }
    });
}
function getPoxInfo(stacksApi, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${stacksApi}/v2/pox`;
        const response = yield fetch(path);
        const res = yield response.json();
        return res;
    });
}
function getSip10Properties(stacksApi, token, owner, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        let p = yield getSip10Property(stacksApi, token, "get-symbol");
        let symbol = p;
        p = yield getSip10Property(stacksApi, token, "get-name");
        let name = p;
        p = yield getSip10Property(stacksApi, token, "get-decimals");
        let decimals = Number(p);
        p = yield getSip10Property(stacksApi, token, "get-token-uri");
        let tokenUri = p.value;
        p = yield getSip10Property(stacksApi, token, "get-total-supply");
        let totalSupply = Number(p);
        let balance = 0;
        if (owner) {
            p = yield getSip10Balance(stacksApi, token, owner);
            balance = Number(p);
        }
        return {
            symbol,
            name,
            tokenUri,
            decimals,
            totalSupply,
            balance,
        };
    });
}
function getSip10Balance(stacksApi, token, owner, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const functionArgs = [`0x${(0, transactions_1.serializeCV)(transactions_1.Cl.principal(owner))}`];
        const data = {
            contractAddress: token.token.split(".")[0],
            contractName: token.token.split(".")[1],
            functionName: "get-balance",
            functionArgs,
        };
        const result = yield callContractReadOnly(stacksApi, data, stacksHiroKey);
        return ((_a = result === null || result === void 0 ? void 0 : result.value) === null || _a === void 0 ? void 0 : _a.value) || "get-balance";
    });
}
function getSip10Property(stacksApi, token, functionName, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const functionArgs = [];
        const data = {
            contractAddress: token.token.split(".")[0],
            contractName: token.token.split(".")[1],
            functionName,
            functionArgs,
        };
        const result = yield callContractReadOnly(stacksApi, data, stacksHiroKey);
        return ((_a = result === null || result === void 0 ? void 0 : result.value) === null || _a === void 0 ? void 0 : _a.value) || functionName;
    });
}
