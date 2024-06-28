import { AddressMempoolObject, WalletBalances } from "../sbtc";
import { fetchUserBalances } from "../sbtc-contract";

export async function getWalletBalances(stacksApi:string, mempoolApi:string, stxAddress:string, cardinal:string, ordinal:string):Promise<WalletBalances> {
  const rawBal = await fetchUserBalances(stacksApi, mempoolApi, stxAddress, cardinal, ordinal);
  return {
    stacks: {
      address: stxAddress, 
      amount: Number(rawBal?.tokenBalances?.stx?.balance || '0')
    },
    cardinal: {
      address: cardinal, 
      amount: extractBtcBalance(rawBal?.cardinalInfo)
    },
    ordinal: {
      address: ordinal, 
      amount: extractBtcBalance(rawBal?.ordinalInfo)
    }
  }
}

function extractBtcBalance(addressMempoolObject:AddressMempoolObject|undefined) {
  if (!addressMempoolObject) return 0;
   return (addressMempoolObject?.chain_stats?.funded_txo_sum - addressMempoolObject.chain_stats.spent_txo_sum) || 0
}

export async function getBalanceAtHeight(stacksApi:string, stxAddress:string, height: number):Promise<any> {
  if (!stxAddress) return {
    stx: {
      balance: 0,
      locked: 0,
    }
  }
  const url = `${stacksApi}/extended/v1/address/${stxAddress}/balances?until_block=${height}`
  let val;
  try {
      const response = await fetch(url)
      val = await response.json();
  }
  catch (err) {
      console.log('getBalanceAtHeight: ', err);
  }
  return val;
}

