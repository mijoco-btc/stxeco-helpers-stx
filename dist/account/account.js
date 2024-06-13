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
exports.checkAddressForNetwork = exports.logUserOut = exports.loginStacksFromHeader = exports.loginStacks = exports.getStacksAddress = exports.isLoggedIn = exports.appDetails = exports.isLeather = exports.isAsigna = exports.isHiro = exports.isXverse = exports.userSession = void 0;
const connect_1 = require("@stacks/connect");
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
function isXverse() {
    //const prov1 = (window as any).LeatherProvider //getProvider()
    //const prov2 = (window as any).XverseProvider //getProvider()
    const xverse = getProvider().name.toLowerCase().indexOf('xverse') > -1;
    return xverse;
}
exports.isXverse = isXverse;
function isHiro() {
    return getProvider().name.toLowerCase().indexOf('hiro') > -1;
}
exports.isHiro = isHiro;
function isAsigna() {
    return getProvider().name.toLowerCase().indexOf('asigna') > -1;
}
exports.isAsigna = isAsigna;
function isLeather() {
    return getProvider().name.toLowerCase().indexOf('leather') > -1;
}
exports.isLeather = isLeather;
function appDetails() {
    return {
        name: 'stxeco-launcher',
        icon: (window) ? window.location.origin + '/img/stx_eco_logo_icon_white.png' : '/img/stx_eco_logo_icon_white.png',
    };
}
exports.appDetails = appDetails;
function isLoggedIn() {
    try {
        return exports.userSession.isUserSignedIn();
    }
    catch (err) {
        return false;
    }
}
exports.isLoggedIn = isLoggedIn;
function getStacksAddress(network) {
    if (isLoggedIn()) {
        const userData = exports.userSession.loadUserData();
        const stxAddress = (network === 'testnet' || network === 'devnet') ? userData.profile.stxAddress.testnet : userData.profile.stxAddress.mainnet;
        return stxAddress;
    }
    return;
}
exports.getStacksAddress = getStacksAddress;
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
exports.loginStacks = loginStacks;
function loginStacksFromHeader(document) {
    const el = document.getElementById("connect-wallet");
    if (el)
        return document.getElementById("connect-wallet").click();
    else
        return false;
}
exports.loginStacksFromHeader = loginStacksFromHeader;
function logUserOut() {
    return exports.userSession.signUserOut();
}
exports.logUserOut = logUserOut;
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
exports.checkAddressForNetwork = checkAddressForNetwork;
