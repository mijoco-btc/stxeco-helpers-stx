import { TokenBalances } from "../sbtc";
import {
  Cl,
  ClarityValue,
  cvToJSON,
  deserializeCV,
  serializeCV,
} from "@stacks/transactions";
import { PoxInfo } from "../pox_types";
import {
  STACKS_MAINNET,
  STACKS_MOCKNET,
  STACKS_TESTNET,
} from "@stacks/network";
import { TokenPermissionEvent } from "../markets";

export type ContractAssets = {
  limit: number;
  offset: number;
  assets: Array<ContractAsset>;
};
export type ContractAsset = {
  limit: number;
  offset: number;
  results: Array<StacksAsset>;
};
export type StacksAsset = {
  event_index: number;
  event_type: string;
  tx_id: string;
  asset: {
    asset_event_type: string;
    sender: string;
    recipient: string;
    amount: string;
  };
};

export async function fetchContractAssets(
  stacksApi: string,
  principal: string
): Promise<ContractAssets> {
  const path = `${stacksApi}/extended/v1/address/${principal}/assets`;
  const response = await fetch(path);
  const res = await response.json();
  return res;
}

export async function fetchSip10(
  stacksApi: string,
  principal: string
): Promise<ContractAssets> {
  const path = `${stacksApi}/extended/v1/address/${principal}/assets`;
  const response = await fetch(path);
  const res = await response.json();
  return res;
}

export type ContractBalances = {
  fungible_tokens: any;
  non_fungible_tokens: any;
  stx: ContractStxBalance;
};
export type ContractStxBalance = {
  balance: string;
  burnchain_lock_height: number;
  burnchain_unlock_height: number;
  estimated_balance: string;
  lock_height: number;
  lock_tx_id: string;
  locked: string;
  total_fees_sent: string;
  total_miner_rewards_received: string;
  total_received: string;
  total_sent: string;
};

export async function fetchContractBalances(
  stacksApi: string,
  principal: string
): Promise<ContractBalances> {
  const path = `${stacksApi}/extended/v1/address/${principal}/balances`;
  const response = await fetch(path);
  const res = await response.json();
  return res;
}

export async function fetchContractStxBalance(
  stacksApi: string,
  principal: string
): Promise<ContractStxBalance> {
  const path = `${stacksApi}/extended/v1/address/${principal}/stx`;
  const response = await fetch(path);
  const res = await response.json();
  return res;
}

export async function getTransaction(
  stacksApi: string,
  tx: string
): Promise<any> {
  const url = `${stacksApi}/extended/v1/tx/${tx}`;
  let val;
  try {
    const response = await fetch(url);
    val = await response.json();
  } catch (err) {
    console.log("getTransaction: ", err);
  }
  return val;
}

export async function fetchDataVar(
  stacksApi: string,
  contractAddress: string,
  contractName: string,
  dataVarName: string
) {
  try {
    //checkAddressForNetwork(getConfig().network, contractAddress)
    const url = `${stacksApi}/v2/data_var/${contractAddress}/${contractName}/${dataVarName}`;
    const response = await fetch(url);
    const result = await response.json();
    return result;
  } catch (err) {
    console.log(
      "fetchDataVar: " +
        (err as { message: string }).message +
        " contractAddress: " +
        contractAddress
    );
  }
}

