
export async function getBitcoinBalances(revealerApi:string, stxAddress:string, cardinal:string, ordinal:string) {
  const path = `${revealerApi}/sbtc/address/balances/${stxAddress}/${cardinal}/${ordinal}`;
  const response = await fetch(path);
  const res = await response.json();
  return res;
}

export async function getBalanceAtHeight(revealerApi:string, stxAddress:string, height: number):Promise<any> {
  if (!stxAddress) return {
    stx: {
      balance: 0,
      locked: 0,
    }
  }
  const path = `${revealerApi}/dao/balance/${stxAddress}/${height}`;
  try {
    const response = await fetch(path);
    const res = await response.json();
    return res;
  } catch(err) {
    return undefined;
  }
}

export async function getStackerInfo(revealerApi:string, address:string, cycle:number) {
  const path = `${revealerApi}/pox/stacker-info/${address}/${cycle}`;
  const response = await fetch(path);
  const res = await response.json();
  return res;
}

