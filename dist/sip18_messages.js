"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRUCTURED_DATA_PREFIX = exports.ADMIN_MESSAGE = void 0;
exports.adminMessageToTupleCV = adminMessageToTupleCV;
exports.verifyBaseAdminSignature = verifyBaseAdminSignature;
exports.voteMessageToTupleCV = voteMessageToTupleCV;
exports.dataHashSip18 = dataHashSip18;
exports.verifySip18VoteSignature = verifySip18VoteSignature;
exports.verifyDaoSignature = verifyDaoSignature;
exports.votesToClarityValue = votesToClarityValue;
const sha256_1 = require("@noble/hashes/sha256");
const encryption_1 = require("@stacks/encryption");
const transactions_1 = require("@stacks/transactions");
const common_1 = require("@stacks/common");
const network_1 = require("@stacks/network");
exports.ADMIN_MESSAGE = "please sign this message to authorise DAO management task.";
// see https://github.com/hirosystems/stacks.js/blob/fd0bf26b5f29fc3c1bf79581d0ad9b89f0d7f15a/packages/transactions/src/structuredDataSignature.ts#L55
exports.STRUCTURED_DATA_PREFIX = new Uint8Array([0x53, 0x49, 0x50, 0x30, 0x31, 0x38]);
function adminMessageToTupleCV(message) {
    return (0, transactions_1.tupleCV)({
        message: (0, transactions_1.stringAsciiCV)(message.message),
        timestamp: (0, transactions_1.uintCV)(message.timestamp),
        admin: (0, transactions_1.stringAsciiCV)(message.admin),
    });
}
function verifyBaseAdminSignature(network, appName, appVersion, adminMessage, publicKey, signature) {
    const message = adminMessageToTupleCV(adminMessage);
    return verifyDaoSignature(network, appName, appVersion, message, publicKey, signature);
}
function voteMessageToTupleCV(message) {
    return (0, transactions_1.tupleCV)({
        attestation: (0, transactions_1.stringAsciiCV)(message.attestation),
        proposal: (0, transactions_1.principalCV)(message.proposal),
        timestamp: (0, transactions_1.uintCV)(message.timestamp),
        vote: (0, transactions_1.boolCV)(message.vote),
        voter: (0, transactions_1.principalCV)(message.voter),
        voting_power: (0, transactions_1.uintCV)(message.voting_power),
    });
}
function dataHashSip18(network, appName, appVersion, messageTupleCV) {
    const message = messageTupleCV;
    const chainId = network === "mainnet" ? network_1.ChainId.Mainnet : network_1.ChainId.Testnet;
    const domain = (0, transactions_1.tupleCV)({
        name: (0, transactions_1.stringAsciiCV)(appName),
        version: (0, transactions_1.stringAsciiCV)(appVersion),
        "chain-id": (0, transactions_1.uintCV)(chainId),
    });
    const structuredDataHash = (0, common_1.bytesToHex)((0, sha256_1.sha256)((0, transactions_1.encodeStructuredDataBytes)({ message, domain })));
    return structuredDataHash;
}
function verifySip18VoteSignature(network, appName, appVersion, voteMessage, publicKey, signature) {
    const message = voteMessageToTupleCV(voteMessage);
    return verifyDaoSignature(network, appName, appVersion, message, publicKey, signature);
}
function verifyDaoSignature(network, appName, appVersion, message, publicKey, signature) {
    const chainId = network === "mainnet" ? network_1.ChainId.Mainnet : network_1.ChainId.Testnet;
    const domain = (0, transactions_1.tupleCV)({
        name: (0, transactions_1.stringAsciiCV)(appName),
        version: (0, transactions_1.stringAsciiCV)(appVersion),
        "chain-id": (0, transactions_1.uintCV)(chainId),
    });
    const structuredDataHash = (0, common_1.bytesToHex)((0, sha256_1.sha256)((0, transactions_1.encodeStructuredDataBytes)({ message, domain })));
    //console.log("signature.hash: " + structuredDataHash);
    const signatureBytes = (0, common_1.hexToBytes)(signature);
    const strippedSignature = signatureBytes.slice(0, -1);
    //console.log("Stripped Signature (Hex):", bytesToHex(strippedSignature));
    let pubkey = "-";
    let stacksAddress = "-";
    try {
        pubkey = (0, transactions_1.publicKeyFromSignatureRsv)(structuredDataHash, signature);
        if (network === "mainnet" || network === "testnet" || network === "devnet") {
            stacksAddress = (0, transactions_1.publicKeyToAddressSingleSig)(pubkey, network);
        }
        //console.log("sa: " + pubkey);
    }
    catch (err) { }
    //console.log("pubkey: " + pubkey);
    let result = false;
    try {
        result = (0, encryption_1.verifySignature)((0, common_1.bytesToHex)(strippedSignature), structuredDataHash, publicKey);
        //console.log("verifySignatureRsv: result: " + result);
    }
    catch (err) { }
    return result ? stacksAddress : undefined;
}
function votesToClarityValue(proposal, votes, reclaimProposal) {
    const proposalCV = (0, transactions_1.contractPrincipalCV)(proposal.split(".")[0], proposal.split(".")[1]);
    const votesCV = (0, transactions_1.listCV)(votes.map((vote) => (0, transactions_1.tupleCV)({
        message: (0, transactions_1.tupleCV)({
            attestation: (0, transactions_1.stringAsciiCV)(vote.attestation),
            proposal: (0, transactions_1.principalCV)(proposal),
            timestamp: (0, transactions_1.uintCV)(vote.timestamp),
            vote: (0, transactions_1.boolCV)(vote.vote),
            voter: (0, transactions_1.principalCV)(vote.voter),
            amount: (0, transactions_1.uintCV)(vote.voting_power),
            "reclaim-proposal": reclaimProposal ? (0, transactions_1.someCV)((0, transactions_1.contractPrincipalCV)(reclaimProposal.split(".")[0], reclaimProposal.split(".")[1])) : (0, transactions_1.noneCV)(),
        }),
        signature: (0, transactions_1.bufferCV)((0, common_1.hexToBytes)(vote.signature)),
    })));
    return { proposalCV, votesCV };
}
