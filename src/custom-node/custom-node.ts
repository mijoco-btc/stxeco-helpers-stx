import { AddressMempoolObject, WalletBalances } from "../sbtc";

export async function getWalletBalances(api:string, stxAddress:string, cardinal:string, ordinal:string):Promise<WalletBalances> {
  const rawBal = await fetchUserBalances(api, stxAddress, cardinal, ordinal);
  return {
    stacks: { 
      address: stxAddress, 
      amount: Number(rawBal?.tokenBalances?.stx?.balance || '0')
    },
    cardinal: { 
      address: rawBal.cardinalInfo?.address || 'unknown', 
      amount: bitcoinBalanceFromMempool(rawBal?.cardinalInfo)
    },
    ordinal: {
      address: rawBal.ordinalInfo?.address || 'unknown', 
      amount: bitcoinBalanceFromMempool(rawBal?.ordinalInfo)
    }
  }
}

export async function fetchSbtcWalletAddress(api:string) {
  const path = `${api}/sbtc/wallet-address`;
  const response = await fetch(path);
  const res = await response.json();
  return res;
}

function bitcoinBalanceFromMempool(addressMempoolObject:AddressMempoolObject|undefined) {
  if (!addressMempoolObject) return 0;
   return (addressMempoolObject?.chain_stats?.funded_txo_sum - addressMempoolObject.chain_stats.spent_txo_sum) || 0
}

async function fetchUserBalances(api:string, stxAddress:string, cardinal:string, ordinal:string) {
  const path = `${api}/sbtc/address/balances/${stxAddress}/${cardinal}/${ordinal}`;
  const response = await fetch(path);
  if (response.status !== 200) {
    console.log('Bitcoin address not known - is the network correct?');
  }
  const res = await response.json();
  return res;
}

export async function getBalanceAtHeight(api:string, stxAddress:string, height: number):Promise<any> {
  if (!stxAddress) return {
    stx: {
      balance: 0,
      locked: 0,
    }
  }
  const path = `${api}/dao/balance/${stxAddress}/${height}`;
  try {
    const response = await fetch(path);
    const res = await response.json();
    return res;
  } catch(err) {
    return undefined;
  }
}

export async function getStackerInfo(api:string, address:string, cycle:number) {
  const path = `${api}/pox/stacker-info/${address}/${cycle}`;
  const response = await fetch(path);
  const res = await response.json();
  return res;
}

