import { MerkleTree } from "merkletreejs";
import { ClarityValue, ListCV } from "@stacks/transactions";
export type GateKeeper = {
    gateType: string;
    merkleRootInput: Array<string>;
};
export type ProofObject = {
    position: "left" | "right";
    data: Buffer;
};
export declare function generateMerkleTreeUsingStandardPrincipal(addresses: Array<string>): {
    tree: MerkleTree;
    root: string;
};
export declare function generateMerkleProof(tree: MerkleTree, address: string): {
    proof: {
        position: "left" | "right";
        data: Buffer;
    }[];
    valid: boolean;
    leaf: string;
};
export declare function proofToClarityValue(proof: Array<{
    data: Uint8Array;
    position: string;
}>): ListCV<ClarityValue>;
export declare function text2Hex(message: string): string;
export declare function contractId2Key(contractId: string): string;
