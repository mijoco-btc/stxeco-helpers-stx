import { AppConfig, UserSession, showConnect, getStacksProvider, type StacksProvider } from '@stacks/connect';
import { c32address, c32addressDecode } from 'c32check';
import { AddressObject } from '../sbtc';
import { getWalletBalances } from '../custom-node';
import { getTokenBalances } from '../stacks-node';
import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';


const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig }); // we will use this export from other files
let provider:StacksProvider;

function getProvider() {
	if (!provider) provider = getStacksProvider()
	const prod = (provider.getProductInfo) ? provider.getProductInfo() : undefined;
	if (!prod) throw new Error('Provider not found')
	return prod
}

export async function getBalances(stacksApi:string, mempoolApi:string, contractId:string, stxAddress:string, cardinal:string, ordinal:string):Promise<AddressObject> {
	let result = {} as AddressObject;
	try {
		result.tokenBalances = await getTokenBalances(stacksApi, stxAddress);
		result.walletBalances = await getWalletBalances(stacksApi, mempoolApi, stxAddress, cardinal, ordinal);
		try {
			result.sBTCBalance = Number(result.tokenBalances?.fungible_tokens[contractId + '::sbtc'].balance)
		} catch (err) {
			result.sBTCBalance = 0
		}
	} catch(err) {
		console.log('Network down...');
	}
	return result;
}

export function isXverse() {
	//const prov1 = (window as any).LeatherProvider //getProvider()
	//const prov2 = (window as any).XverseProvider //getProvider()
	const xverse = getProvider().name.toLowerCase().indexOf('xverse') > -1
	return xverse
}

export function isHiro() {
	return getProvider().name.toLowerCase().indexOf('hiro') > -1
}

export function isAsigna() {
	return getProvider().name.toLowerCase().indexOf('asigna') > -1
}

export function isLeather() {
	return getProvider().name.toLowerCase().indexOf('leather') > -1
}

export function appDetails() {
	return {
		name: 'stxeco-launcher',
		icon: (window) ? window.location.origin + '/img/stx_eco_logo_icon_white.png' : '/img/stx_eco_logo_icon_white.png',
	}
}

export function isLoggedIn():boolean {
	try {
		return userSession.isUserSignedIn()
	} catch (err) {
		return false
	}
}

export function getStacksAddress(network:string) {
	if (isLoggedIn()) {
		const userData = userSession.loadUserData();
		const stxAddress = (network === 'testnet' || network === 'devnet') ? userData.profile.stxAddress.testnet : userData.profile.stxAddress.mainnet;
		return stxAddress
	}
	return
}

export async function loginStacks(callback:any) {
	try {
		const provider = getProvider()
		console.log('provider: ', provider)
		if (!userSession.isUserSignedIn()) {
			showConnect({
				userSession,
				appDetails: appDetails(),
				onFinish: async (e:unknown) => {
					console.log(e)
					await callback(true);
					window.location.reload()
				},
				onCancel: () => {
					callback(false);
				},
			});
		} else {
			callback(true);
		}
	} catch (e) {
		if (window) window.location.href = "https://wallet.hiro.so/wallet/install-web";
		callback(false);
	}
}

export function loginStacksFromHeader(document:any) {
	const el = document.getElementById("connect-wallet")
	if (el) return document.getElementById("connect-wallet").click();
	else return false;
}

export function logUserOut() {
	return userSession.signUserOut();
}

export function checkAddressForNetwork(net:string, address:string|undefined) {
	if (!address || typeof address !== 'string') throw new Error('No address passed')
  if (address.length < 10) throw new Error('Address is undefined')
  if (net === 'devnet') return
	else if (net === 'testnet') {
	  if (address.startsWith('bc')) throw new Error('Mainnet address passed to testnet app: ' + address)
	  else if (address.startsWith('3')) throw new Error('Mainnet address passed to testnet app: ' + address)
	  else if (address.startsWith('1')) throw new Error('Mainnet address passed to testnet app: ' + address)
	  else if (address.startsWith('SP') || address.startsWith('sp')) throw new Error('Mainnet stacks address passed to testnet app: ' + address)
	} else {
	  if (address.startsWith('tb')) throw new Error('Testnet address passed to testnet app: ' + address)
	  else if (address.startsWith('2')) throw new Error('Testnet address passed to testnet app: ' + address)
	  else if (address.startsWith('m')) throw new Error('Testnet address passed to testnet app: ' + address)
	  else if (address.startsWith('n')) throw new Error('Testnet address passed to testnet app: ' + address)
	  else if (address.startsWith('ST') || address.startsWith('st')) throw new Error('Testnet stacks address passed to testnet app: ' + address)
	}
}

const FORMAT = /[ `!@#$%^&*()_+=[\]{};':"\\|,<>/?~]/;

export function decodeStacksAddress(stxAddress:string) {
	if (!stxAddress) throw new Error('Needs a stacks address');
	const decoded = c32addressDecode(stxAddress)
	return decoded
}
  
export function encodeStacksAddress (network:string, b160Address:string) {
	let version = 26
	if (network === 'mainnet') version = 22
	const address = c32address(version, b160Address) // 22 for mainnet
	return address
}

export function verifyStacksPricipal(network:string, stacksAddress?:string) {
	if (!stacksAddress) {
	  throw new Error('Address not found');
	} else if (FORMAT.test(stacksAddress)) {
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
	  } catch (err:any) {
		  throw new Error('Invalid stacks principal - please enter a valid ' + network + ' account or contract principal.');
	  }
}

export function getNet(network:string) {
	let net = btc.TEST_NETWORK;
	if (network === 'devnet') net = REGTEST_NETWORK
	else if (network === 'mainnet') net = btc.NETWORK
	return net;
}
export const REGTEST_NETWORK: typeof btc.NETWORK = { bech32: 'bcrt', pubKeyHash: 0x6f, scriptHash: 0xc4, wif: 0xc4 };

