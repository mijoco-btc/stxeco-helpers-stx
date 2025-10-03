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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.REGTEST_NETWORK = void 0;
exports.getBalances = getBalances;
exports.isSTX = isSTX;
exports.fullBalanceAtHeight = fullBalanceAtHeight;
exports.fullBalanceInSip10Token = fullBalanceInSip10Token;
exports.appDetails = appDetails;
exports.checkAddressForNetwork = checkAddressForNetwork;
exports.decodeStacksAddress = decodeStacksAddress;
exports.encodeStacksAddress = encodeStacksAddress;
exports.verifyStacksPricipal = verifyStacksPricipal;
exports.getNet = getNet;
exports.makeFlash = makeFlash;
exports.isLegal = isLegal;
exports.verifyAmount = verifyAmount;
exports.verifySBTCAmount = verifySBTCAmount;
exports.initAddresses = initAddresses;
exports.defaultSettings = defaultSettings;
exports.defaultExchangeRate = defaultExchangeRate;
const c32check_1 = require("c32check");
const custom_node_1 = require("../custom-node");
const stacks_node_1 = require("../stacks-node");
const btc = __importStar(require("@scure/btc-signer"));
function getBalances(stacksApi, mempoolApi, contractId, stxAddress, cardinal, ordinal, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let result = {};
        try {
            result.tokenBalances = yield (0, stacks_node_1.getTokenBalances)(stacksApi, stxAddress);
            result.walletBalances = yield (0, custom_node_1.getWalletBalances)(stacksApi, mempoolApi, stxAddress, cardinal, ordinal);
            try {
                result.sBTCBalance = Number((_a = result.tokenBalances) === null || _a === void 0 ? void 0 : _a.fungible_tokens[contractId + "::sbtc"].balance);
            }
            catch (err) {
                result.sBTCBalance = 0;
            }
        }
        catch (err) {
            console.log("Network down...");
        }
        return result;
    });
}
function isSTX(token) {
    return token.indexOf("stx") > -1;
}
function fullBalanceAtHeight(stacksApi, stxAddress, height, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let totalBalanceAtHeight = 0;
        try {
            const response = yield (0, custom_node_1.getBalanceAtHeight)(stacksApi, stxAddress);
            totalBalanceAtHeight = Number(((_a = response.stx) === null || _a === void 0 ? void 0 : _a.balance) || 0);
            return totalBalanceAtHeight;
        }
        catch (e) {
            totalBalanceAtHeight = 0;
        }
        return totalBalanceAtHeight;
    });
}
function fullBalanceInSip10Token(stacksApi, stxAddress, tokenContract, stacksHiroKey) {
    return __awaiter(this, void 0, void 0, function* () {
        let totalBalanceAtHeight = 0;
        try {
            if (isSTX(tokenContract))
                return fullBalanceAtHeight(stacksApi, stxAddress);
            const response = yield (0, stacks_node_1.getTokenBalances)(stacksApi, stxAddress);
            const tokenEntry = Object.entries(response.fungible_tokens).find(([key]) => key.startsWith(tokenContract));
            if (tokenEntry) {
                const [tokenKey, tokenData] = tokenEntry;
                const assetName = tokenKey.split("::")[1]; // Extract the asset name
                console.log(`Asset Name: ${assetName}`);
                console.log(`Token Data:`, tokenData);
                totalBalanceAtHeight = Number((tokenData === null || tokenData === void 0 ? void 0 : tokenData.balance) || 0);
                return totalBalanceAtHeight;
            }
            else {
                console.log("Token not found.");
            }
        }
        catch (e) {
            totalBalanceAtHeight = 0;
        }
        return totalBalanceAtHeight;
    });
}
function appDetails() {
    return {
        name: "stxeco-launcher",
        icon: window ? window.location.origin + "/img/stx_eco_logo_icon_white.png" : "/img/stx_eco_logo_icon_white.png",
    };
}
function checkAddressForNetwork(net, address) {
    if (!address || typeof address !== "string")
        throw new Error("No address passed");
    if (address.length < 10)
        throw new Error("Address is undefined");
    if (net === "devnet")
        return;
    else if (net === "testnet") {
        if (address.startsWith("bc"))
            throw new Error("Mainnet address passed to testnet app: " + address);
        else if (address.startsWith("3"))
            throw new Error("Mainnet address passed to testnet app: " + address);
        else if (address.startsWith("1"))
            throw new Error("Mainnet address passed to testnet app: " + address);
        else if (address.startsWith("SP") || address.startsWith("sp"))
            throw new Error("Mainnet stacks address passed to testnet app: " + address);
    }
    else {
        if (address.startsWith("tb"))
            throw new Error("Testnet address passed to testnet app: " + address);
        else if (address.startsWith("2"))
            throw new Error("Testnet address passed to testnet app: " + address);
        else if (address.startsWith("m"))
            throw new Error("Testnet address passed to testnet app: " + address);
        else if (address.startsWith("n"))
            throw new Error("Testnet address passed to testnet app: " + address);
        else if (address.startsWith("ST") || address.startsWith("st"))
            throw new Error("Testnet stacks address passed to testnet app: " + address);
    }
}
const FORMAT = /[ `!@#$%^&*()_+=[\]{};':"\\|,<>/?~]/;
function decodeStacksAddress(stxAddress) {
    if (!stxAddress)
        throw new Error("Needs a stacks address");
    const decoded = (0, c32check_1.c32addressDecode)(stxAddress);
    return decoded;
}
function encodeStacksAddress(network, b160Address) {
    let version = 26;
    if (network === "mainnet")
        version = 22;
    const address = (0, c32check_1.c32address)(version, b160Address); // 22 for mainnet
    return address;
}
function verifyStacksPricipal(network, stacksAddress) {
    if (!stacksAddress) {
        throw new Error("Address not found");
    }
    else if (FORMAT.test(stacksAddress)) {
        throw new Error("please remove white space / special characters");
    }
    try {
        const decoded = decodeStacksAddress(stacksAddress.split(".")[0]);
        if ((network === "testnet" || network === "devnet") && decoded[0] !== 26) {
            throw new Error("Please enter a valid stacks blockchain testnet address");
        }
        if (network === "mainnet" && decoded[0] !== 22) {
            throw new Error("Please enter a valid stacks blockchain mainnet address");
        }
        return stacksAddress;
    }
    catch (err) {
        throw new Error("Invalid stacks principal - please enter a valid " + network + " account or contract principal.");
    }
}
function getNet(network) {
    let net = btc.TEST_NETWORK;
    if (network === "devnet")
        net = exports.REGTEST_NETWORK;
    else if (network === "mainnet")
        net = btc.NETWORK;
    return net;
}
exports.REGTEST_NETWORK = {
    bech32: "bcrt",
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xc4,
};
function makeFlash(el1) {
    let count = 0;
    if (!el1)
        return;
    el1.classList.add("flasherize-button");
    const ticker = setInterval(function () {
        count++;
        if (count % 2 === 0) {
            el1.classList.add("flasherize-button");
        }
        else {
            el1.classList.remove("flasherize-button");
        }
        if (count === 2) {
            el1.classList.remove("flasherize-button");
            clearInterval(ticker);
        }
    }, 2000);
}
function isLegal(routeId) {
    try {
        if (routeId.startsWith("http")) {
            if (routeId.indexOf("/deposit") > -1 || routeId.indexOf("/withdraw") > -1 || routeId.indexOf("/admin") > -1 || routeId.indexOf("/transactions") > -1) {
                return false;
            }
        }
        else if (["/deposit", "/withdraw", "/admin", "/transactions"].includes(routeId)) {
            return false;
        }
        return true;
    }
    catch (err) {
        return false;
    }
}
function verifyAmount(amount, balance) {
    if (!amount || amount === 0) {
        throw new Error("No amount entered");
    }
    if (amount >= balance) {
        throw new Error("Amount is greater than your balance");
    }
    //if (amount < minimumDeposit) {
    //	throw new Error('Amount must be at least 0.0001 or 10,000 satoshis');
    //  }
}
function verifySBTCAmount(amount, balance, fee) {
    if (!amount || amount === 0) {
        throw new Error("No amount entered");
    }
    if (amount > balance - fee) {
        throw new Error("No more then balance (less fee of " + fee + ")");
    }
}
function initAddresses(sessionStore) {
    sessionStore.update((conf) => {
        if (!conf.keySets)
            conf.keySets = { devnet: {}, testnet: {}, mainnet: {} };
        if (!conf.keySets["devnet"])
            conf.keySets["devnet"] = {};
        if (!conf.keySets["testnet"])
            conf.keySets["testnet"] = {};
        if (!conf.keySets["mainnet"])
            conf.keySets["mainnet"] = {};
        conf.stacksInfo = {};
        conf.poxInfo = {};
        conf.loggedIn = false;
        conf.exchangeRates = [];
        conf.userSettings = {};
        return conf;
    });
}
function defaultSettings() {
    return {
        debugMode: false,
        useOpDrop: false,
        peggingIn: false,
        executiveTeamMember: false,
        currency: {
            cryptoFirst: true,
            myFiatCurrency: defaultExchangeRate(),
            denomination: "USD",
        },
    };
}
function defaultExchangeRate() {
    return {
        _id: "",
        currency: "USD",
        fifteen: 0,
        last: 0,
        buy: 0,
        sell: 0,
        symbol: "USD",
        name: "BTCUSD",
        stxToBtc: 0.00000983,
        ethToBtc: 0,
        solToBtc: 0,
        suiToBtc: 0,
        tonToBtc: 0,
    };
}
