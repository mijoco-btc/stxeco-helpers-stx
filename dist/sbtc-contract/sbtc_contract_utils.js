"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.fetchNoArgsReadOnly = fetchNoArgsReadOnly;
exports.fetchSbtcWalletAddress = fetchSbtcWalletAddress;
exports.fetchUserSbtcBalance = fetchUserSbtcBalance;
exports.fetchUserBalances = fetchUserBalances;
exports.fetchAddress = fetchAddress;
exports.getPegWalletAddressFromPublicKey = getPegWalletAddressFromPublicKey;
/**
 * sbtc - interact with Stacks Blockchain to read sbtc contract info
 */
const transactions_1 = require("@stacks/transactions");
const base_1 = require("@scure/base");
const account_1 = require("../account");
const btc = __importStar(require("@scure/btc-signer"));
const stacks_node_1 = require("../stacks-node");
const limit = 10;
const noArgMethods = [
    'get-bitcoin-wallet-public-key',
    'get-token-uri',
    'get-total-supply',
    'get-decimals',
    'get-name',
];
function fetchNoArgsReadOnly(stacksApi, network, contractId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = {};
        if (!contractId || contractId.length === 0)
            return {};
        //checkAddressForNetwork(getConfig().network, contractId)
        const data = {
            contractAddress: contractId.split('.')[0],
            contractName: contractId.split('.')[1],
            functionName: '',
            functionArgs: [],
            network
        };
        for (let arg in noArgMethods) {
            let funcname = noArgMethods[arg];
            let response;
            try {
                data.functionName = funcname;
                response = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
                resolveArg(network, result, response, funcname);
            }
            catch (err) {
                console.log('Error fetching sbtc alpha data from sbtc contract arg: ' + funcname);
            }
        }
        result.contractId = contractId;
        return result;
    });
}
function resolveArg(network, result, response, arg) {
    let current = response;
    if (response.value && response.value.value) {
        current = response.value.value;
    }
    switch (arg) {
        case 'get-bitcoin-wallet-public-key':
            //console.log('get-bitcoin-wallet-public-key: response: ', response)
            try {
                const fullPK = response.value.value.split('x')[1];
                result.sbtcWalletAddress = getPegWalletAddressFromPublicKey(network, fullPK);
                result.sbtcWalletPublicKey = fullPK;
                // converting to x-only..
                //result.sbtcWalletPublicKey = fullPK;
                //try {
                //  const net = (getConfig().network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
                //  const trObj = btc.p2tr(fullPK.substring(1), undefined, net);
                //  if (trObj.type === 'tr') result.sbtcWalletAddress = trObj.address;
                //} catch (err:any) {
                //  console.log('get-bitcoin-wallet-public-key: getting key: ' + fullPK)
                //}
            }
            catch (err) {
                console.log('get-bitcoin-wallet-public-key: current: ', current);
                console.log('get-bitcoin-wallet-public-key: err: ', err);
            }
            break;
        case 'get-num-keys':
            result.numKeys = current.value;
            break;
        case 'get-num-signers':
            result.numParties = current.value;
            break;
        case 'get-threshold':
            result.threshold = Number(current.value);
            break;
        case 'get-trading-halted':
            result.tradingHalted = current.value;
            break;
        case 'get-token-uri':
            result.tokenUri = current.value;
            break;
        case 'get-total-supply':
            result.totalSupply = Number(current);
            break;
        case 'get-decimals':
            result.decimals = Number(current);
            break;
        case 'get-name':
            result.name = current;
            break;
        default:
            break;
    }
}
function fetchSbtcWalletAddress(stacksApi, network, contractId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!contractId || contractId.length === 0)
                return;
            const data = {
                contractAddress: contractId.split('.')[0],
                contractName: contractId.split('.')[1],
                functionName: 'get-bitcoin-wallet-public-key',
                functionArgs: [],
                network
            };
            const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
            if (result.value && result.value.value) {
                return result.value.value;
            }
            if (result.type.indexOf('some') > -1)
                return result.value;
            if (network === 'testnet') {
                return 'tb1q....'; // alice
            }
        }
        catch (err) {
            return 'tb1qa....';
        }
    });
}
function fetchUserSbtcBalance(stacksApi, network, contractId, stxAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!contractId || contractId.length === 0)
                return { balance: 0 };
            const functionArgs = [`0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.principalCV)(stxAddress)))}`];
            const data = {
                contractAddress: contractId.split('.')[0],
                contractName: contractId.split('.')[1],
                functionName: 'get-balance',
                functionArgs,
                network
            };
            const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
            if (result.value && result.value.value) {
                return { balance: Number(result.value.value) };
            }
            return { balance: 0 };
        }
        catch (err) {
            return { balance: 0 };
        }
    });
}
function fetchUserBalances(stacksApi, mempoolApi, stxAddress, cardinal, ordinal) {
    return __awaiter(this, void 0, void 0, function* () {
        const userBalances = {};
        userBalances.stxAddress = stxAddress;
        userBalances.cardinal = cardinal;
        userBalances.ordinal = ordinal;
        try {
            //checkAddressForNetwork(getConfig().network, stxAddress)
            //checkAddressForNetwork(getConfig().network, cardinal)
            //checkAddressForNetwork(getConfig().network, ordinal)
            if (userBalances.stxAddress) {
                const url = `${stacksApi}/extended/v1/address/${userBalances.stxAddress}/balances`;
                const response = yield fetch(url);
                const result = yield response.json();
                userBalances.tokenBalances = result;
            }
        }
        catch (err) {
            //console.error('fetchUserBalances: stacksTokenInfo: ' + err.message)
        }
        // fetch bns info
        try {
            const url = `${stacksApi}/v1/addresses/stacks/${stxAddress}`;
            const response = yield fetch(url);
            const result = yield response.json();
            userBalances.bnsNameInfo = result;
        }
        catch (err) {
            userBalances.bnsNameInfo = { names: [] };
            console.log('fetchUserBalances: sBtcBalance: ' + err.message);
        }
        try {
            //checkAddressForNetwork(getConfig().network, userBalances.cardinal)
            const address = yield fetchAddress(mempoolApi, userBalances.cardinal);
            userBalances.cardinalInfo = address;
        }
        catch (err) {
            console.log('fetchUserBalances: cardinalInfo: ' + err.message);
        }
        try {
            //checkAddressForNetwork(getConfig().network, userBalances.cardinal)
            const address = yield fetchAddress(mempoolApi, userBalances.ordinal);
            userBalances.ordinalInfo = address;
        }
        catch (err) {
            console.log('fetchUserBalances: ordinalInfo: ' + err.message);
        }
        return userBalances;
    });
}
function fetchAddress(mempoolUrl, address) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${mempoolUrl}/address/${address}`;
        const response = yield fetch(url);
        const result = yield response.json();
        return result;
    });
}
function getPegWalletAddressFromPublicKey(network, sbtcWalletPublicKey) {
    if (!sbtcWalletPublicKey)
        return;
    let net = (0, account_1.getNet)(network);
    //if (network === 'development' || network === 'simnet') {
    //	net = { bech32: 'bcrt', pubKeyHash: 0x6f, scriptHash: 0xc4, wif: 0 }
    //}
    const fullPK = base_1.hex.decode(sbtcWalletPublicKey);
    let xOnlyKey = fullPK;
    if (fullPK.length === 33) {
        xOnlyKey = fullPK.subarray(1);
    }
    //const addr = btc.Address(net).encode({type: 'tr', pubkey: xOnlyKey})
    const trObj = btc.p2tr(xOnlyKey, undefined, net);
    return trObj.address;
}
