import { hex } from '@scure/base';
import { bufferCV, contractPrincipalCV, noneCV, principalCV, serializeCV, stringAsciiCV, tupleCV, uintCV } from '@stacks/transactions';
import { callContractReadOnly, getPoxInfo } from '../stacks-node';
import { Delegation, PoxCycleInfo, PREPARE_CYCLE_LENGTH, REWARD_CYCLE_LENGTH, Stacker, StackerInfo } from '../pox_types';
import { fetchBlockAtHeight, getAddressFromHashBytes, getHashBytesFromAddress } from '@mijoco/btc_helpers/dist/index';
import { VerifySignerKey } from '../signer';


export async function getPoxContractFromCycle(cycle:number) {
	if (cycle < 56) {
	  return 'pox'
	} else if (cycle < 60) {
	  return 'pox-2'
	} else if (cycle < 84) {
	  return 'pox-3'
	} else {
	  return 'pox-4'
	}
}
  
export async function getBurnHeightToRewardCycle(stacksApi:string, poxContract:string, height:number):Promise<any> {
	const functionArgs = [`0x${hex.encode(serializeCV(uintCV(height)))}`];
	const data = {
	  contractAddress: poxContract.split('.')[0],
	  contractName: poxContract.split('.')[1],
	  functionName: 'burn-height-to-reward-cycle',
	  functionArgs,
	}
	let cycle:number;
	try {
	  const result = await callContractReadOnly(stacksApi, data);
	  return { cycle: result, height };
	} catch (e) { cycle = 0 }
	return { cycle, height }
}
  
export async function getRewardCycleToBurnHeight(stacksApi:string, poxContract:string, cycle:number):Promise<any> {
	const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
	const data = {
	  contractAddress: poxContract.split('.')[0],
	  contractName: poxContract.split('.')[1],
	  functionName: 'reward-cycle-to-burn-height',
	  functionArgs,
	}
	try {
	  const result = await callContractReadOnly(stacksApi, data);
	  return { cycle: result };
	} catch (e) { cycle = 0 }
	return { cycle }
}

export async function getPoxCycleInfo(stacksApi:string, poxContract:string, cycle:number):Promise<any> {
	const totalStacked = await getTotalUstxStacked(stacksApi, poxContract, cycle)
	const numRewardSetPoxAddresses = await getNumRewardSetPoxAddresses(stacksApi, poxContract, cycle)
	const numbEntriesRewardCyclePoxList = await getNumbEntriesRewardCyclePoxList(stacksApi, poxContract, cycle)
	const totalPoxRejection = await getTotalPoxRejection(stacksApi, poxContract, cycle)
	const rewardSetSize = await getRewardSetSize(stacksApi, poxContract, cycle)
	return {
	  rewardSetSize: (cycle > 0 && rewardSetSize) ? Number(rewardSetSize) : undefined,
	  numRewardSetPoxAddresses: (numRewardSetPoxAddresses) ? Number(numRewardSetPoxAddresses) : 0,
	  numbEntriesRewardCyclePoxList: (numbEntriesRewardCyclePoxList) ? Number(numbEntriesRewardCyclePoxList) : 0,
	  totalPoxRejection: (totalPoxRejection) ? Number(totalPoxRejection) : 0,
	  totalUstxStacked: totalStacked
	};
  }
  
