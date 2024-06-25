/**
 * sbtc - interact with Stacks Blockchain to read sbtc contract info
 */
import { principalCV, serializeCV } from '@stacks/transactions';
import { hex } from '@scure/base';
import { AddressMempoolObject, AddressObject, BalanceI, SbtcContractDataType } from '../sbtc';
import { getNet } from '../account';
import * as btc from '@scure/btc-signer';
import { callContractReadOnly } from '../stacks-node';

const limit = 10;

const noArgMethods = [
  'get-bitcoin-wallet-public-key',
  'get-token-uri',
  'get-total-supply',
  'get-decimals',
  'get-name',
]

export async function fetchNoArgsReadOnly(stacksApi:string, network:string, contractId:string):Promise<SbtcContractDataType> {
  const result = {} as SbtcContractDataType
  if (!contractId || contractId.length === 0) return {} as SbtcContractDataType

  //checkAddressForNetwork(getConfig().network, contractId)
  const data = {
    contractAddress: contractId!.split('.')[0],
    contractName: contractId!.split('.')[1],
    functionName: '',
    functionArgs: [],
    network
  }
  for (let arg in noArgMethods) {
    let funcname = noArgMethods[arg]
    let  response;
    try {
      data.functionName = funcname;
      response = await callContractReadOnly(stacksApi, data);
      resolveArg(network, result, response, funcname)
    } catch (err:any) {
      console.log('Error fetching sbtc alpha data from sbtc contract arg: ' + funcname)
    }
  }
  result.contractId = contractId;
  return result;
}

function resolveArg(network:string, result:SbtcContractDataType, response:any, arg:string) {
  let current = response
  if (response.value && response.value.value) {
    current = response.value.value
  }
  switch (arg) {
    case 'get-bitcoin-wallet-public-key':
      //console.log('get-bitcoin-wallet-public-key: response: ', response)
      try {
        const fullPK = response.value.value.split('x')[1];
        result.sbtcWalletAddress = getPegWalletAddressFromPublicKey(network, fullPK)
        result.sbtcWalletPublicKey = fullPK
        // converting to x-only..
        //result.sbtcWalletPublicKey = fullPK;
        //try {
        //  const net = (getConfig().network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
        //  const trObj = btc.p2tr(fullPK.substring(1), undefined, net);
        //  if (trObj.type === 'tr') result.sbtcWalletAddress = trObj.address;
       //} catch (err:any) {
        //  console.log('get-bitcoin-wallet-public-key: getting key: ' + fullPK)
        //}
      } catch(err) {
        console.log('get-bitcoin-wallet-public-key: current: ', current)
        console.log('get-bitcoin-wallet-public-key: err: ', err)
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

export async function fetchSbtcWalletAddress(stacksApi:string, network:string, contractId:string) {
  try {
    if (!contractId || contractId.length === 0) return
    const data = {
      contractAddress: contractId!.split('.')[0],
      contractName: contractId!.split('.')[1],
      functionName: 'get-bitcoin-wallet-public-key',
      functionArgs: [],
      network
    }
    const result = await callContractReadOnly(stacksApi, data);
    if (result.value && result.value.value) {
      return result.value.value
    }
    if (result.type.indexOf('some') > -1) return result.value
    if (network === 'testnet') {
      return 'tb1q....'; // alice
    }
  } catch (err) {
    return 'tb1qa....';
  }
}

export async function fetchUserSbtcBalance(stacksApi:string, network:string, contractId:string, stxAddress:string):Promise<BalanceI> {
  try {
    if (!contractId || contractId.length === 0) return { balance: 0 }
    const functionArgs = [`0x${hex.encode(serializeCV(principalCV(stxAddress)))}`];
    const data = {
      contractAddress: contractId!.split('.')[0],
      contractName: contractId!.split('.')[1],
      functionName: 'get-balance',
      functionArgs,
      network
    }
    const result = await callContractReadOnly(stacksApi, data);
    if (result.value && result.value.value) {
      return { balance: Number(result.value.value) };
    }
    return { balance: 0 };
  } catch (err) {
    return { balance: 0 };
  }
}

export async function fetchUserBalances(stacksApi:string, mempoolApi:string, stxAddress:string, cardinal:string, ordinal:string):Promise<AddressObject> {
  const userBalances:AddressObject = {} as AddressObject;
  userBalances.stxAddress = stxAddress;
  userBalances.cardinal = cardinal;
  userBalances.ordinal = ordinal;
  try {
    //checkAddressForNetwork(getConfig().network, stxAddress)
    //checkAddressForNetwork(getConfig().network, cardinal)
    //checkAddressForNetwork(getConfig().network, ordinal)
    if (userBalances.stxAddress) {
      const url = `${stacksApi}/extended/v1/address/${userBalances.stxAddress}/balances`;
      const response = await fetch(url);
      const result:any = await response.json();
      //userBalances.stacksTokenInfo = result;
    }
  } catch(err:any) {
    //console.error('fetchUserBalances: stacksTokenInfo: ' + err.message)
  }
  // fetch bns info
  try {
    const url = `${stacksApi}/v1/addresses/stacks/${stxAddress}`;
    const response = await fetch(url);
    const result:any = await response.json();
    userBalances.bnsNameInfo = result
  } catch(err:any) {
    userBalances.bnsNameInfo = { names: [] }
    console.log('fetchUserBalances: sBtcBalance: ' + err.message)
  }
  try {
    //checkAddressForNetwork(getConfig().network, userBalances.cardinal)
    const address:AddressMempoolObject = await fetchAddress(mempoolApi, userBalances.cardinal);
    userBalances.cardinalInfo = address
  } catch(err:any) {
    console.log('fetchUserBalances: cardinalInfo: ' + err.message)
  }
  try {
    //checkAddressForNetwork(getConfig().network, userBalances.cardinal)
    const address:AddressMempoolObject = await fetchAddress(mempoolApi, userBalances.ordinal);
    userBalances.ordinalInfo = address
  } catch(err:any) {
    console.log('fetchUserBalances: ordinalInfo: ' + err.message)
  }
  return userBalances;
}

export async function fetchAddress(mempoolUrl:string, address:string):Promise<AddressMempoolObject> {
  const url = `${mempoolUrl}/address/${address}`;
  const response = await fetch(url);
  const result = await response.json();
  return result;
}

export function getPegWalletAddressFromPublicKey (network:string, sbtcWalletPublicKey:string) {
	if (!sbtcWalletPublicKey) return
	let net = getNet(network);
	//if (network === 'development' || network === 'simnet') {
	//	net = { bech32: 'bcrt', pubKeyHash: 0x6f, scriptHash: 0xc4, wif: 0 }
	//}
	const fullPK = hex.decode(sbtcWalletPublicKey);
	let xOnlyKey = fullPK;
	if (fullPK.length === 33) {
		xOnlyKey = fullPK.subarray(1)
	}
	//const addr = btc.Address(net).encode({type: 'tr', pubkey: xOnlyKey})
	const trObj = btc.p2tr(xOnlyKey, undefined, net);
	return trObj.address;
}