export async function fetchMapEntry(
  stacksApi: string,
  contractAddress: string,
  contractName: string,
  mapName: string,
  lookupKey: ClarityValue
) {
  try {
    //checkAddressForNetwork(getConfig().network, contractAddress)
    const url = `${stacksApi}/v2/map_entry/${contractAddress}/${contractName}/${mapName}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "" },
      body: serializeCV(lookupKey),
    });
    const result = await response.json();
    return result;
  } catch (err) {
    console.log(
      "fetchDataVar: " +
        (err as { message: string }).message +
        " contractAddress: " +
        contractAddress
    );
  }
}

export function getStacksNetwork(network: string) {
  let stxNetwork;
  /**
	if (CONFIG.VITE_ENVIRONMENT === 'nakamoto') {
		stxNetwork = new StacksTestnet({
			url: 'https://api.nakamoto.testnet.hiro.so',
		});
		return stxNetwork
	 }
	  */
  if (network === "devnet") stxNetwork = STACKS_MOCKNET;
  else if (network === "testnet") stxNetwork = STACKS_TESTNET;
  else if (network === "mainnet") stxNetwork = STACKS_MAINNET;
  else stxNetwork = STACKS_MOCKNET;
  return stxNetwork;
}

export async function lookupContract(stacksApi: string, contract_id: string) {
  const path = `${stacksApi}/extended/v1/contract/${contract_id}`;
  const response = await fetch(path);
  const res = await response.json();
  return res;
}
export async function isConstructed(stacksApi: string, contract_id: string) {
  const path = `${stacksApi}/extended/v1/contract/${contract_id}`;
  const response = await fetch(path);
  const res = await response.json();
  return res;
}
export async function fetchStacksInfo(stacksApi: string) {
  const path = `${stacksApi}/v2/info`;
  const response = await fetch(path);
  const res = await response.json();
  return res;
}
export async function getTokenBalances(
  stacksApi: string,
  principal: string
): Promise<TokenBalances> {
  const path = `${stacksApi}/extended/v1/address/${principal}/balances`;
  const response = await fetch(path);
  const res = await response.json();
  return res;
}

export async function callContractReadOnly(stacksApi: string, data: any) {
  let url = `${stacksApi}/v2/contracts/call-read/${data.contractAddress}/${data.contractName}/${data.functionName}`;
  if (data.tip) {
    url += "?tip=" + data.tip;
  }
  let val;
  try {
    console.log("callContractReadOnly: url: ", url);
    const hiroApi1 = "ae4ecb7b39e8fbc0326091ddac461bc6";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hiro-api-key": hiroApi1,
      },
      body: JSON.stringify({
        arguments: data.functionArgs,
        sender: data.contractAddress,
      }),
    });
    val = await response.json();
  } catch (err) {
    console.error("callContractReadOnly4: ", err);
  }
  try {
    const result = cvToJSON(deserializeCV(val.result));
    return result;
  } catch (err: any) {
    console.error("Error: callContractReadOnly: ", val);
    return val;
  }
}

export async function getStacksHeightFromBurnBlockHeight(
  stacksApi: string,
  burnHeight: number
): Promise<number> {
  let url = `${stacksApi}/extended/v2/burn-blocks/${burnHeight}/blocks`;
  let response = await fetch(url);
  if (response.status !== 200) {
    return -1; // burn height in future.
  }
  let val = await response.json();
  if (!val || !val.results || val.results.length === 0) return 0;
  console.log(
    "getStacksHeightFromBurnBlockHeight: burnHeight: " + burnHeight,
    val.results
  );
  return val.results[0].height;
}

export async function getFirstStacksBlock(
  stacksApi: string,
  burnBlockHeight: number
) {
  let stacksBlock = null;
  let currentBurnBlock = burnBlockHeight;

  while (!stacksBlock) {
    const url = `${stacksApi}/extended/v2/burn-blocks/${currentBurnBlock}/blocks`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      stacksBlock = data.results[0]; // Take first Stacks block
      return {
        stacksHeight: stacksBlock.height,
        stacksHash: stacksBlock.hash,
        indexHash: stacksBlock.index_block_hash,
        burnBlockHeight: data.burn_block_height,
      };
    }

    console.log(
      `No Stacks block found at burn block ${currentBurnBlock}, checking next...`
    );
    currentBurnBlock++; // Move to the next Bitcoin block
  }
}

export async function getPoxInfo(stacksApi: string): Promise<PoxInfo> {
  const path = `${stacksApi}/v2/pox`;
  const response = await fetch(path);
  const res = await response.json();
  return res;
}

export async function getSip10Properties(
  stacksApi: string,
  token: TokenPermissionEvent,
  owner?: string
) {
  let p = await getSip10Property(stacksApi, token, "get-symbol");
  let symbol = p;
  p = await getSip10Property(stacksApi, token, "get-name");
  let name = p;
  p = await getSip10Property(stacksApi, token, "get-decimals");
  let decimals = Number(p);
  p = await getSip10Property(stacksApi, token, "get-token-uri");
  let tokenUri = p.value;
  p = await getSip10Property(stacksApi, token, "get-total-supply");
  let totalSupply = Number(p);
  let balance = 0;
  if (owner) {
    p = await getSip10Balance(stacksApi, token, owner);
    balance = Number(p);
  }
  return {
    symbol,
    name,
    tokenUri,
    decimals,
    totalSupply,
    balance,
  };
}

export async function getSip10Balance(
  stacksApi: string,
  token: TokenPermissionEvent,
  owner: string
): Promise<any> {
  const functionArgs: Array<any> = [`0x${serializeCV(Cl.principal(owner))}`];
  const data = {
    contractAddress: token.token.split(".")[0],
    contractName: token.token.split(".")[1],
    functionName: "get-balance",
    functionArgs,
  };
  const result = await callContractReadOnly(stacksApi, data);
  return result?.value?.value || "get-balance";
}

export async function getSip10Property(
  stacksApi: string,
  token: TokenPermissionEvent,
  functionName: string
): Promise<any> {
  const functionArgs: Array<any> = [];
  const data = {
    contractAddress: token.token.split(".")[0],
    contractName: token.token.split(".")[1],
    functionName,
    functionArgs,
  };
  const result = await callContractReadOnly(stacksApi, data);
  return result?.value?.value || functionName;
}
