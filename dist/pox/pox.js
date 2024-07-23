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
exports.getPoxCycleInfoRelative = getPoxCycleInfoRelative;
exports.getTotalUstxStacked = getTotalUstxStacked;
exports.getRewardSetPoxAddress = getRewardSetPoxAddress;
exports.getNumbEntriesRewardCyclePoxList = getNumbEntriesRewardCyclePoxList;
exports.getRewardSetSize = getRewardSetSize;
exports.getTotalPoxRejection = getTotalPoxRejection;
exports.getAllowanceContractCallers = getAllowanceContractCallers;
exports.getPartialStackedByCycle = getPartialStackedByCycle;
exports.getStackerInfoFromContract = getStackerInfoFromContract;
exports.getStackerInfo = getStackerInfo;
exports.getCheckDelegation = getCheckDelegation;
exports.getPoxRejection = getPoxRejection;
exports.checkCallerAllowed = checkCallerAllowed;
exports.verifySignerKeySig = verifySignerKeySig;
exports.readDelegationEvents = readDelegationEvents;
exports.startSlot = startSlot;
const base_1 = require("@scure/base");
const transactions_1 = require("@stacks/transactions");
const stacks_node_1 = require("../stacks-node");
const pox_types_1 = require("../pox_types");
const index_1 = require("@mijoco/btc_helpers/dist/index");
function getPoxContractFromCycle(cycle) {
    if (cycle < 56) {
        return 'pox';
    }
    else if (cycle < 60) {
        return 'pox-2';
    }
    else if (cycle < 84) {
        return 'pox-3';
    }
    else {
        return 'pox-4';
    }
}
function getPoxContractFromBurnHeight(height) {
    if (height < 783650) {
        return 'pox';
    }
    else if (height < 792050) {
        return 'pox-2';
    }
    else if (height < 842450) {
        return 'pox-3';
    }
    else {
        return 'pox-4';
    }
}
function getPoxContractFromStacksHeight(height) {
    if (height < 100670) {
        return 'pox';
    }
    else if (height < 107473) {
        return 'pox-2';
    }
    else if (height < 149154) {
        return 'pox-3';
    }
    else {
        return 'pox-4';
    }
}
function getBurnHeightToRewardCycle(stacksApi, poxContractId, height) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionArgs = [`0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.uintCV)(height)))}`];
        const data = {
            contractAddress: poxContractId.split('.')[0],
            contractName: poxContractId.split('.')[1],
            functionName: 'burn-height-to-reward-cycle',
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
        const functionArgs = [`0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.uintCV)(cycle)))}`];
        const data = {
            contractAddress: poxContractId.split('.')[0],
            contractName: poxContractId.split('.')[1],
            functionName: 'reward-cycle-to-burn-height',
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
            rewardSetSize: (cycle > 0 && rewardSetSize) ? Number(rewardSetSize) : 0,
            numbEntriesRewardCyclePoxList: (numbEntriesRewardCyclePoxList) ? Number(numbEntriesRewardCyclePoxList) : 0,
            totalPoxRejection: (totalPoxRejection) ? Number(totalPoxRejection) : 0,
            totalUstxStacked: totalStacked
        };
    });
}
function getPoxCycleInfoRelative(stacksApi, mempoolApi, poxContractId, cycle, currentBurnHeight) {
    return __awaiter(this, void 0, void 0, function* () {
        const result1 = yield getRewardCycleToBurnHeight(stacksApi, poxContractId, cycle);
        const totalStacked = yield getTotalUstxStacked(stacksApi, poxContractId, cycle);
        const numbEntriesRewardCyclePoxList = yield getNumbEntriesRewardCyclePoxList(stacksApi, poxContractId, cycle);
        //const totalPoxRejection = await getTotalPoxRejection(stacksApi, poxContractId, cycle)
        const rewardSetSize = yield getRewardSetSize(stacksApi, poxContractId, cycle);
        const firstBlockHeight = Number(result1.cycle.value);
        const lastBlockHeight = Number(result1.cycle.value) + pox_types_1.REWARD_CYCLE_LENGTH + pox_types_1.PREPARE_CYCLE_LENGTH - 1;
        let firstBlockTime = 0;
        let lastBlockTime = 0;
        try {
            const firstBitcoinBlock = yield (0, index_1.fetchBlockAtHeight)(mempoolApi, firstBlockHeight);
            firstBlockTime = firstBitcoinBlock.timestamp * 1000;
        }
        catch (err) { // 
        }
        try {
            const lastBitcoinBlock = yield (0, index_1.fetchBlockAtHeight)(mempoolApi, lastBlockHeight);
            lastBlockTime = lastBitcoinBlock.timestamp * 1000;
        }
        catch (err) {
            //
        }
        const currentBlock = yield (0, index_1.fetchBlockAtHeight)(mempoolApi, currentBurnHeight);
        if (firstBlockTime === 0) {
            const blocksToMine = firstBlockHeight - currentBurnHeight;
            firstBlockTime = (currentBlock.timestamp + (blocksToMine * 10 * 60)) * 1000;
        }
        if (lastBlockTime === 0) {
            const blocksToMine = lastBlockHeight - currentBurnHeight;
            lastBlockTime = (currentBlock.timestamp + (blocksToMine * 10 * 60)) * 1000;
        }
        return {
            firstBlockHeight,
            lastBlockHeight,
            firstBlockTime,
            lastBlockTime,
            rewardSetSize: (cycle > 0 && rewardSetSize) ? Number(rewardSetSize) : 0,
            numbEntriesRewardCyclePoxList: (numbEntriesRewardCyclePoxList) ? Number(numbEntriesRewardCyclePoxList) : 0,
            totalPoxRejection: -1,
            totalUstxStacked: totalStacked
        };
    });
}
function getTotalUstxStacked(stacksApi, poxContractId, cycle) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionArgs = [`0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.uintCV)(cycle)))}`];
        const data = {
            contractAddress: poxContractId.split('.')[0],
            contractName: getPoxContractFromCycle(cycle),
            functionName: 'get-total-ustx-stacked',
            functionArgs,
        };
        const val = (yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data));
        return (val.value) ? val.value : 0;
    });
}
function getRewardSetPoxAddress(stacksApi, poxContractId, cycle, index) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionArgs = [`0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.uintCV)(cycle)))}`, `0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.uintCV)(index)))}`];
        const data = {
            contractAddress: poxContractId.split('.')[0],
            contractName: getPoxContractFromCycle(cycle),
            functionName: 'get-reward-set-pox-address',
            functionArgs,
        };
        const val = (yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data));
        return (val.value) ? val.value.value : 0;
    });
}
function getNumbEntriesRewardCyclePoxList(stacksApi, poxContractId, cycle) {
    return __awaiter(this, void 0, void 0, function* () {
        const poxContract = getPoxContractFromCycle(cycle);
        let functionName = 'get-num-reward-set-pox-addresses';
        if (poxContract === 'pox') {
            functionName = 'get-reward-set-size';
        }
        const functionArgs = [`0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.uintCV)(cycle)))}`];
        const data = {
            contractAddress: poxContractId.split('.')[0],
            contractName: poxContract,
            functionName,
            functionArgs,
        };
        const val = (yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data));
        return (val.value) ? val.value : 0;
    });
}
// includes reward slots currently under stacking limit.
function getRewardSetSize(stacksApi, poxContractId, cycle) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionArgs = [`0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.uintCV)(cycle)))}`];
        const data = {
            contractAddress: poxContractId.split('.')[0],
            contractName: getPoxContractFromCycle(cycle),
            functionName: 'get-reward-set-size',
            functionArgs,
        };
        const val = (yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data));
        return (val.value) ? val.value : 0;
    });
}
function getTotalPoxRejection(stacksApi, poxContractId, cycle) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionArgs = [`0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.uintCV)(cycle)))}`];
        const data = {
            contractAddress: poxContractId.split('.')[0],
            contractName: getPoxContractFromCycle(cycle),
            functionName: 'get-total-pox-rejection',
            functionArgs,
        };
        const val = (yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data));
        return (val.value) ? Number(val.value) : 0;
    });
}
function getAllowanceContractCallers(stacksApi, poxContractId, address, contract, tip) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionArgs = [`0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.principalCV)(address)))}`, `0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.contractPrincipalCV)(contract.split('.')[0], contract.split('.')[1])))}`];
        const data = {
            contractAddress: poxContractId.split('.')[0],
            contractName: poxContractId.split('.')[1],
            functionName: 'get-allowance-contract-callers',
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
function getPartialStackedByCycle(stacksApi, network, poxContractId, address, cycle, sender) {
    return __awaiter(this, void 0, void 0, function* () {
        const poxAddress = (0, index_1.getHashBytesFromAddress)(network, address);
        if (!poxAddress)
            return;
        console.debug('getPartialStackedByCycle 1: ' + address);
        console.debug('getPartialStackedByCycle: ', poxAddress);
        try {
            const functionArgs = [
                `0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.tupleCV)({ version: (0, transactions_1.bufferCV)(base_1.hex.decode(poxAddress.version)), hashbytes: (0, transactions_1.bufferCV)(base_1.hex.decode(poxAddress.hashBytes)) })))}`,
                `0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.uintCV)(cycle)))}`,
                (sender.indexOf('.') === -1) ? `0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.principalCV)(sender)))}` : `0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.contractPrincipalCV)(sender.split('.')[0], sender.split('.')[1])))}`
            ];
            const data = {
                contractAddress: poxContractId.split('.')[0],
                contractName: getPoxContractFromCycle(cycle),
                functionName: 'get-partial-stacked-by-cycle',
                functionArgs,
            };
            const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
            return (result.value) ? Number(result.value) : 0;
        }
        catch (e) {
            return { stacked: 0 };
        }
    });
}
function getStackerInfoFromContract(stacksApi, network, poxContractId, address, cycle) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            cycle,
            stacksAddress: address,
            stacker: yield getStackerInfo(stacksApi, network, poxContractId, address),
            delegation: yield getCheckDelegation(stacksApi, poxContractId, address),
            poxRejection: (cycle > 0) ? yield getPoxRejection(stacksApi, poxContractId, address, cycle) : undefined,
        };
    });
}
function getStackerInfo(stacksApi, network, poxContractId, address, tip) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionArgs = [`0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.principalCV)(address)))}`];
        const data = {
            contractAddress: poxContractId.split('.')[0],
            contractName: poxContractId.split('.')[1],
            functionName: 'get-stacker-info',
            functionArgs,
        };
        if (tip) {
            data.tip = tip;
            data.contractName = getPoxContractFromStacksHeight(tip);
        }
        try {
            const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
            return (result.value) ? {
                rewardSetIndexes: result.value.value['reward-set-indexes'].value,
                lockPeriod: result.value.value['reward-set-indexes'].value,
                firstRewardCycle: result.value.value['first-reward-cycle'].value,
                poxAddr: {
                    version: result.value.value['pox-addr'].value.version.value,
                    hashBytes: result.value.value['pox-addr'].value.hashbytes.value
                },
                bitcoinAddr: (0, index_1.getAddressFromHashBytes)(network, result.value.value['pox-addr'].value.hashbytes.value, result.value.value['pox-addr'].value.version.value),
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
        }
        catch (e) { }
        return;
    });
}
function getCheckDelegation(stacksApi, poxContractId, address, tip) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const functionArgs = [`0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.principalCV)(address)))}`];
            const data = {
                contractAddress: poxContractId.split('.')[0],
                contractName: poxContractId.split('.')[1],
                functionName: 'get-check-delegation',
                functionArgs,
            };
            if (tip) {
                data.tip = tip;
                data.contractName = getPoxContractFromStacksHeight(tip);
            }
            const val = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
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
            };
        }
        catch (err) {
            console.error('getCheckDelegation: error: ' + err.message);
            return {};
        }
    });
}
function getPoxRejection(stacksApi, poxContractId, address, cycle) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionArgs = [`0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.principalCV)(address)))}`, `0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.uintCV)(cycle)))}`];
        const data = {
            contractAddress: poxContractId.split('.')[0],
            contractName: getPoxContractFromCycle(cycle),
            functionName: 'get-pox-rejection',
            functionArgs,
        };
        const val = (yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data));
        return (val.value) ? { poxRejectionPerStackerPerCycle: val.value.value } : { poxRejectionPerStackerPerCycle: 0 };
    });
}
function checkCallerAllowed(stacksApi, poxContractId, stxAddress, tip) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = {
            contractAddress: poxContractId.split('.')[0],
            sender: stxAddress,
            contractName: poxContractId.split('.')[1],
            functionName: 'check-caller-allowed',
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
function verifySignerKeySig(stacksApi, network, poxContractId, auth, tip) {
    return __awaiter(this, void 0, void 0, function* () {
        const poxAddress = (0, index_1.getHashBytesFromAddress)(network, auth.rewardAddress);
        if (!poxAddress)
            return;
        if (!auth.signerKey)
            return;
        const functionArgs = [
            `0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.tupleCV)({ version: (0, transactions_1.bufferCV)(base_1.hex.decode(poxAddress.version)), hashbytes: (0, transactions_1.bufferCV)(base_1.hex.decode(poxAddress.hashBytes)) })))}`,
            `0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.uintCV)(auth.rewardCycle)))}`,
            `0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.stringAsciiCV)(auth.topic)))}`,
            `0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.uintCV)(auth.period)))}`,
            `0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.noneCV)()))}`,
            `0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.bufferCV)(base_1.hex.decode(auth.signerKey))))}`,
            `0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.uintCV)(auth.amount)))}`,
            `0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.uintCV)(auth.maxAmount)))}`,
            `0x${base_1.hex.encode((0, transactions_1.serializeCV)((0, transactions_1.uintCV)(auth.authId)))}`,
        ];
        const data = {
            contractAddress: poxContractId.split('.')[0],
            contractName: poxContractId.split('.')[1],
            functionName: 'verify-signer-key-sig',
            functionArgs,
        };
        if (tip) {
            data.tip = tip;
            data.contractName = getPoxContractFromStacksHeight(tip);
        }
        let funding;
        try {
            const result = yield (0, stacks_node_1.callContractReadOnly)(stacksApi, data);
            console.log('verifySignerKeySig: ' + result);
            return result;
        }
        catch (e) {
            funding = '0';
        }
        return;
    });
}
function readDelegationEvents(stacksApi, network, poxContractId, poolPrincipal, offset, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        const poxInfo = yield (0, stacks_node_1.getPoxInfo)(stacksApi);
        const url = stacksApi + '/extended/beta/stacking/' + poolPrincipal + '/delegations?offset=' + offset + '&limit=' + limit;
        console.log('readDelegationEvents: ' + url);
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
            console.error('readDelegationEvents: ' + err.message);
        }
    });
}
function startSlot(network) {
    if (network === 'mainnet') {
        return 60; // first after 2.1 bug when everyone had to re-stack
    }
    else {
        return 500;
    }
}
