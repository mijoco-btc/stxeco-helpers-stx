import { ClarityValue, type TupleCV, type TupleData } from "@stacks/transactions";
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
export declare const ADMIN_MESSAGE = "please sign this message to authorise DAO management task.";
export type BaseAdminMessage = {
    message: string;
    timestamp: number;
    admin: string;
};
export type Auth = {
    message: BaseAdminMessage;
    signature: SignatureData;
};
export declare const enum ChainID {
    Testnet = 2147483648,
    Mainnet = 1
}
export declare const STRUCTURED_DATA_PREFIX: Uint8Array<ArrayBuffer>;
export declare function adminMessageToTupleCV(message: BaseAdminMessage): TupleCV<TupleData<import("@stacks/transactions").UIntCV | import("@stacks/transactions").StringAsciiCV>>;
export declare function verifyBaseAdminSignature(network: string, appName: string, appVersion: string, adminMessage: BaseAdminMessage, publicKey: string, signature: string): string | undefined;
export declare function voteMessageToTupleCV(message: VoteMessage): TupleCV<TupleData<import("@stacks/transactions").BooleanCV | import("@stacks/transactions").UIntCV | import("@stacks/transactions").StringAsciiCV | import("@stacks/transactions").PrincipalCV>>;
export declare function dataHashSip18(network: string, appName: string, appVersion: string, messageTupleCV: TupleCV<TupleData<ClarityValue>>): string;
export declare function verifySip18VoteSignature(network: string, appName: string, appVersion: string, voteMessage: VoteMessage, publicKey: string, signature: string): string | undefined;
export declare function verifyDaoSignature(network: string, appName: string, appVersion: string, message: TupleCV<TupleData<ClarityValue>>, publicKey: string, signature: string): string | undefined;
export declare function votesToClarityValue(proposal: string, votes: StoredVoteMessage[], reclaimProposal?: string): {
    proposalCV: import("@stacks/transactions").ContractPrincipalCV;
    votesCV: import("@stacks/transactions").ListCV<TupleCV<TupleData<import("@stacks/transactions").BufferCV | TupleCV<TupleData<import("@stacks/transactions").BooleanCV | import("@stacks/transactions").UIntCV | import("@stacks/transactions").StringAsciiCV | import("@stacks/transactions").PrincipalCV | import("@stacks/transactions").OptionalCV<import("@stacks/transactions").ContractPrincipalCV>>>>>>;
};