export async function getPoxCycleInfoRelative(stacksApi:string, mempoolApi:string, poxContract:string, cycle:number, currentBurnHeight:number):Promise<PoxCycleInfo> {
  
	const result1 = await getRewardCycleToBurnHeight(stacksApi, poxContract, cycle)
	const totalStacked = await getTotalUstxStacked(stacksApi, poxContract, cycle)
	const numRewardSetPoxAddresses = await getNumRewardSetPoxAddresses(stacksApi, poxContract, cycle)
	const numbEntriesRewardCyclePoxList = await getNumbEntriesRewardCyclePoxList(stacksApi, poxContract, cycle)
	//const totalPoxRejection = await getTotalPoxRejection(stacksApi, poxContract, cycle)
	const rewardSetSize = await getRewardSetSize(stacksApi, poxContract, cycle)
  
	const firstBlockHeight = Number(result1.cycle.value)
	const lastBlockHeight = Number(result1.cycle.value) + REWARD_CYCLE_LENGTH + PREPARE_CYCLE_LENGTH - 1
	let firstBlockTime = 0
	let lastBlockTime = 0
  
	try {
	  const firstBitcoinBlock = await fetchBlockAtHeight(mempoolApi, firstBlockHeight)
	  firstBlockTime = firstBitcoinBlock.timestamp * 1000
	} catch (err:any) {// 
	}
	try {
	  const lastBitcoinBlock = await fetchBlockAtHeight(mempoolApi, lastBlockHeight)
	  lastBlockTime = lastBitcoinBlock.timestamp * 1000
	} catch (err:any) {
	  //
	}
  
	const currentBlock = await fetchBlockAtHeight(mempoolApi, currentBurnHeight)
	if (firstBlockTime === 0) {
	  const blocksToMine = firstBlockHeight - currentBurnHeight
	  firstBlockTime = (currentBlock.timestamp + (blocksToMine * 10 * 60)) * 1000
	}
	if (lastBlockTime === 0) {
	  const blocksToMine = lastBlockHeight - currentBurnHeight
	  lastBlockTime = (currentBlock.timestamp + (blocksToMine * 10 * 60)) * 1000
	}
  
	return {
	  firstBlockHeight,
	  lastBlockHeight,
	  firstBlockTime,
	  lastBlockTime,
	  rewardSetSize: (cycle > 0 && rewardSetSize) ? Number(rewardSetSize) : 0,
	  numRewardSetPoxAddresses: (numRewardSetPoxAddresses) ? Number(numRewardSetPoxAddresses) : 0,
	  numbEntriesRewardCyclePoxList: (numbEntriesRewardCyclePoxList) ? Number(numbEntriesRewardCyclePoxList) : 0,
	  totalPoxRejection: -1,
	  totalUstxStacked: totalStacked
	};
  }
  
  
  
export  async function getTotalUstxStacked(stacksApi:string, poxContract:string, cycle:number):Promise<any> {
	const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
	const data = {
	  contractAddress: poxContract.split('.')[0],
	  contractName: poxContract.split('.')[1],
	  functionName: 'get-total-ustx-stacked',
	  functionArgs,
	}
	const val = (await callContractReadOnly(stacksApi, data));
	return (val.value) ? val.value : 0;
  }
  
