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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrincipalType = exports.PEGOUT_OPCODE = exports.PEGIN_OPCODE = exports.MAGIC_BYTES_MAINNET_NAK = exports.MAGIC_BYTES_MAINNET = exports.MAGIC_BYTES_TESTNET_NAK = exports.MAGIC_BYTES_TESTNET = void 0;
exports.bitcoinToSats = bitcoinToSats;
exports.convertToRevealerTransaction = convertToRevealerTransaction;
exports.parseRawPayload = parseRawPayload;
exports.parseDepositPayload = parseDepositPayload;
exports.amountToUint8 = amountToUint8;
exports.amountToBigUint64 = amountToBigUint64;
exports.bigUint64ToAmount = bigUint64ToAmount;
exports.parseWithdrawPayload = parseWithdrawPayload;
exports.buildDepositPayload = buildDepositPayload;
exports.buildDepositPayloadOpDrop = buildDepositPayloadOpDrop;
exports.buildWithdrawPayload = buildWithdrawPayload;
exports.buildWithdrawPayloadOpDrop = buildWithdrawPayloadOpDrop;
exports.readDepositValue = readDepositValue;
exports.parsePayloadFromOutput = parsePayloadFromOutput;
exports.getDataToSign = getDataToSign;
exports.getStacksSimpleHashOfDataToSign = getStacksSimpleHashOfDataToSign;
exports.getStacksAddressFromSignature = getStacksAddressFromSignature;
exports.getStacksAddressFromSignatureRsv = getStacksAddressFromSignatureRsv;
exports.getStacksAddressFromPubkey = getStacksAddressFromPubkey;
exports.getMagicAndOpCode = getMagicAndOpCode;
exports.fromStorable = fromStorable;
exports.toStorable = toStorable;
exports.getAddressFromOutScript = getAddressFromOutScript;
const btc = __importStar(require("@scure/btc-signer"));
const base_1 = require("@scure/base");
const c32check_1 = require("c32check");
const common_1 = require("@stacks/common");
const encryption_1 = require("@stacks/encryption");
const sha256_1 = require("@noble/hashes/sha256");
const ripemd160_1 = require("@noble/hashes/ripemd160");
const transactions_1 = require("@stacks/transactions");
const revealer_types_js_1 = require("../revealer_types.js");
const account_js_1 = require("../account/account.js");
const P = __importStar(require("micro-packed"));
/**
 * Mainnet magic
 * 5832 => X2
 * Testnet magic
 * hex     utf8
 * 4e33 => NE
 * 5432 => T2
 * 4845 => HE ??
 * 5255 => RU ??
 */
