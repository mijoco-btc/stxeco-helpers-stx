export interface StoredPollVoteMessage extends PollVoteMessage {
    _id?: string;
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
export declare function pollVoteMessageToTupleCV(message: PollVoteMessage): import("@stacks/transactions").TupleCV<import("@stacks/transactions").TupleData<import("@stacks/transactions").BooleanCV | import("@stacks/transactions").UIntCV | import("@stacks/transactions").StringAsciiCV>>;
export declare function pollVotesToClarityValue(pollVotes: StoredPollVoteMessage[]): {
    pollVotesCV: import("@stacks/transactions").ListCV<import("@stacks/transactions").TupleCV<import("@stacks/transactions").TupleData<import("@stacks/transactions").BufferCV | import("@stacks/transactions").TupleCV<import("@stacks/transactions").TupleData<import("@stacks/transactions").TrueCV | import("@stacks/transactions").FalseCV | import("@stacks/transactions").BufferCV | import("@stacks/transactions").UIntCV | import("@stacks/transactions").StandardPrincipalCV | import("@stacks/transactions").ContractPrincipalCV | import("@stacks/transactions").NoneCV | import("@stacks/transactions").StringAsciiCV | import("@stacks/transactions").SomeCV<import("@stacks/transactions").PrincipalCV> | import("@stacks/transactions").SomeCV<import("@stacks/transactions").UIntCV> | import("@stacks/transactions").SomeCV<import("@stacks/transactions").ListCV<import("@stacks/transactions").BufferCV>>>>>>>;
};
