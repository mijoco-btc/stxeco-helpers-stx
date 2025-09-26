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
exports.getPoxContractFromCycle = getPoxContractFromCycle;
exports.getPoxContractFromBurnHeight = getPoxContractFromBurnHeight;
exports.getPoxContractFromStacksHeight = getPoxContractFromStacksHeight;
exports.getBurnHeightToRewardCycle = getBurnHeightToRewardCycle;
exports.getRewardCycleToBurnHeight = getRewardCycleToBurnHeight;
exports.getPoxCycleInfo = getPoxCycleInfo;
exports.getTotalUstxStacked = getTotalUstxStacked;
exports.getRewardSetPoxAddress = getRewardSetPoxAddress;
exports.getNumbEntriesRewardCyclePoxList = getNumbEntriesRewardCyclePoxList;
exports.getRewardSetSize = getRewardSetSize;
exports.getTotalPoxRejection = getTotalPoxRejection;
exports.getAllowanceContractCallers = getAllowanceContractCallers;
exports.getCheckDelegation = getCheckDelegation;
exports.getPoxRejection = getPoxRejection;
exports.checkCallerAllowed = checkCallerAllowed;
exports.readDelegationEvents = readDelegationEvents;
exports.startSlot = startSlot;
const transactions_1 = require("@stacks/transactions");
const stacks_node_1 = require("../stacks-node");
function getPoxContractFromCycle(cycle) {
    if (cycle < 56) {
        return "pox";
    }
    else if (cycle < 60) {
        return "pox-2";
    }
    else if (cycle < 84) {
        return "pox-3";
    }
    else {
        return "pox-4";
    }
}
function getPoxContractFromBurnHeight(height) {
    if (height < 783650) {
        return "pox";
    }
    else if (height < 792050) {
        return "pox-2";
    }
    else if (height < 842450) {
        return "pox-3";
    }
    else {
        return "pox-4";
    }
}
function getPoxContractFromStacksHeight(height) {
    if (height < 100670) {
        return "pox";
    }
    else if (height < 107473) {
        return "pox-2";
    }
    else if (height < 149154) {
        return "pox-3";
    }
    else {
        return "pox-4";
    }
}
function getBurnHeightToRewardCycle(stacksApi, poxContractId, height) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionArgs = [`0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(height))}`];
        const data = {
            contractAddress: poxContractId.split(".")[0],
            contractName: poxContractId.split(".")[1],
            functionName: "burn-height-to-reward-cycle",
            functionArgs,
        };
        let cycle;
        try {
            const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
            return { cycle: result, height };
        }
        catch (e) {
            cycle = 0;
        }
        return { cycle, height };
    });
}
function getRewardCycleToBurnHeight(stacksApi, poxContractId, cycle) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionArgs = [`0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(cycle))}`];
        const data = {
            contractAddress: poxContractId.split(".")[0],
            contractName: poxContractId.split(".")[1],
            functionName: "reward-cycle-to-burn-height",
            functionArgs,
        };
        try {
            const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
            return { cycle: result };
        }
        catch (e) {
            cycle = 0;
        }
        return { cycle };
    });
}
function getPoxCycleInfo(stacksApi, poxContractId, cycle) {
    return __awaiter(this, void 0, void 0, function* () {
        const totalStacked = yield getTotalUstxStacked(stacksApi, poxContractId, cycle);
        const numbEntriesRewardCyclePoxList = yield getNumbEntriesRewardCyclePoxList(stacksApi, poxContractId, cycle);
        const totalPoxRejection = yield getTotalPoxRejection(stacksApi, poxContractId, cycle);
        const rewardSetSize = yield getRewardSetSize(stacksApi, poxContractId, cycle);
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
    });
}
// export async function getPoxCycleInfoRelative(stacksApi: string, mempoolApi: string, poxContractId: string, cycle: number, currentBurnHeight: number): Promise<PoxCycleInfo> {
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
function getTotalUstxStacked(stacksApi, poxContractId, cycle) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionArgs = [`0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(cycle))}`];
        const data = {
            contractAddress: poxContractId.split(".")[0],
            contractName: getPoxContractFromCycle(cycle),
            functionName: "get-total-ustx-stacked",
            functionArgs,
        };
        const val = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
        return val.value ? val.value : 0;
    });
}
function getRewardSetPoxAddress(stacksApi, poxContractId, cycle, index) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionArgs = [`0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(cycle))}`, `0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(index))}`];
        const data = {
            contractAddress: poxContractId.split(".")[0],
            contractName: getPoxContractFromCycle(cycle),
            functionName: "get-reward-set-pox-address",
            functionArgs,
        };
        const val = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
        return val.value ? val.value.value : 0;
    });
}
function getNumbEntriesRewardCyclePoxList(stacksApi, poxContractId, cycle) {
    return __awaiter(this, void 0, void 0, function* () {
        const poxContract = getPoxContractFromCycle(cycle);
        let functionName = "get-num-reward-set-pox-addresses";
        if (poxContract === "pox") {
            functionName = "get-reward-set-size";
        }
        const functionArgs = [`0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(cycle))}`];
        const data = {
            contractAddress: poxContractId.split(".")[0],
            contractName: poxContract,
            functionName,
            functionArgs,
        };
        const val = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
        return val.value ? val.value : 0;
    });
}
// includes reward slots currently under stacking limit.
function getRewardSetSize(stacksApi, poxContractId, cycle) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionArgs = [`0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(cycle))}`];
        const data = {
            contractAddress: poxContractId.split(".")[0],
            contractName: getPoxContractFromCycle(cycle),
            functionName: "get-reward-set-size",
            functionArgs,
        };
        const val = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
        return val.value ? val.value : 0;
    });
}
function getTotalPoxRejection(stacksApi, poxContractId, cycle) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionArgs = [`0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(cycle))}`];
        const data = {
            contractAddress: poxContractId.split(".")[0],
            contractName: getPoxContractFromCycle(cycle),
            functionName: "get-total-pox-rejection",
            functionArgs,
        };
        const val = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
        return val.value ? Number(val.value) : 0;
    });
}
function getAllowanceContractCallers(stacksApi, poxContractId, address, contract, tip) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionArgs = [`0x${(0, transactions_1.serializeCV)((0, transactions_1.principalCV)(address))}`, `0x${(0, transactions_1.serializeCV)((0, transactions_1.contractPrincipalCV)(contract.split(".")[0], contract.split(".")[1]))}`];
        const data = {
            contractAddress: poxContractId.split(".")[0],
            contractName: poxContractId.split(".")[1],
            functionName: "get-allowance-contract-callers",
            functionArgs,
        };
        if (tip) {
            data.tip = tip;
            data.contractName = getPoxContractFromStacksHeight(tip);
        }
        try {
            const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
            return result;
        }
        catch (e) { }
        return { stacked: 0 };
    });
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
function getCheckDelegation(stacksApi, poxContractId, address, tip) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const functionArgs = [`0x${(0, transactions_1.serializeCV)((0, transactions_1.principalCV)(address))}`];
            const data = {
                contractAddress: poxContractId.split(".")[0],
                contractName: poxContractId.split(".")[1],
                functionName: "get-check-delegation",
                functionArgs,
            };
            if (tip) {
                data.tip = tip;
                data.contractName = getPoxContractFromStacksHeight(tip);
            }
            const val = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
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
        }
        catch (err) {
            console.error("getCheckDelegation: error: " + err.message);
            return {};
        }
    });
}
function getPoxRejection(stacksApi, poxContractId, address, cycle) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionArgs = [`0x${(0, transactions_1.serializeCV)((0, transactions_1.principalCV)(address))}`, `0x${(0, transactions_1.serializeCV)((0, transactions_1.uintCV)(cycle))}`];
        const data = {
            contractAddress: poxContractId.split(".")[0],
            contractName: getPoxContractFromCycle(cycle),
            functionName: "get-pox-rejection",
            functionArgs,
        };
        const val = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
        return val.value ? { poxRejectionPerStackerPerCycle: val.value.value } : { poxRejectionPerStackerPerCycle: 0 };
    });
}
function checkCallerAllowed(stacksApi, poxContractId, stxAddress, tip) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = {
            contractAddress: poxContractId.split(".")[0],
            sender: stxAddress,
            contractName: poxContractId.split(".")[1],
            functionName: "check-caller-allowed",
            functionArgs: [],
        };
        if (tip) {
            data.tip = tip;
            data.contractName = getPoxContractFromStacksHeight(tip);
        }
        try {
            const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
            return { allowed: result };
        }
        catch (e) { }
        return { allowed: false };
    });
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
function readDelegationEvents(stacksApi, network, poxContractId, poolPrincipal, offset, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        const poxInfo = yield (0, stacks_node_1.getPoxInfo)(stacksApi);
        const url = stacksApi + "/extended/beta/stacking/" + poolPrincipal + "/delegations?offset=" + offset + "&limit=" + limit;
        console.log("readDelegationEvents: " + url);
        try {
            const response = yield fetch(url);
            const val = yield response.json();
            if (val) {
                for (const event of val.results) {
                    const cycle = yield getBurnHeightToRewardCycle(stacksApi, poxContractId, event.block_height);
                    if (cycle >= startSlot(network))
                        event.cycle = cycle;
                }
            }
            return val;
        }
        catch (err) {
            console.error("readDelegationEvents: " + err.message);
        }
    });
}
function startSlot(network) {
    if (network === "mainnet") {
        return 60; // first after 2.1 bug when everyone had to re-stack
    }
    else {
        return 500;
    }
}