exports.MAGIC_BYTES_TESTNET = '5432'; // 
exports.MAGIC_BYTES_TESTNET_NAK = '4e33';
exports.MAGIC_BYTES_MAINNET = '5832';
exports.MAGIC_BYTES_MAINNET_NAK = '5832';
exports.PEGIN_OPCODE = '3C';
exports.PEGOUT_OPCODE = '3E';
const btcPrecision = 100000000;
function bitcoinToSats(amountBtc) {
    return Math.round(amountBtc * btcPrecision);
}
function convertToRevealerTransaction(payload, tx) {
    if (!payload.stacksAddress)
        throw new Error('payload.stacksAddress is required');
    const revealerTx = {
        txId: tx.txid,
        originator: payload.stacksAddress,
        amountSats: payload.amountSats,
        paymentAddress: tx.vin[0].prevout.scriptpubkey_address,
        paymentPublicKey: tx.vin[0].prevout.scriptpubkey_type,
        mode: revealer_types_js_1.RevealerTxModes.OP_RETURN,
        type: (payload.opcode === '3C') ? revealer_types_js_1.RevealerTxTypes.SBTC_DEPOSIT : revealer_types_js_1.RevealerTxTypes.SBTC_WITHDRAWAL,
        created: (new Date()).getTime(),
        updated: (new Date()).getTime(),
        recipient: (payload.opcode === '3C') ? payload.stacksAddress : tx.vout[1].scriptpubkey_address,
        signed: true,
        confirmations: tx.status.block_height,
        blockHeight: tx.status.block_height,
        status: revealer_types_js_1.CommitmentStatus.PENDING,
        sbtcPublicKey: ''
    };
    return revealerTx;
}
function parseRawPayload(network, d0, vout1Address, sigMode) {
    let d1 = (base_1.hex.decode(d0)).subarray(4);
    let magicOp = getMagicAndOpCode(d1);
    if (magicOp.opcode !== '3C' && magicOp.opcode !== '3E') {
        d1 = (base_1.hex.decode(d0)).subarray(5);
        magicOp = getMagicAndOpCode(d1);
    }
    if (magicOp.opcode === '3C') {
        const payload = parseDepositPayload(d1);
        return payload;
    }
    else if (magicOp.opcode === '3E') {
        try {
            if (vout1Address)
                return parseWithdrawPayload(network, base_1.hex.encode(d1), vout1Address, sigMode);
            else
                throw new Error('Withdrawal requires the address from output 1: ' + magicOp.opcode);
        }
        catch (err) {
            return {
                opcode: '3E',
                prinType: 0,
                stacksAddress: undefined,
                lengthOfCname: 0,
                cname: undefined,
                lengthOfMemo: 0,
                memo: undefined,
                revealFee: 0,
                amountSats: 0
            };
        }
    }
    else {
        throw new Error('Wrong opcode: ' + magicOp.opcode);
    }
}
function parseDepositPayload(d1) {
    const magicOp = getMagicAndOpCode(d1);
    if (magicOp.magic) {
        return parseDepositPayloadNoMagic(d1.subarray(2));
    }
    return parseDepositPayloadNoMagic(d1);
}
function parseDepositPayloadNoPrincipal(d1) {
    const opcode = base_1.hex.encode(d1.subarray(0, 1)).toUpperCase();
    const addr0 = parseInt(base_1.hex.encode(d1.subarray(1, 2)), 16);
    const addr1 = base_1.hex.encode(d1.subarray(2, 22));
    const stacksAddress = (0, c32check_1.c32address)(addr0, addr1);
    return {
        opcode,
        prinType: 0,
        stacksAddress,
        lengthOfCname: 0,
        cname: undefined,
        lengthOfMemo: 0,
        memo: undefined,
        revealFee: 0,
        amountSats: 0
    };
}
function parseDepositPayloadNoMagic(d1) {
    //console.log('payload rev: ', hex.encode(d1))
    const opcode = base_1.hex.encode(d1.subarray(0, 1)).toUpperCase();
    if (opcode.toUpperCase() !== exports.PEGIN_OPCODE)
        throw new Error('Wrong OPCODE : expected: ' + exports.PEGIN_OPCODE + '  received: ' + opcode);
    const prinType = parseInt(base_1.hex.encode(d1.subarray(1, 2)), 16);
    if (prinType === 22 || prinType === 26)
        return parseDepositPayloadNoPrincipal(d1);
    const addr0 = parseInt(base_1.hex.encode(d1.subarray(2, 3)), 16);
    const addr1 = base_1.hex.encode(d1.subarray(3, 23));
    const stacksAddress = (0, c32check_1.c32address)(addr0, addr1);
    const lengthOfCname = parseInt(base_1.hex.encode(d1.subarray(23, 24)), 8);
    let cname;
    if (lengthOfCname > 0) {
        cname = new TextDecoder().decode(d1.subarray(24, 24 + lengthOfCname));
    }
    let current = 24 + lengthOfCname;
    //let memo;
    //const lengthOfMemo = parseInt(hex.encode(d1.subarray(current, current + 1)), 8);
    //if (lengthOfMemo > 0) {
    //	memo = new TextDecoder().decode(d1.subarray(current + 1, lengthOfMemo + current + 1));
    //}
    let revealFee = 0;
    if (d1.length > current + 1) { // + lengthOfMemo) {
        //current = current + 1 + lengthOfMemo;
        const rev = d1.subarray(current);
        console.log('parseDepositPayloadNoMagic: ' + base_1.hex.encode(rev));
        revealFee = bigUint64ToAmount(rev);
        console.log('parseDepositPayloadNoMagic:revealFee: ' + revealFee);
    }
    return {
        opcode,
        prinType,
        stacksAddress,
        lengthOfCname,
        cname,
        lengthOfMemo: 0,
        memo: undefined,
        revealFee,
        amountSats: 0
    };
}
function amountToUint8(amt, size) {
    const buffer = new ArrayBuffer(size);
    const view = new DataView(buffer);
    view.setUint8(0, amt); // Max unsigned 32-bit integer
    const res = new Uint8Array(view.buffer);
    return res;
}
/**
export function uint8ToAmount(buf:Uint8Array):number {
    const hmmm = hex.decode(hex.encode(buf)) // needed to make work ?
    const view = new DataView(hmmm.buffer);
    const amt = view.getUint32(0);
    return amt;
}
 */
