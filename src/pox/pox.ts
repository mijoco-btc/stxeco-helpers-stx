import { hex } from "@scure/base";
import { bufferCV, contractPrincipalCV, noneCV, principalCV, serializeCV, stringAsciiCV, tupleCV, uintCV } from "@stacks/transactions";
import { callContractReadOnly, getPoxInfo } from "../stacks-node";
import { Delegation, PoxCycleInfo, PREPARE_CYCLE_LENGTH, REWARD_CYCLE_LENGTH, Stacker, StackerInfo } from "../pox_types";
// import {
//   fetchBlockAtHeight,
//   getAddressFromHashBytes,
//   getHashBytesFromAddress,
// } from "@mijoco/btc_helpers/dist/index";
import { VerifySignerKey } from "../signer";

export function getPoxContractFromCycle(cycle: number) {
  if (cycle < 56) {
    return "pox";
  } else if (cycle < 60) {
    return "pox-2";
  } else if (cycle < 84) {
    return "pox-3";
  } else {
    return "pox-4";
  }
}

export function getPoxContractFromBurnHeight(height: number) {
  if (height < 783650) {
    return "pox";
  } else if (height < 792050) {
    return "pox-2";
  } else if (height < 842450) {
    return "pox-3";
  } else {
    return "pox-4";
  }
}

export function getPoxContractFromStacksHeight(height: number) {
  if (height < 100670) {
    return "pox";
  } else if (height < 107473) {
    return "pox-2";
  } else if (height < 149154) {
    return "pox-3";
  } else {
    return "pox-4";
  }
}

export async function getBurnHeightToRewardCycle(stacksApi: string, poxContractId: string, height: number, stacksHiroKey?: string): Promise<any> {
  const functionArgs = [`0x${serializeCV(uintCV(height))}`];
  const data = {
    contractAddress: poxContractId.split(".")[0],
    contractName: poxContractId.split(".")[1],
    functionName: "burn-height-to-reward-cycle",
    functionArgs,
  };
  let cycle: number;
  try {
    const result = await callContractReadOnly(stacksApi, data, stacksHiroKey);
    return { cycle: result, height };
  } catch (e) {
    cycle = 0;
  }
  return { cycle, height };
}

export async function getRewardCycleToBurnHeight(stacksApi: string, poxContractId: string, cycle: number, stacksHiroKey?: string): Promise<any> {
  const functionArgs = [`0x${serializeCV(uintCV(cycle))}`];
  const data = {
    contractAddress: poxContractId.split(".")[0],
    contractName: poxContractId.split(".")[1],
    functionName: "reward-cycle-to-burn-height",
    functionArgs,
  };
  try {
    const result = await callContractReadOnly(stacksApi, data, stacksHiroKey);
    return { cycle: result };
  } catch (e) {
    cycle = 0;
  }
  return { cycle };
}

export async function getPoxCycleInfo(stacksApi: string, poxContractId: string, cycle: number, stacksHiroKey?: string): Promise<PoxCycleInfo> {
  const totalStacked = await getTotalUstxStacked(stacksApi, poxContractId, cycle);
  const numbEntriesRewardCyclePoxList = await getNumbEntriesRewardCyclePoxList(stacksApi, poxContractId, cycle);
  const totalPoxRejection = await getTotalPoxRejection(stacksApi, poxContractId, cycle);
  const rewardSetSize = await getRewardSetSize(stacksApi, poxContractId, cycle);
  return {
    firstBlockHeight: 0,
    lastBlockHeight: 0,
    firstBlockTime: 0,
    lastBlockTime: 0,
    rewardSetSize: cycle > 0 && rewardSetSize ? Number(rewardSetSize) : 0,
    numbEntriesRewardCyclePoxList: numbEntriesRewardCyclePoxList ? Number(numbEntriesRewardCyclePoxList) : 0,
    totalPoxRejection: totalPoxRejection ? Number(totalPoxRejection) : 0,
    totalUstxStacked: totalStacked,
  };
}

