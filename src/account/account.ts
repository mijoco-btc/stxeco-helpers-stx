import { c32address, c32addressDecode } from "c32check";
import { AddressObject, ExchangeRate, SbtcUserSettingI } from "../sbtc";
import { getBalanceAtHeight, getWalletBalances } from "../custom-node";
import { fetchStacksInfo, getPoxInfo, getTokenBalances } from "../stacks-node";
import * as btc from "@scure/btc-signer";
import { SessionStore } from "../stxeco_types";
import { PoxInfo, StacksInfo } from "../pox_types";

export async function getBalances(stacksApi: string, mempoolApi: string, contractId: string, stxAddress: string, cardinal: string, ordinal: string, stacksHiroKey?: string): Promise<AddressObject> {
  let result = {} as AddressObject;
  try {
    result.tokenBalances = await getTokenBalances(stacksApi, stxAddress);
    result.walletBalances = await getWalletBalances(stacksApi, mempoolApi, stxAddress, cardinal, ordinal);
    try {
      result.sBTCBalance = Number(result.tokenBalances?.fungible_tokens[contractId + "::sbtc"].balance);
    } catch (err) {
      result.sBTCBalance = 0;
    }
  } catch (err) {
    console.log("Network down...");
  }
  return result;
}

export function isSTX(token: string) {
  return token.indexOf("stx") > -1;
}

export async function fullBalanceAtHeight(stacksApi: string, stxAddress: string, height?: number, stacksHiroKey?: string): Promise<number> {
  let totalBalanceAtHeight = 0;
  try {
    const response = await getBalanceAtHeight(stacksApi, stxAddress);
    totalBalanceAtHeight = Number(response.stx?.balance || 0);
    return totalBalanceAtHeight;
  } catch (e: any) {
    totalBalanceAtHeight = 0;
  }
  return totalBalanceAtHeight;
}

export async function fullBalanceInSip10Token(stacksApi: string, stxAddress: string, tokenContract: string, stacksHiroKey?: string): Promise<number> {
  let totalBalanceAtHeight = 0;
  try {
    if (isSTX(tokenContract)) return fullBalanceAtHeight(stacksApi, stxAddress);
    const response = await getTokenBalances(stacksApi, stxAddress);
    const tokenEntry = Object.entries(response.fungible_tokens).find(([key]) => key.startsWith(tokenContract));
    if (tokenEntry) {
      const [tokenKey, tokenData] = tokenEntry;
      const assetName = tokenKey.split("::")[1]; // Extract the asset name
      console.log(`Asset Name: ${assetName}`);
      console.log(`Token Data:`, tokenData);
      totalBalanceAtHeight = Number((tokenData as any)?.balance || 0);
      return totalBalanceAtHeight;
    } else {
      console.log("Token not found.");
    }
  } catch (e: any) {
    totalBalanceAtHeight = 0;
  }
  return totalBalanceAtHeight;
}

export function appDetails() {
  return {
    name: "stxeco-launcher",
    icon: window ? window.location.origin + "/img/stx_eco_logo_icon_white.png" : "/img/stx_eco_logo_icon_white.png",
  };
}

export function checkAddressForNetwork(net: string, address: string | undefined) {
  if (!address || typeof address !== "string") throw new Error("No address passed");
  if (address.length < 10) throw new Error("Address is undefined");
  if (net === "devnet") return;
  else if (net === "testnet") {
    if (address.startsWith("bc")) throw new Error("Mainnet address passed to testnet app: " + address);
    else if (address.startsWith("3")) throw new Error("Mainnet address passed to testnet app: " + address);
    else if (address.startsWith("1")) throw new Error("Mainnet address passed to testnet app: " + address);
    else if (address.startsWith("SP") || address.startsWith("sp")) throw new Error("Mainnet stacks address passed to testnet app: " + address);
  } else {
    if (address.startsWith("tb")) throw new Error("Testnet address passed to testnet app: " + address);
    else if (address.startsWith("2")) throw new Error("Testnet address passed to testnet app: " + address);
    else if (address.startsWith("m")) throw new Error("Testnet address passed to testnet app: " + address);
    else if (address.startsWith("n")) throw new Error("Testnet address passed to testnet app: " + address);
    else if (address.startsWith("ST") || address.startsWith("st")) throw new Error("Testnet stacks address passed to testnet app: " + address);
  }
}

const FORMAT = /[ `!@#$%^&*()_+=[\]{};':"\\|,<>/?~]/;

export function decodeStacksAddress(stxAddress: string) {
  if (!stxAddress) throw new Error("Needs a stacks address");
  const decoded = c32addressDecode(stxAddress);
  return decoded;
}

export function encodeStacksAddress(network: string, b160Address: string) {
  let version = 26;
  if (network === "mainnet") version = 22;
  const address = c32address(version, b160Address); // 22 for mainnet
  return address;
}

export function verifyStacksPricipal(network: string, stacksAddress?: string) {
  if (!stacksAddress) {
    throw new Error("Address not found");
  } else if (FORMAT.test(stacksAddress)) {
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
  } catch (err: any) {
    throw new Error("Invalid stacks principal - please enter a valid " + network + " account or contract principal.");
  }
}

export function getNet(network: string) {
  let net = btc.TEST_NETWORK;
  if (network === "devnet") net = REGTEST_NETWORK;
  else if (network === "mainnet") net = btc.NETWORK;
  return net;
}
export const REGTEST_NETWORK: typeof btc.NETWORK = {
  bech32: "bcrt",
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xc4,
};

export function makeFlash(el1: HTMLElement | null) {
  let count = 0;
  if (!el1) return;
  el1.classList.add("flasherize-button");
  const ticker = setInterval(function () {
    count++;
    if (count % 2 === 0) {
      el1.classList.add("flasherize-button");
    } else {
      el1.classList.remove("flasherize-button");
    }
    if (count === 2) {
      el1.classList.remove("flasherize-button");
      clearInterval(ticker);
    }
  }, 2000);
}

export function isLegal(routeId: string): boolean {
  try {
    if (routeId.startsWith("http")) {
      if (routeId.indexOf("/deposit") > -1 || routeId.indexOf("/withdraw") > -1 || routeId.indexOf("/admin") > -1 || routeId.indexOf("/transactions") > -1) {
        return false;
      }
    } else if (["/deposit", "/withdraw", "/admin", "/transactions"].includes(routeId)) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

export function verifyAmount(amount: number, balance: number) {
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
export function verifySBTCAmount(amount: number, balance: number, fee: number) {
  if (!amount || amount === 0) {
    throw new Error("No amount entered");
  }
  if (amount > balance - fee) {
    throw new Error("No more then balance (less fee of " + fee + ")");
  }
}

export function initAddresses(sessionStore: any) {
  sessionStore.update((conf: SessionStore) => {
    if (!conf.keySets) conf.keySets = { devnet: {} as AddressObject, testnet: {} as AddressObject, mainnet: {} as AddressObject };
    if (!conf.keySets["devnet"]) conf.keySets["devnet"] = {} as AddressObject;
    if (!conf.keySets["testnet"]) conf.keySets["testnet"] = {} as AddressObject;
    if (!conf.keySets["mainnet"]) conf.keySets["mainnet"] = {} as AddressObject;
    conf.stacksInfo = {} as StacksInfo;
    conf.poxInfo = {} as PoxInfo;
    conf.loggedIn = false;
    conf.exchangeRates = [] as Array<ExchangeRate>;
    conf.userSettings = {} as SbtcUserSettingI;
    return conf;
  });
}

export function defaultSettings(): SbtcUserSettingI {
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

export function defaultExchangeRate(): ExchangeRate {
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