function amountToBigUint64(amt, size) {
    //P..U64BE(BigInt(amt))
    const buffer = new ArrayBuffer(size);
    const view = new DataView(buffer);
    view.setBigUint64(0, BigInt(amt)); // Max unsigned 32-bit integer
    const res = new BigUint64Array(view.buffer);
    return base_1.hex.decode(bufferToHex(res.buffer));
    //(amt.toString(16).padStart(16, "0"))
}
function bufferToHex(buffer) {
    return [...new Uint8Array(buffer)]
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}
function bigUint64ToAmount(buf) {
    // rencode in case it was passed in a string encoded.
    if (!buf || buf.byteLength === 0)
        return 0;
    buf = base_1.hex.decode(base_1.hex.encode(buf));
    const view = new DataView(buf.buffer, 0, 8);
    const amt = view.getBigUint64(0);
    return Number(amt);
}
function parseWithdrawPayload(network, d0, bitcoinAddress, sigMode) {
    const d1 = base_1.hex.decode(d0);
    const magicOp = getMagicAndOpCode(d1);
    if (magicOp.magic) {
        return parseWithdrawalPayloadNoMagic(network, d1.subarray(2), bitcoinAddress, sigMode);
    }
    return parseWithdrawalPayloadNoMagic(network, d1, bitcoinAddress, sigMode);
}
function parseWithdrawalPayloadNoMagic(network, d1, bitcoinAddress, sigMode) {
    const opcode = base_1.hex.encode(d1.subarray(0, 1)).toUpperCase();
    if (opcode !== '3E')
        throw new Error('Wrong opcode for withdraw: should be 3E was ' + opcode);
    const amtB = d1.subarray(1, 9);
    const amountSats = bigUint64ToAmount(amtB);
    let signature = (base_1.hex.encode(d1.subarray(9, 74)));
    const msgHash = getStacksSimpleHashOfDataToSign(network, amountSats, bitcoinAddress);
    let stacksAddress;
    try {
        const pubKey = getPubkeySignature(base_1.hex.decode(msgHash), signature, sigMode);
        console.log('parseWithdrawalPayloadNoMagic:pubKey: ' + base_1.hex.encode(pubKey));
        const stxAddresses = getStacksAddressFromPubkey(pubKey);
        stacksAddress = (network === network) ? stxAddresses.tp2pkh : stxAddresses.mp2pkh;
    }
    catch (err) {
        //
    }
    return {
        opcode,
        stacksAddress,
        signature,
        amountSats,
    };
}
var PrincipalType;
(function (PrincipalType) {
    PrincipalType["STANDARD"] = "05";
    PrincipalType["CONTRACT"] = "06";
})(PrincipalType || (exports.PrincipalType = PrincipalType = {}));
function buildDepositPayload(network, stacksAddress) {
    const net = (0, account_js_1.getNet)(network);
    return buildDepositPayloadInternal(net, 0, stacksAddress, false);
}
function buildDepositPayloadOpDrop(network, stacksAddress, revealFee) {
    const net = (0, account_js_1.getNet)(network);
    return buildDepositPayloadInternal(net, revealFee, stacksAddress, true);
}
function buildDepositPayloadInternal(net, amountSats, address, opDrop) {
    const magicBuf = (typeof net === 'object' && (net.bech32 === 'tb' || net.bech32 === 'bcrt')) ? base_1.hex.decode(exports.MAGIC_BYTES_TESTNET) : base_1.hex.decode(exports.MAGIC_BYTES_MAINNET);
    const opCodeBuf = base_1.hex.decode(exports.PEGIN_OPCODE);
    const addr = (0, c32check_1.c32addressDecode)(address.split('.')[0]);
    //const addr0Buf = hex.encode(amountToUint8(addr[0], 1));
    const addr0Buf = (base_1.hex.decode(addr[0].toString(16)));
    const addr1Buf = base_1.hex.decode(addr[1]);
    const cnameLength = new Uint8Array(1);
    //const memoLength = new Uint8Array(1);
    const principalType = (address.indexOf('.') > -1) ? base_1.hex.decode('06') : base_1.hex.decode('05');
    let buf1 = (0, common_1.concatBytes)(opCodeBuf, principalType, addr0Buf, addr1Buf);
    if (address.indexOf('.') > -1) {
        const cnameBuf = new TextEncoder().encode(address.split('.')[1]);
        const cnameBufHex = base_1.hex.encode(cnameBuf);
        let cnameLen;
        try {
            cnameLen = cnameLength.fill(cnameBufHex.length);
        }
        catch (err) {
            cnameLen = base_1.hex.decode(cnameBuf.length.toString(8));
        }
        buf1 = (0, common_1.concatBytes)(buf1, cnameLen, cnameBuf);
    }
    else {
        cnameLength.fill(0);
        buf1 = (0, common_1.concatBytes)(buf1, cnameLength);
    }
    /**
    if (memo) {
        const memoBuf = new TextEncoder().encode(memo);
        const memoLength = hex.decode(memoBuf.length.toString(8));
        buf1 = concat(buf1, memoLength, memoBuf);
    } else {
        memoLength.fill(0);
        buf1 = concat(buf1, memoLength);
    }
     */
    if (opDrop) {
        const feeBuf = amountToBigUint64(amountSats, 8);
        buf1 = (0, common_1.concatBytes)(buf1, feeBuf);
    }
    if (!opDrop)
        return base_1.hex.encode((0, common_1.concatBytes)(magicBuf, buf1));
    return base_1.hex.encode(buf1);
}
/**
 * @param network (testnet|mainnet)
 * @param amount
 * @param signature
 * @returns
 */
