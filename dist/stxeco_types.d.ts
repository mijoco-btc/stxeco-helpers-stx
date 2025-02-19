import { CurrentProposal, ExtensionType, InFlight, ProposalEvent, SoloPoolData, TentativeProposal } from "./dao";
import { PoxInfo, StacksInfo } from "./pox_types";
import { PredictionContractData } from "./predictions";
import { AddressObject, ExchangeRate, SbtcUserSettingI } from "./sbtc";
import { StacksBalance } from "./stacker";
import { ContractBalances } from "./stacks-node";
export type SessionStore = {
    name: string;
    loggedIn: boolean;
    balances?: StacksBalance;
    keySets: {
        [key: string]: AddressObject;
    };
    userSettings: SbtcUserSettingI;
    poxInfo: PoxInfo;
    exchangeRates: Array<ExchangeRate>;
    stacksInfo: StacksInfo;
    daoOverview: {
        contractData: PredictionContractData;
        contractBalances: ContractBalances;
    };
};
export type DaoStore = {
    activeProposals: Array<ProposalEvent>;
    inactiveProposals: Array<ProposalEvent>;
    extensions?: Array<ExtensionType>;
    soloPoolData: SoloPoolData;
    daoData?: InFlight;
    currentProposal?: CurrentProposal;
    tentativeProposals: Array<TentativeProposal>;
};
export type HeaderItem = {
    name: string;
    href: string;
    display: string;
    target: string;
};
export type HeaderLink = {
    name: string;
    href: string;
    display: string;
    target: string;
    items?: Array<HeaderItem>;
};