// export async function getPoxCycleInfoRelative(stacksApi: string, mempoolApi: string, poxContractId: string, cycle: number, currentBurnHeight: number, stacksHiroKey?: string): Promise<PoxCycleInfo> {
//   const result1 = await getRewardCycleToBurnHeight(stacksApi, poxContractId, cycle);
//   const totalStacked = await getTotalUstxStacked(stacksApi, poxContractId, cycle);
//   const numbEntriesRewardCyclePoxList = await getNumbEntriesRewardCyclePoxList(stacksApi, poxContractId, cycle);
//   //const totalPoxRejection = await getTotalPoxRejection(stacksApi, poxContractId, cycle)
//   const rewardSetSize = await getRewardSetSize(stacksApi, poxContractId, cycle);

//   const firstBlockHeight = Number(result1.cycle.value);
//   const lastBlockHeight = Number(result1.cycle.value) + REWARD_CYCLE_LENGTH + PREPARE_CYCLE_LENGTH - 1;
//   let firstBlockTime = 0;
//   let lastBlockTime = 0;

//   try {
//     const firstBitcoinBlock = await fetchBlockAtHeight(mempoolApi, firstBlockHeight);
//     firstBlockTime = firstBitcoinBlock.timestamp * 1000;
//   } catch (err: any) {
//     //
//   }
//   try {
//     const lastBitcoinBlock = await fetchBlockAtHeight(mempoolApi, lastBlockHeight);
//     lastBlockTime = lastBitcoinBlock.timestamp * 1000;
//   } catch (err: any) {
//     //
//   }

//   const currentBlock = await fetchBlockAtHeight(mempoolApi, currentBurnHeight);
//   if (firstBlockTime === 0) {
//     const blocksToMine = firstBlockHeight - currentBurnHeight;
//     firstBlockTime = (currentBlock.timestamp + blocksToMine * 10 * 60) * 1000;
//   }
//   if (lastBlockTime === 0) {
//     const blocksToMine = lastBlockHeight - currentBurnHeight;
//     lastBlockTime = (currentBlock.timestamp + blocksToMine * 10 * 60) * 1000;
//   }

//   return {
//     firstBlockHeight,
//     lastBlockHeight,
//     firstBlockTime,
//     lastBlockTime,
//     rewardSetSize: cycle > 0 && rewardSetSize ? Number(rewardSetSize) : 0,
//     numbEntriesRewardCyclePoxList: numbEntriesRewardCyclePoxList ? Number(numbEntriesRewardCyclePoxList) : 0,
//     totalPoxRejection: -1,
//     totalUstxStacked: totalStacked,
//   };
// }

export async function getTotalUstxStacked(stacksApi: string, poxContractId: string, cycle: number, stacksHiroKey?: string): Promise<any> {
  const functionArgs = [`0x${serializeCV(uintCV(cycle))}`];
  const data = {
    contractAddress: poxContractId.split(".")[0],
    contractName: getPoxContractFromCycle(cycle),
    functionName: "get-total-ustx-stacked",
    functionArgs,
  };
  const val = await callContractReadOnly(stacksApi, data, stacksHiroKey);
  return val.value ? val.value : 0;
}

export async function getRewardSetPoxAddress(stacksApi: string, poxContractId: string, cycle: number, index: number, stacksHiroKey?: string): Promise<any> {
  const functionArgs = [`0x${serializeCV(uintCV(cycle))}`, `0x${serializeCV(uintCV(index))}`];
  const data = {
    contractAddress: poxContractId.split(".")[0],
    contractName: getPoxContractFromCycle(cycle),
    functionName: "get-reward-set-pox-address",
    functionArgs,
  };
  const val = await callContractReadOnly(stacksApi, data, stacksHiroKey);
  return val.value ? val.value.value : 0;
}