function buildWithdrawPayload(network, amount, signature) {
    const net = (0, account_js_1.getNet)(network);
    return buildWithdrawPayloadInternal(net, amount, signature, false);
}
/**
 * Withdrawal using commit reveal (op_drop) pattern
 * @param network (testnet|mainnet)
 * @param amount
 * @param signature
 * @returns
 */
function buildWithdrawPayloadOpDrop(network, amount, signature) {
    const net = (0, account_js_1.getNet)(network);
    return buildWithdrawPayloadInternal(net, amount, signature, true);
}
function buildWithdrawPayloadInternal(net, amount, signature, opDrop) {
    const magicBuf = (typeof net === 'object' && (net.bech32 === 'tb' || net.bech32 === 'bcrt')) ? base_1.hex.decode(exports.MAGIC_BYTES_TESTNET) : base_1.hex.decode(exports.MAGIC_BYTES_MAINNET);
    const opCodeBuf = base_1.hex.decode(exports.PEGOUT_OPCODE);
    ///const amountBuf = amountToBigUint64(amount, 8);
    const amountBytes = P.U64BE.encode(BigInt(amount));
    //const amountRev = bigUint64ToAmount(amountBuf);
    const data = (0, common_1.concatBytes)(opCodeBuf, amountBytes, base_1.hex.decode(signature));
    if (!opDrop)
        return base_1.hex.encode((0, common_1.concatBytes)(magicBuf, data));
    return base_1.hex.encode(data);
}
function readDepositValue(outputs) {
    let amountSats = 0;
    if (outputs[0].scriptPubKey.type.toLowerCase() === 'nulldata') {
        amountSats = bitcoinToSats(outputs[1].value);
    }
    else {
        amountSats = bitcoinToSats(outputs[0].value);
    }
    return amountSats;
}
function parsePayloadFromOutput(network, tx) {
    //const out0 = tx.getOutput(0)
    //let d1 = out0.script?.subarray(5) as Uint8Array // strip the op type and data length
    const vout1Address = getAddressFromOutScript(network, tx.getOutput(1).script || new Uint8Array());
    let payload = parseRawPayload(network, base_1.hex.encode(tx.getOutput(0).script || new Uint8Array()), vout1Address, 'vrs');
    return payload;
}
/**
 *
 * @param network
 * @param amount
 * @param bitcoinAddress
 * @returns
 */