export  async function getRewardSetPoxAddress(stacksApi:string, poxContract:string, cycle:number, index:number):Promise<any> {
	const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`, `0x${hex.encode(serializeCV(uintCV(index)))}`];
	  const data = {
	  contractAddress: poxContract.split('.')[0],
	  contractName: poxContract.split('.')[1],
	  functionName: 'get-reward-set-pox-address',
	  functionArgs,
	}
	const val = (await callContractReadOnly(stacksApi, data));
	return (val.value) ? val.value.value: 0
  }
  
export async function getNumbEntriesRewardCyclePoxList(stacksApi:string, poxContract:string, cycle:number):Promise<any> {
	const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
	  const data = {
	  contractAddress: poxContract.split('.')[0],
	  contractName: poxContract.split('.')[1],
	  functionName: 'get-num-reward-set-pox-addresses',
	  functionArgs,
	}
	const val = (await callContractReadOnly(stacksApi, data));
	return (val.value) ? val.value: 0
  }
  
export  async function getTotalPoxRejection(stacksApi:string, poxContract:string, cycle:number):Promise<any> {
	const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
	  const data = {
	  contractAddress: poxContract.split('.')[0],
	  contractName: poxContract.split('.')[1],
	  functionName: 'get-total-pox-rejection',
	  functionArgs,
	}
	const val = (await callContractReadOnly(stacksApi, data));
	return (val.value) ? Number(val.value) : 0
  }
  
export  async function getRewardSetSize(stacksApi:string, poxContract:string, cycle:number):Promise<any> {
	const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
	const data = {
	  contractAddress: poxContract.split('.')[0],
	  contractName: poxContract.split('.')[1],
	  functionName: 'get-reward-set-size',
	  functionArgs,
	}
	const val = (await callContractReadOnly(stacksApi, data));
	return (val.value) ? val.value: 0
  }
  
export  async function getNumRewardSetPoxAddresses(stacksApi:string, poxContract:string, cycle:number):Promise<any> {
	const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
	const data = {
	  contractAddress: poxContract.split('.')[0],
	  contractName: poxContract.split('.')[1],
	  functionName: 'get-num-reward-set-pox-addresses',
	  functionArgs,
	}
	try {
	  const result = await callContractReadOnly(stacksApi, data);
	  return result.value;
	} catch (e) {
	  return { stacked: 0 }
	}
}
  
export async function getAllowanceContractCallers(stacksApi:string, poxContractId:string, address:string, contract:string):Promise<any> {
	const functionArgs = [`0x${hex.encode(serializeCV(principalCV(address)))}`, `0x${hex.encode(serializeCV(contractPrincipalCV(contract.split('.')[0], contract.split('.')[1] )))}`];
	const data = {
	  contractAddress: poxContractId.split('.')[0],
	  contractName: poxContractId.split('.')[1],
	  functionName: 'get-allowance-contract-callers',
	  functionArgs,
	}
	let funding:string;
	try {
	  const result = await callContractReadOnly(stacksApi, data);
	  return result;
	} catch (e) { funding = '0' }
	return { stacked: 0 }
}

export async function getPartialStackedByCycle(stacksApi:string, network:string, poxContractId:string, address:string, cycle:number, sender:string):Promise<any> {
	const poxAddress = getHashBytesFromAddress(network, address)
	if (!poxAddress) return;
	console.debug('getPartialStackedByCycle 1: ' + address)
	console.debug('getPartialStackedByCycle: ', poxAddress)
	try {
	  const functionArgs = [
		`0x${hex.encode(serializeCV(tupleCV({version: bufferCV(hex.decode(poxAddress.version)), hashbytes: bufferCV(hex.decode(poxAddress.hashBytes))})))}`,
		`0x${hex.encode(serializeCV(uintCV(cycle)))}`,
		(sender.indexOf('.') === -1) ? `0x${hex.encode(serializeCV(principalCV(sender)))}` : `0x${hex.encode(serializeCV(contractPrincipalCV(sender.split('.')[0], sender.split('.')[1] )))}`
	  ];
	  const data = {
		contractAddress: poxContractId.split('.')[0],
		contractName: poxContractId.split('.')[1],
		functionName: 'get-partial-stacked-by-cycle',
		functionArgs,
	  }
	  const result = await callContractReadOnly(stacksApi, data);
	  return (result.value) ? Number(result.value) : 0;
	} catch (e) {
	  return { stacked: 0 }
	}
  }

  export async function getStackerInfoFromContract(stacksApi:string, network:string, poxContractId:string, address:string, cycle:number):Promise<StackerInfo> {
	return {
	  cycle,
	  stacksAddress: address,
	  stacker: await getStackerInfo(stacksApi, network, poxContractId, address),
	  delegation: await getCheckDelegation(stacksApi, poxContractId, address),
	  poxRejection: (cycle > 0) ? await getPoxRejection(stacksApi, poxContractId, address, cycle) : undefined,
	};
  }
  
  async function getStackerInfo(stacksApi:string, network:string, poxContractId:string, address:string):Promise<Stacker|undefined> {
	const functionArgs = [`0x${hex.encode(serializeCV(principalCV(address)))}`];
	const data = {
	  contractAddress: poxContractId.split('.')[0],
	  contractName: poxContractId.split('.')[1],
	  functionName: 'get-stacker-info',
	  functionArgs,
	}
	let funding:string;
	try {
	  const result = await callContractReadOnly(stacksApi, data);
	  return (result.value) ? {
		rewardSetIndexes: result.value.value['reward-set-indexes'].value,
		lockPeriod: result.value.value['reward-set-indexes'].value,
		firstRewardCycle: result.value.value['first-reward-cycle'].value,
		poxAddr: { 
		  version: result.value.value['pox-addr'].value.version.value, 
		  hashBytes: result.value.value['pox-addr'].value.hashbytes.value
		},
		bitcoinAddr: getAddressFromHashBytes(network, result.value.value['pox-addr'].value.hashbytes.value, result.value.value['pox-addr'].value.version.value),
	  } : undefined;
  
	  /**
	  ;; how long the uSTX are locked, in reward cycles.
	  ;; reward cycle when rewards begin
	  ;; indexes in each reward-set associated with this user.
	  ;; these indexes are only valid looking forward from
	  ;;  `first-reward-cycle` (i.e., they do not correspond
	  ;;  to entries in the reward set that may have been from
	  ;;  previous stack-stx calls, or prior to an extend)
	  ;; principal of the delegate, if stacker has delegated
	   */
  
  
	} catch (e) { funding = '0' }
	return
  }
export async function getCheckDelegation(stacksApi:string, poxContractId:string, address:string):Promise<Delegation> {
	try {
	  const functionArgs = [`0x${hex.encode(serializeCV(principalCV(address)))}`];
	  const data = {
		contractAddress: poxContractId.split('.')[0],
		contractName: poxContractId.split('.')[1],
		functionName: 'get-check-delegation',
		functionArgs,
	  }
	  const val = await callContractReadOnly(stacksApi, data);
	  //console.log('getCheckDelegation: ', val.value)
	  return (val.value) ? {
		amountUstx: Number(val.value.value['amount-ustx'].value),
		delegatedTo: val.value.value['delegated-to'].value,
		untilBurnHt: val.value.value['pox-addr'].value,
		poxAddr: val.value.value['until-burn-ht'].value || 0,
	  } : {
		amountUstx: 0,
		delegatedTo: undefined,
		untilBurnHt: 0,
		poxAddr: undefined
	  }
	} catch(err:any) {
	  console.error('getCheckDelegation: error: ' + err.message)
	  return {} as Delegation
	}
}

export async function getPoxRejection(stacksApi:string, poxContractId:string, address:string, cycle:number):Promise<any> {
	const functionArgs = [`0x${hex.encode(serializeCV(principalCV(address)))}`,`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
	const data = {
	  contractAddress: poxContractId.split('.')[0],
	  contractName: poxContractId.split('.')[1],
	  functionName: 'get-pox-rejection',
	  functionArgs,
	}
	const val = (await callContractReadOnly(stacksApi, data));
	return (val.value) ? { poxRejectionPerStackerPerCycle: val.value.value } : { poxRejectionPerStackerPerCycle: 0 }
}