export async function getNumbEntriesRewardCyclePoxList(stacksApi: string, poxContractId: string, cycle: number, stacksHiroKey?: string): Promise<any> {
  const poxContract = getPoxContractFromCycle(cycle);
  let functionName = "get-num-reward-set-pox-addresses";
  if (poxContract === "pox") {
    functionName = "get-reward-set-size";
  }
  const functionArgs = [`0x${serializeCV(uintCV(cycle))}`];
  const data = {
    contractAddress: poxContractId.split(".")[0],
    contractName: poxContract,
    functionName,
    functionArgs,
  };
  const val = await callContractReadOnly(stacksApi, data, stacksHiroKey);
  return val.value ? val.value : 0;
}

// includes reward slots currently under stacking limit.
export async function getRewardSetSize(stacksApi: string, poxContractId: string, cycle: number, stacksHiroKey?: string): Promise<any> {
  const functionArgs = [`0x${serializeCV(uintCV(cycle))}`];
  const data = {
    contractAddress: poxContractId.split(".")[0],
    contractName: getPoxContractFromCycle(cycle),
    functionName: "get-reward-set-size",
    functionArgs,
  };
  const val = await callContractReadOnly(stacksApi, data, stacksHiroKey);
  return val.value ? val.value : 0;
}

export async function getTotalPoxRejection(stacksApi: string, poxContractId: string, cycle: number, stacksHiroKey?: string): Promise<any> {
  const functionArgs = [`0x${serializeCV(uintCV(cycle))}`];
  const data = {
    contractAddress: poxContractId.split(".")[0],
    contractName: getPoxContractFromCycle(cycle),
    functionName: "get-total-pox-rejection",
    functionArgs,
  };
  const val = await callContractReadOnly(stacksApi, data, stacksHiroKey);
  return val.value ? Number(val.value) : 0;
}

export async function getAllowanceContractCallers(stacksApi: string, poxContractId: string, address: string, contract: string, tip?: number | undefined, stacksHiroKey?: string): Promise<any> {
  const functionArgs = [`0x${serializeCV(principalCV(address))}`, `0x${serializeCV(contractPrincipalCV(contract.split(".")[0], contract.split(".")[1]))}`];
  const data = {
    contractAddress: poxContractId.split(".")[0],
    contractName: poxContractId.split(".")[1],
    functionName: "get-allowance-contract-callers",
    functionArgs,
  } as any;
  if (tip) {
    data.tip = tip;
    data.contractName = getPoxContractFromStacksHeight(tip);
  }
  try {
    const result = await callContractReadOnly(stacksApi, data, stacksHiroKey);
    return result;
  } catch (e) {}
  return { stacked: 0 };
}

// export async function getPartialStackedByCycle(stacksApi: string, network: string, poxContractId: string, address: string, cycle: number, sender: string): Promise<any> {
//   const poxAddress = getHashBytesFromAddress(network, address);
//   if (!poxAddress) return;
//   console.debug("getPartialStackedByCycle 1: " + address);
//   console.debug("getPartialStackedByCycle: ", poxAddress);
//   try {
//     const functionArgs = [
//       `0x${serializeCV(
//         tupleCV({
//           version: bufferCV(hex.decode(poxAddress.version)),
//           hashbytes: bufferCV(hex.decode(poxAddress.hashBytes)),
//         })
//       )}`,
//       `0x${serializeCV(uintCV(cycle))}`,
//       sender.indexOf(".") === -1 ? `0x${serializeCV(principalCV(sender))}` : `0x${serializeCV(contractPrincipalCV(sender.split(".")[0], sender.split(".")[1]))}`,
//     ];
//     const data = {
//       contractAddress: poxContractId.split(".")[0],
//       contractName: getPoxContractFromCycle(cycle),
//       functionName: "get-partial-stacked-by-cycle",
//       functionArgs,
//     };
//     const result = await callContractReadOnly(stacksApi, data);
//     return result.value ? Number(result.value) : 0;
//   } catch (e) {
//     return { stacked: 0 };
//   }
// }

