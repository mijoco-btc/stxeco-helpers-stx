import { sha256 } from "@noble/hashes/sha256";
import { verifySignature } from "@stacks/encryption";
import {
  boolCV,
  bufferCV,
  ClarityValue,
  contractPrincipalCV,
  encodeStructuredDataBytes,
  listCV,
  noneCV,
  principalCV,
  publicKeyFromSignatureRsv,
  publicKeyToAddressSingleSig,
  someCV,
  stringAsciiCV,
  stringUtf8CV,
  tupleCV,
  uintCV,
  type TupleCV,
  type TupleData,
} from "@stacks/transactions";
import { bytesToHex, hexToBytes } from "@stacks/common";
import { ChainId } from "@stacks/network";
import { ObjectId } from "mongodb";
import { SignatureData } from "@stacks/connect";

export interface StoredVoteMessage extends VoteMessage {
  _id: ObjectId;
  voteObjectHash: string;
  processed: boolean;
  signature: string;
  publicKey: string;
}
export interface VoteMessage {
  attestation: string;
  proposal: string;
  timestamp: number;
  vote: boolean;
  voter: string;
  voting_power: number;
}

export const ADMIN_MESSAGE =
  "please sign this message to authorise DAO management task.";
export type BaseAdminMessage = {
  message: string;
  timestamp: number;
  admin: string;
};
export type Auth = {
  message: BaseAdminMessage;
  signature: SignatureData;
};
export const enum ChainID {
  Testnet = 2147483648,
  Mainnet = 1,
}
// see https://github.com/hirosystems/stacks.js/blob/fd0bf26b5f29fc3c1bf79581d0ad9b89f0d7f15a/packages/transactions/src/structuredDataSignature.ts#L55
export const STRUCTURED_DATA_PREFIX = new Uint8Array([
  0x53, 0x49, 0x50, 0x30, 0x31, 0x38,
]);

export function adminMessageToTupleCV(message: BaseAdminMessage) {
  return tupleCV({
    message: stringAsciiCV(message.message),
    timestamp: uintCV(message.timestamp),
    admin: stringAsciiCV(message.admin),
  });
}

export function verifyBaseAdminSignature(
  network: string,
  appName: string,
  appVersion: string,
  adminMessage: BaseAdminMessage,
  publicKey: string,
  signature: string
) {
  const message = adminMessageToTupleCV(adminMessage);
  return verifyDaoSignature(
    network,
    appName,
    appVersion,
    message,
    publicKey,
    signature
  );
}

export function voteMessageToTupleCV(message: VoteMessage) {
  return tupleCV({
    attestation: stringAsciiCV(message.attestation),
    proposal: principalCV(message.proposal),
    timestamp: uintCV(message.timestamp),
    vote: boolCV(message.vote),
    voter: principalCV(message.voter),
    voting_power: uintCV(message.voting_power),
  });
}

export function dataHashSip18(
  network: string,
  appName: string,
  appVersion: string,
  messageTupleCV: TupleCV<TupleData<ClarityValue>>
) {
  const message = messageTupleCV;
  const chainId = network === "mainnet" ? ChainId.Mainnet : ChainId.Testnet;
  const domain = tupleCV({
    name: stringAsciiCV(appName),
    version: stringAsciiCV(appVersion),
    "chain-id": uintCV(chainId),
  });
  const structuredDataHash = bytesToHex(
    sha256(encodeStructuredDataBytes({ message, domain }))
  );
  return structuredDataHash;
}

export function verifySip18VoteSignature(
  network: string,
  appName: string,
  appVersion: string,
  voteMessage: VoteMessage,
  publicKey: string,
  signature: string
) {
  const message = voteMessageToTupleCV(voteMessage);
  return verifyDaoSignature(
    network,
    appName,
    appVersion,
    message,
    publicKey,
    signature
  );
}

export function verifyDaoSignature(
  network: string,
  appName: string,
  appVersion: string,
  message: TupleCV<TupleData<ClarityValue>>,
  publicKey: string,
  signature: string
): string | undefined {
  const chainId = network === "mainnet" ? ChainId.Mainnet : ChainId.Testnet;
  const domain = tupleCV({
    name: stringAsciiCV(appName),
    version: stringAsciiCV(appVersion),
    "chain-id": uintCV(chainId),
  });
  const structuredDataHash = bytesToHex(
    sha256(encodeStructuredDataBytes({ message, domain }))
  );

  console.log("signature.hash: " + structuredDataHash);

  const signatureBytes = hexToBytes(signature);
  const strippedSignature = signatureBytes.slice(0, -1);
  //console.log("Stripped Signature (Hex):", bytesToHex(strippedSignature));

  let pubkey: string = "-";
  let stacksAddress: string = "-";
  try {
    pubkey = publicKeyFromSignatureRsv(structuredDataHash, signature);

    if (
      network === "mainnet" ||
      network === "testnet" ||
      network === "devnet"
    ) {
      stacksAddress = publicKeyToAddressSingleSig(pubkey, network);
    }

    console.log("sa: " + pubkey);
  } catch (err: any) {}
  console.log("pubkey: " + pubkey);
  let result = false;
  try {
    result = verifySignature(
      bytesToHex(strippedSignature),
      structuredDataHash,
      publicKey
    );
    console.log("verifySignatureRsv: result: " + result);
  } catch (err: any) {}
  return result ? stacksAddress : undefined;
}

export function votesToClarityValue(
  proposal: string,
  votes: StoredVoteMessage[],
  reclaimProposal?: string
) {
  const proposalCV = contractPrincipalCV(
    proposal.split(".")[0],
    proposal.split(".")[1]
  );

  const votesCV = listCV(
    votes.map((vote) =>
      tupleCV({
        message: tupleCV({
          attestation: stringAsciiCV(vote.attestation),
          proposal: principalCV(proposal),
          timestamp: uintCV(vote.timestamp),
          vote: boolCV(vote.vote),
          voter: principalCV(vote.voter),
          amount: uintCV(vote.voting_power),
          "reclaim-proposal": reclaimProposal
            ? someCV(
                contractPrincipalCV(
                  reclaimProposal.split(".")[0],
                  reclaimProposal.split(".")[1]
                )
              )
            : noneCV(),
        }),
        signature: bufferCV(hexToBytes(vote.signature)),
      })
    )
  );

  return { proposalCV, votesCV };
}