function getDataToSign(network, amount, bitcoinAddress) {
    const net = (0, account_js_1.getNet)(network);
    const tx = new btc.Transaction({ allowUnknowOutput: true, allowUnknownInputs: true, allowUnknownOutputs: true });
    tx.addOutputAddress(bitcoinAddress, BigInt(amount), net);
    const amountBytes = P.U64BE.encode(BigInt(amount));
    const data = (0, common_1.concatBytes)(amountBytes, tx.getOutput(0).script);
    return `Withdraw request for ${amount} satoshis to the bitcoin address ${bitcoinAddress} (${base_1.hex.encode(data)})`;
}
function getStacksSimpleHashOfDataToSign(network, amount, bitcoinAddress) {
    const dataToSign = getDataToSign(network, amount, bitcoinAddress);
    const msgHash = (0, encryption_1.hashMessage)(dataToSign);
    //console.log('getStacksSimpleHashOfDataToSign:dataToSign: ' + hex.encode(dataToSign))
    //console.log('getStacksSimpleHashOfDataToSign:msgHash: ' + hex.encode(msgHash))
    return base_1.hex.encode(msgHash);
}
function reverseSigBits(signature) {
    if (signature.startsWith('00')) {
        const sig = signature.substring(2);
        return sig + '00';
        //} else {
        //	const sig = signature.substring(0, signature.length - 2)
        //	const sigPre = signature.substring(signature.length - 2)
        //	return sigPre + sig
    }
    return signature;
}
function getPubkeySignature(messageHash, signature, sigMode) {
    /**
    const sigM = recoverSignature({ signature: signature, mode: sigMode }); // vrs to rsv
    let sig = new secp.Signature(sigM.signature.r, sigM.signature.s);
    const recBit = parseInt(hex.encode(hex.decode(signature).subarray(0,1)))
    //console.log('getPubkeySignature:signature' + signature)
    //console.log('getPubkeySignature:recBit' + recBit)
    //console.log('getPubkeySignature:sigMode' + sigMode)
    sig = sig.addRecoveryBit(recBit);
    const pubkeyM = sig.recoverPublicKey(messageHash);
    const pubkey = hex.decode(pubkeyM.toHex());
    //console.log(pubkeyM.toHex())
     */
    let pubkey = (0, transactions_1.publicKeyFromSignatureVrs)(base_1.hex.encode(messageHash), { data: signature, type: transactions_1.StacksMessageType.MessageSignature });
    if (sigMode === 'rsv') {
        pubkey = (0, transactions_1.publicKeyFromSignatureRsv)(base_1.hex.encode(messageHash), { data: signature, type: transactions_1.StacksMessageType.MessageSignature });
    }
    return base_1.hex.decode(pubkey);
}
/**
 *
 * @param messageHash
 * @param signature
 * @returns
 */
function getStacksAddressFromSignature(messageHash, signature) {
    const pubkey = getPubkeySignature(messageHash, signature, 'vrs');
    return getStacksAddressFromPubkey(pubkey);
}
function getStacksAddressFromSignatureRsv(messageHash, signature) {
    const pubkey = getPubkeySignature(messageHash, signature, 'rsv');
    return getStacksAddressFromPubkey(pubkey);
}
function getStacksAddressFromPubkey(pubkey) {
    const addresses = {
        tp2pkh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.testnetP2PKH),
        tp2sh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.testnetP2SH),
        mp2pkh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.mainnetP2PKH),
        mp2sh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.mainnetP2SH),
    };
    //console.log('getStacksAddressFromPubkey: addresses: ', addresses)
    return addresses;
}
function publicKeyToStxAddress(publicKey, addressVersion = StacksNetworkVersion.mainnetP2PKH) {
    return (0, c32check_1.c32address)(addressVersion, base_1.hex.encode(hash160(publicKey)));
}
function hash160(input) {
    const sha = (0, sha256_1.sha256)(input);
    return (0, ripemd160_1.ripemd160)(sha);
}
function getMagicAndOpCode(d1) {
    if (!d1 || d1.length < 2)
        throw new Error('no magic data passed');
    const magic = base_1.hex.encode(d1.subarray(0, 2));
    if (magic === exports.MAGIC_BYTES_TESTNET || magic === exports.MAGIC_BYTES_MAINNET) {
        return {
            magic: magic.toUpperCase(),
            opcode: base_1.hex.encode(d1.subarray(2, 3)).toUpperCase()
        };
    }
    return {
        opcode: base_1.hex.encode(d1.subarray(0, 1)).toUpperCase()
    };
}
var StacksNetworkVersion;
(function (StacksNetworkVersion) {
    StacksNetworkVersion[StacksNetworkVersion["mainnetP2PKH"] = 22] = "mainnetP2PKH";
    StacksNetworkVersion[StacksNetworkVersion["mainnetP2SH"] = 20] = "mainnetP2SH";
    StacksNetworkVersion[StacksNetworkVersion["testnetP2PKH"] = 26] = "testnetP2PKH";
    StacksNetworkVersion[StacksNetworkVersion["testnetP2SH"] = 21] = "testnetP2SH";
})(StacksNetworkVersion || (StacksNetworkVersion = {}));
/**
 * Ensure we don't overwrite the original object with Uint8Arrays these can't be serialised to local storage.
 * @param script
 * @returns
 */