// export async function getStackerInfoFromContract(stacksApi: string, network: string, poxContractId: string, address: string, cycle: number): Promise<StackerInfo> {
//   return {
//     cycle,
//     stacksAddress: address,
//     stacker: await getStackerInfo(stacksApi, network, poxContractId, address),
//     delegation: await getCheckDelegation(stacksApi, poxContractId, address),
//     poxRejection: cycle > 0 ? await getPoxRejection(stacksApi, poxContractId, address, cycle) : undefined,
//   };
// }

// export async function getStackerInfo(stacksApi: string, network: string, poxContractId: string, address: string, tip?: number | undefined): Promise<Stacker | undefined> {
//   const functionArgs = [`0x${serializeCV(principalCV(address))}`];
//   const data = {
//     contractAddress: poxContractId.split(".")[0],
//     contractName: poxContractId.split(".")[1],
//     functionName: "get-stacker-info",
//     functionArgs,
//   } as any;
//   if (tip) {
//     data.tip = tip;
//     data.contractName = getPoxContractFromStacksHeight(tip);
//   }
//   try {
//     const result = await callContractReadOnly(stacksApi, data);
//     return result.value
//       ? {
//           rewardSetIndexes: result.value.value["reward-set-indexes"].value,
//           lockPeriod: result.value.value["reward-set-indexes"].value,
//           firstRewardCycle: result.value.value["first-reward-cycle"].value,
//           poxAddr: {
//             version: result.value.value["pox-addr"].value.version.value,
//             hashBytes: result.value.value["pox-addr"].value.hashbytes.value,
//           },
//           bitcoinAddr: getAddressFromHashBytes(network, result.value.value["pox-addr"].value.hashbytes.value, result.value.value["pox-addr"].value.version.value),
//         }
//       : undefined;

//     /**
// 	  ;; how long the uSTX are locked, in reward cycles.
// 	  ;; reward cycle when rewards begin
// 	  ;; indexes in each reward-set associated with this user.
// 	  ;; these indexes are only valid looking forward from
// 	  ;;  `first-reward-cycle` (i.e., they do not correspond
// 	  ;;  to entries in the reward set that may have been from
// 	  ;;  previous stack-stx calls, or prior to an extend)
// 	  ;; principal of the delegate, if stacker has delegated
// 	   */
//   } catch (e) {}
//   return;
// }
export async function getCheckDelegation(stacksApi: string, poxContractId: string, address: string, tip?: number | undefined, stacksHiroKey?: string): Promise<Delegation> {
  try {
    const functionArgs = [`0x${serializeCV(principalCV(address))}`];
    const data = {
      contractAddress: poxContractId.split(".")[0],
      contractName: poxContractId.split(".")[1],
      functionName: "get-check-delegation",
      functionArgs,
    } as any;
    if (tip) {
      data.tip = tip;
      data.contractName = getPoxContractFromStacksHeight(tip);
    }

    const val = await callContractReadOnly(stacksApi, data, stacksHiroKey);
    //console.log('getCheckDelegation: ', val.value)
    return val.value
      ? {
          amountUstx: Number(val.value.value["amount-ustx"].value),
          delegatedTo: val.value.value["delegated-to"].value,
          untilBurnHt: val.value.value["pox-addr"].value,
          poxAddr: val.value.value["until-burn-ht"].value || 0,
        }
      : {
          amountUstx: 0,
          delegatedTo: undefined,
          untilBurnHt: 0,
          poxAddr: undefined,
        };
  } catch (err: any) {
    console.error("getCheckDelegation: error: " + err.message);
    return {} as Delegation;
  }
}

