
export async function getBitcoinBalances(api:string, stxAddress:string, cardinal:string, ordinal:string) {
  const path = `${api}/sbtc/address/balances/${stxAddress}/${cardinal}/${ordinal}`;
  const response = await fetch(path);
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

