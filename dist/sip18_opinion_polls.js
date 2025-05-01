"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pollVoteMessageToTupleCV = pollVoteMessageToTupleCV;
exports.pollVotesToClarityValue = pollVotesToClarityValue;
const transactions_1 = require("@stacks/transactions");
const common_1 = require("@stacks/common");
function pollVoteMessageToTupleCV(message) {
    return (0, transactions_1.tupleCV)({
        "poll-id": (0, transactions_1.uintCV)(message["poll-id"]),
        attestation: (0, transactions_1.stringAsciiCV)(message.attestation),
        timestamp: (0, transactions_1.uintCV)(message.timestamp),
        vote: (0, transactions_1.boolCV)(message.vote),
        // voter: principalCV(message.voter),
        // "nft-contract": message.nftContract
        //   ? someCV(principalCV(message.nftContract))
        //   : noneCV(),
        // "ft-contract": message.ftContract
        //   ? someCV(principalCV(message.ftContract))
        //   : noneCV(),
        // "token-id": message.tokenId ? someCV(uintCV(message.tokenId)) : noneCV(),
        // proof:
        //   message.proof && message.proof.length > 0
        //     ? someCV(listCV(message.proof.map((p) => bufferCV(hexToBytes(p)))))
        //     : noneCV(),
    });
}
function pollVotesToClarityValue(pollVotes) {
    const pollVotesCV = (0, transactions_1.listCV)(pollVotes.map((poll) => (0, transactions_1.tupleCV)({
        message: (0, transactions_1.tupleCV)({
            "poll-id": (0, transactions_1.uintCV)(poll["poll-id"]),
            "market-data-hash": (0, transactions_1.bufferCV)((0, common_1.hexToBytes)(poll["market-data-hash"])),
            attestation: (0, transactions_1.stringAsciiCV)(poll.attestation),
            timestamp: (0, transactions_1.uintCV)(poll.timestamp),
            vote: (0, transactions_1.boolCV)(poll.vote),
            voter: (0, transactions_1.principalCV)(poll.voter),
            "nft-contract": poll.nftContract ? (0, transactions_1.someCV)((0, transactions_1.principalCV)(poll.nftContract)) : (0, transactions_1.noneCV)(),
            "ft-contract": poll.ftContract ? (0, transactions_1.someCV)((0, transactions_1.principalCV)(poll.ftContract)) : (0, transactions_1.noneCV)(),
            "token-id": poll.tokenId ? (0, transactions_1.someCV)((0, transactions_1.uintCV)(poll.tokenId)) : (0, transactions_1.noneCV)(),
            proof: poll.proof && poll.proof.length > 0 ? (0, transactions_1.someCV)((0, transactions_1.listCV)(poll.proof.map((p) => (0, transactions_1.bufferCV)((0, common_1.hexToBytes)(p))))) : (0, transactions_1.noneCV)(),
        }),
        signature: (0, transactions_1.bufferCV)((0, common_1.hexToBytes)(poll.signature)),
    })));
    return { pollVotesCV };
}