export async function getPoxRejection(stacksApi: string, poxContractId: string, address: string, cycle: number, stacksHiroKey?: string): Promise<any> {
  const functionArgs = [`0x${serializeCV(principalCV(address))}`, `0x${serializeCV(uintCV(cycle))}`];
  const data = {
    contractAddress: poxContractId.split(".")[0],
    contractName: getPoxContractFromCycle(cycle),
    functionName: "get-pox-rejection",
    functionArgs,
  };
  const val = await callContractReadOnly(stacksApi, data, stacksHiroKey);
  return val.value ? { poxRejectionPerStackerPerCycle: val.value.value } : { poxRejectionPerStackerPerCycle: 0 };
}

export async function checkCallerAllowed(stacksApi: string, poxContractId: string, stxAddress: string, tip?: number | undefined, stacksHiroKey?: string): Promise<any> {
  const data = {
    contractAddress: poxContractId.split(".")[0],
    sender: stxAddress,
    contractName: poxContractId.split(".")[1],
    functionName: "check-caller-allowed",
    functionArgs: [],
  } as any;
  if (tip) {
    data.tip = tip;
    data.contractName = getPoxContractFromStacksHeight(tip);
  }
  try {
    const result = await callContractReadOnly(stacksApi, data, stacksHiroKey);
    return { allowed: result };
  } catch (e) {}
  return { allowed: false };
}

// export async function verifySignerKeySig(stacksApi: string, network: string, poxContractId: string, auth: VerifySignerKey, tip?: number | undefined): Promise<Stacker | undefined> {
//   const poxAddress = getHashBytesFromAddress(network, auth.rewardAddress);
//   if (!poxAddress) return;
//   if (!auth.signerKey) return;
//   const functionArgs = [
//     `0x${serializeCV(
//       tupleCV({
//         version: bufferCV(hex.decode(poxAddress.version)),
//         hashbytes: bufferCV(hex.decode(poxAddress.hashBytes)),
//       })
//     )}`,
//     `0x${serializeCV(uintCV(auth.rewardCycle))}`,
//     `0x${serializeCV(stringAsciiCV(auth.topic))}`,
//     `0x${serializeCV(uintCV(auth.period))}`,
//     `0x${serializeCV(noneCV())}`,
//     `0x${serializeCV(bufferCV(hex.decode(auth.signerKey)))}`,
//     `0x${serializeCV(uintCV(auth.amount))}`,
//     `0x${serializeCV(uintCV(auth.maxAmount))}`,
//     `0x${serializeCV(uintCV(auth.authId))}`,
//   ];
//   const data = {
//     contractAddress: poxContractId.split(".")[0],
//     contractName: poxContractId.split(".")[1],
//     functionName: "verify-signer-key-sig",
//     functionArgs,
//   } as any;
//   if (tip) {
//     data.tip = tip;
//     data.contractName = getPoxContractFromStacksHeight(tip);
//   }

//   let funding: string;
//   try {
//     const result = await callContractReadOnly(stacksApi, data);
//     console.log("verifySignerKeySig: " + result);
//     return result;
//   } catch (e) {
//     funding = "0";
//   }
//   return;
// }

export async function readDelegationEvents(stacksApi: string, network: string, poxContractId: string, poolPrincipal: string, offset: number, limit: number, stacksHiroKey?: string) {
  const poxInfo = await getPoxInfo(stacksApi);
  const url = stacksApi + "/extended/beta/stacking/" + poolPrincipal + "/delegations?offset=" + offset + "&limit=" + limit;
  console.log("readDelegationEvents: " + url);
  try {
    const response = await fetch(url, {
      headers: { ...(stacksHiroKey ? { "x-api-key": stacksHiroKey } : {}) },
    });
    const val = await response.json();
    if (val) {
      for (const event of val.results) {
        const cycle = await getBurnHeightToRewardCycle(stacksApi, poxContractId, event.block_height);
        if (cycle >= startSlot(network)) event.cycle = cycle;
      }
    }
    return val;
  } catch (err: any) {
    console.error("readDelegationEvents: " + err.message);
  }
}

export function startSlot(network: string) {
  if (network === "mainnet") {
    return 60; // first after 2.1 bug when everyone had to re-stack
  } else {
    return 500;
  }
}