function fromStorable(script) {
    const clone = JSON.parse(JSON.stringify(script));
    if (typeof script.tweakedPubkey !== 'string')
        return clone;
    return codifyScript(clone, true);
}
/**
 *
 * @param script
 * @returns
 */
function toStorable(script) {
    //const copied = JSON.parse(JSON.stringify(script));
    return codifyScript(script, false);
}
function codifyScript(script, asString) {
    return {
        address: script.address,
        script: codify(script.script, asString),
        paymentType: (script.type) ? script.type : script.paymentType,
        witnessScript: codify(script.witnessScript, asString),
        redeemScript: codify(script.redeemScript, asString),
        leaves: (script.leaves) ? codifyLeaves(script.leaves, asString) : undefined,
        tapInternalKey: codify(script.tapInternalKey, asString),
        tapLeafScript: (script.tapLeafScript) ? codifyTapLeafScript(script.tapLeafScript, asString) : undefined,
        tapMerkleRoot: codify(script.tapMerkleRoot, asString),
        tweakedPubkey: codify(script.tweakedPubkey, asString),
    };
}
function codifyTapLeafScript(tapLeafScript, asString) {
    if (tapLeafScript[0]) {
        const level0 = tapLeafScript[0];
        if (level0[0])
            tapLeafScript[0][0].internalKey = codify(tapLeafScript[0][0].internalKey, asString);
        if (level0[0])
            tapLeafScript[0][0].merklePath[0] = codify(tapLeafScript[0][0].merklePath[0], asString);
        if (level0[1])
            tapLeafScript[0][1] = codify(tapLeafScript[0][1], asString);
    }
    if (tapLeafScript[1]) {
        const level1 = tapLeafScript[1];
        if (level1[0])
            tapLeafScript[1][0].internalKey = codify(tapLeafScript[1][0].internalKey, asString);
        if (level1[0])
            tapLeafScript[1][0].merklePath[0] = codify(tapLeafScript[1][0].merklePath[0], asString);
        if (level1[1])
            tapLeafScript[1][1] = codify(tapLeafScript[1][1], asString);
    }
    return tapLeafScript;
}
function codify(arg, asString) {
    if (!arg)
        return;
    if (typeof arg === 'string') {
        return base_1.hex.decode(arg);
    }
    else {
        return base_1.hex.encode(arg);
    }
}
function codifyLeaves(leaves, asString) {
    if (leaves[0]) {
        const level1 = leaves[0];
        if (level1.controlBlock)
            leaves[0].controlBlock = codify(leaves[0].controlBlock, asString);
        if (level1.hash)
            leaves[0].hash = codify(leaves[0].hash, asString);
        if (level1.script)
            leaves[0].script = codify(leaves[0].script, asString);
        if (level1.path && level1.path[0])
            leaves[0].path[0] = codify(leaves[0].path[0], asString);
    }
    if (leaves[1]) {
        const level1 = leaves[1];
        if (level1.controlBlock)
            leaves[1].controlBlock = codify(leaves[1].controlBlock, asString);
        if (level1.hash)
            leaves[1].hash = codify(leaves[1].hash, asString);
        if (level1.script)
            leaves[1].script = codify(leaves[1].script, asString);
        if (level1.path && level1.path[0])
            leaves[1].path[0] = codify(leaves[1].path[0], asString);
    }
    return leaves;
}
/**
* getAddressFromOutScript converts a script to an address
* @param network:string
* @param script: Uint8Array
* @returns address as string
*/
function getAddressFromOutScript(network, script) {
    const net = (0, account_js_1.getNet)(network);
    const outputScript = btc.OutScript.decode(script);
    if (outputScript.type === 'pk' || outputScript.type === 'tr') {
        return btc.Address(net).encode({
            type: outputScript.type,
            pubkey: outputScript.pubkey,
        });
    }
    if (outputScript.type === 'ms' || outputScript.type === 'tr_ms') {
        return btc.Address(net).encode({
            type: outputScript.type,
            pubkeys: outputScript.pubkeys,
            m: outputScript.m,
        });
    }
    if (outputScript.type === 'tr_ns') {
        return btc.Address(net).encode({
            type: outputScript.type,
            pubkeys: outputScript.pubkeys,
        });
    }
    if (outputScript.type === 'unknown') {
        return btc.Address(net).encode({
            type: outputScript.type,
            script,
        });
    }
    return btc.Address(net).encode({
        type: outputScript.type,
        hash: outputScript.hash,
    });
}