export async function checkCallerAllowed(stacksApi:string, poxContractId:string, stxAddress:string):Promise<any> {
	const data = {
	  contractAddress: poxContractId.split('.')[0],
	  sender: stxAddress,
	  contractName: poxContractId.split('.')[1],
	  functionName: 'check-caller-allowed',
	  functionArgs: [],
	}
	let allowed:false;
	try {
	  const result = await callContractReadOnly(stacksApi, data);
	  return { allowed: result };
	} catch (e) { allowed = false }
	return { allowed: false }
  }

  export async function verifySignerKeySig(stacksApi:string, network:string, poxContractId:string, auth:VerifySignerKey):Promise<Stacker|undefined> {
	const poxAddress = getHashBytesFromAddress(network, auth.rewardAddress)
	if (!poxAddress) return
	if (!auth.signerKey) return
	const functionArgs = [
	  `0x${hex.encode(serializeCV(tupleCV({version: bufferCV(hex.decode(poxAddress.version)), hashbytes: bufferCV(hex.decode(poxAddress.hashBytes))})))}`,
	  `0x${hex.encode(serializeCV(uintCV(auth.rewardCycle)))}`,
	  `0x${hex.encode(serializeCV(stringAsciiCV(auth.topic)))}`,
	  `0x${hex.encode(serializeCV(uintCV(auth.period)))}`,
	  `0x${hex.encode(serializeCV(noneCV()))}`,
	  `0x${hex.encode(serializeCV(bufferCV(hex.decode(auth.signerKey))))}`,
	  `0x${hex.encode(serializeCV(uintCV(auth.amount)))}`,
	  `0x${hex.encode(serializeCV(uintCV(auth.maxAmount)))}`,
	  `0x${hex.encode(serializeCV(uintCV(auth.authId)))}`,
	];
	const data = {
	  contractAddress: poxContractId.split('.')[0],
	  contractName: poxContractId.split('.')[1],
	  functionName: 'verify-signer-key-sig',
	  functionArgs,
	}
	let funding:string;
	try {
	  const result = await callContractReadOnly(stacksApi, data);
	  console.log('verifySignerKeySig: ' + result)
	  return result;
  
	} catch (e) { funding = '0' }
	return
  }
  

  export async function readDelegationEvents(stacksApi:string, network:string, poxContract:string, poolPrincipal:string, offset:number, limit:number) {

	const poxInfo = await getPoxInfo(stacksApi)
	const url = stacksApi + '/extended/beta/stacking/' + poolPrincipal + '/delegations?offset=' + offset + '&limit=' + limit;
	console.log('readDelegationEvents: ' + url);
	try {
	  const response = await fetch(url);
	  const val = await response.json();
	  if (val) {
		for (const event of val.results) {
		  const cycle = await getBurnHeightToRewardCycle(stacksApi, poxContract, event.block_height)
		  if (cycle >= startSlot(network)) event.cycle = cycle
		}
	  }
	  return val;
	} catch (err:any) {
		console.error('readDelegationEvents: ' + err.message);
	}
  }

  export function startSlot(network:string) {
	if (network === 'mainnet') {
	  return 60 // first after 2.1 bug when everyone had to re-stack
	} else {
	  return 500
	}
  }
  