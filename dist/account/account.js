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
exports.REGTEST_NETWORK = exports.userSession = void 0;
exports.getBalances = getBalances;
exports.isXverse = isXverse;
exports.isHiro = isHiro;
exports.isAsigna = isAsigna;
exports.isLeather = isLeather;
exports.appDetails = appDetails;
exports.isLoggedIn = isLoggedIn;
exports.getStacksAddress = getStacksAddress;
exports.loginStacks = loginStacks;
exports.loginStacksFromHeader = loginStacksFromHeader;
exports.logUserOut = logUserOut;
exports.checkAddressForNetwork = checkAddressForNetwork;
exports.decodeStacksAddress = decodeStacksAddress;
exports.encodeStacksAddress = encodeStacksAddress;
exports.verifyStacksPricipal = verifyStacksPricipal;
exports.getNet = getNet;
const connect_1 = require("@stacks/connect");
const c32check_1 = require("c32check");
const custom_node_1 = require("../custom-node");
const stacks_node_1 = require("../stacks-node");
const btc = __importStar(require("@scure/btc-signer"));
const appConfig = new connect_1.AppConfig(['store_write', 'publish_data']);
exports.userSession = new connect_1.UserSession({ appConfig }); // we will use this export from other files
let provider;
function getProvider() {
    if (!provider)
        provider = (0, connect_1.getStacksProvider)();
    const prod = (provider.getProductInfo) ? provider.getProductInfo() : undefined;
    if (!prod)
        throw new Error('Provider not found');
    return prod;
}
function getBalances(stacksApi, mempoolApi, contractId, stxAddress, cardinal, ordinal) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let result = {};
        try {
            result.tokenBalances = yield (0, stacks_node_1.getTokenBalances)(stacksApi, stxAddress);
            result.walletBalances = yield (0, custom_node_1.getWalletBalances)(stacksApi, mempoolApi, stxAddress, cardinal, ordinal);
            try {
                result.sBTCBalance = Number((_a = result.tokenBalances) === null || _a === void 0 ? void 0 : _a.fungible_tokens[contractId + '::sbtc'].balance);
            }
            catch (err) {
                result.sBTCBalance = 0;
            }
        }
        catch (err) {
            console.log('Network down...');
        }
        return result;
    });
}
function isXverse() {
    //const prov1 = (window as any).LeatherProvider //getProvider()
    //const prov2 = (window as any).XverseProvider //getProvider()
    const xverse = getProvider().name.toLowerCase().indexOf('xverse') > -1;
    return xverse;
}
function isHiro() {
    return getProvider().name.toLowerCase().indexOf('hiro') > -1;
}
function isAsigna() {
    return getProvider().name.toLowerCase().indexOf('asigna') > -1;
}
function isLeather() {
    return getProvider().name.toLowerCase().indexOf('leather') > -1;
}
function appDetails() {
    return {
        name: 'stxeco-launcher',
        icon: (window) ? window.location.origin + '/img/stx_eco_logo_icon_white.png' : '/img/stx_eco_logo_icon_white.png',
    };
}
function isLoggedIn() {
    try {
        return exports.userSession.isUserSignedIn();
    }
    catch (err) {
        return false;
    }
}
function getStacksAddress(network) {
    if (isLoggedIn()) {
        const userData = exports.userSession.loadUserData();
        const stxAddress = (network === 'testnet' || network === 'devnet') ? userData.profile.stxAddress.testnet : userData.profile.stxAddress.mainnet;
        return stxAddress;
    }
    return;
}
function loginStacks(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const provider = getProvider();
            console.log('provider: ', provider);
            if (!exports.userSession.isUserSignedIn()) {
                (0, connect_1.showConnect)({
                    userSession: exports.userSession,
                    appDetails: appDetails(),
                    onFinish: (e) => __awaiter(this, void 0, void 0, function* () {
                        console.log(e);
                        yield callback(true);
                        window.location.reload();
                    }),
                    onCancel: () => {
                        callback(false);
                    },
                });
            }
            else {
                callback(true);
            }
        }
        catch (e) {
            if (window)
                window.location.href = "https://wallet.hiro.so/wallet/install-web";
            callback(false);
        }
    });
}
function loginStacksFromHeader(document) {
    const el = document.getElementById("connect-wallet");
    if (el)
        return document.getElementById("connect-wallet").click();
    else
        return false;
}
function logUserOut() {
    return exports.userSession.signUserOut();
}
function checkAddressForNetwork(net, address) {
    if (!address || typeof address !== 'string')
        throw new Error('No address passed');
    if (address.length < 10)
        throw new Error('Address is undefined');
    if (net === 'devnet')
        return;
    else if (net === 'testnet') {
        if (address.startsWith('bc'))
            throw new Error('Mainnet address passed to testnet app: ' + address);
        else if (address.startsWith('3'))
            throw new Error('Mainnet address passed to testnet app: ' + address);
        else if (address.startsWith('1'))
            throw new Error('Mainnet address passed to testnet app: ' + address);
        else if (address.startsWith('SP') || address.startsWith('sp'))
            throw new Error('Mainnet stacks address passed to testnet app: ' + address);
    }
    else {
        if (address.startsWith('tb'))
            throw new Error('Testnet address passed to testnet app: ' + address);
        else if (address.startsWith('2'))
            throw new Error('Testnet address passed to testnet app: ' + address);
        else if (address.startsWith('m'))
            throw new Error('Testnet address passed to testnet app: ' + address);
        else if (address.startsWith('n'))
            throw new Error('Testnet address passed to testnet app: ' + address);
        else if (address.startsWith('ST') || address.startsWith('st'))
            throw new Error('Testnet stacks address passed to testnet app: ' + address);
    }
}
const FORMAT = /[ `!@#$%^&*()_+=[\]{};':"\\|,<>/?~]/;
function decodeStacksAddress(stxAddress) {
    if (!stxAddress)
        throw new Error('Needs a stacks address');
    const decoded = (0, c32check_1.c32addressDecode)(stxAddress);
    return decoded;
}
function encodeStacksAddress(network, b160Address) {
    let version = 26;
    if (network === 'mainnet')
        version = 22;
    const address = (0, c32check_1.c32address)(version, b160Address); // 22 for mainnet
    return address;
}
function verifyStacksPricipal(network, stacksAddress) {
    if (!stacksAddress) {
        throw new Error('Address not found');
    }
    else if (FORMAT.test(stacksAddress)) {
        throw new Error('please remove white space / special characters');
    }
    try {
        const decoded = decodeStacksAddress(stacksAddress.split('.')[0]);
        if ((network === 'testnet' || network === 'devnet') && decoded[0] !== 26) {
            throw new Error('Please enter a valid stacks blockchain testnet address');
        }
        if (network === 'mainnet' && decoded[0] !== 22) {
            throw new Error('Please enter a valid stacks blockchain mainnet address');
        }
        return stacksAddress;
    }
    catch (err) {
        throw new Error('Invalid stacks principal - please enter a valid ' + network + ' account or contract principal.');
    }
}
function getNet(network) {
    let net = btc.TEST_NETWORK;
    if (network === 'devnet')
        net = exports.REGTEST_NETWORK;
    else if (network === 'mainnet')
        net = btc.NETWORK;
    return net;
}
exports.REGTEST_NETWORK = { bech32: 'bcrt', pubKeyHash: 0x6f, scriptHash: 0xc4, wif: 0xc4 };
