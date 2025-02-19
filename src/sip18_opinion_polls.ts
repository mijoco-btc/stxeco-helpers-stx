import {
  boolCV,
  bufferCV,
  listCV,
  noneCV,
  principalCV,
  someCV,
  stringAsciiCV,
  tupleCV,
  uintCV,
} from "@stacks/transactions";
import { hexToBytes } from "@stacks/common";
import { ObjectId } from "mongodb";

export interface StoredPollVoteMessage extends PollVoteMessage {
  _id: ObjectId;
  pollVoteObjectHash: string;
  processed: boolean;
  signature: string;
  publicKey: string;
}
export interface PollVoteMessage {
  "poll-id": number;
  "market-data-hash": string;
  attestation: string;
  timestamp: number;
  vote: boolean;
  voter: string;
  nftContract?: string;
  ftContract?: string;
  tokenId?: number;
  proof?: Array<string>;
}

export function pollVoteMessageToTupleCV(message: PollVoteMessage) {
  return tupleCV({
    "poll-id": uintCV(message["poll-id"]),
    attestation: stringAsciiCV(message.attestation),
    timestamp: uintCV(message.timestamp),
    vote: boolCV(message.vote),
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

export function pollVotesToClarityValue(pollVotes: StoredPollVoteMessage[]) {
  const pollVotesCV = listCV(
    pollVotes.map((poll) =>
      tupleCV({
        message: tupleCV({
          "poll-id": uintCV(poll["poll-id"]),
          "market-data-hash": bufferCV(hexToBytes(poll["market-data-hash"])),
          attestation: stringAsciiCV(poll.attestation),
          timestamp: uintCV(poll.timestamp),
          vote: boolCV(poll.vote),
          voter: principalCV(poll.voter),
          "nft-contract": poll.nftContract
            ? someCV(principalCV(poll.nftContract))
            : noneCV(),
          "ft-contract": poll.ftContract
            ? someCV(principalCV(poll.ftContract))
            : noneCV(),
          "token-id": poll.tokenId ? someCV(uintCV(poll.tokenId)) : noneCV(),
          proof:
            poll.proof && poll.proof.length > 0
              ? someCV(listCV(poll.proof.map((p) => bufferCV(hexToBytes(p)))))
              : noneCV(),
        }),
        signature: bufferCV(hexToBytes(poll.signature)),
      })
    )
  );

  return { pollVotesCV };
}
