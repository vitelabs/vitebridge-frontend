import { setStateType } from './global-context';
import { VB } from './vc';

export type Balance = {
	[tokenId: string]: string;
};

export type Networks = 'vite' | 'bsc';
export type NetworkTypes = 'testnet' | 'mainnet';

export type State = {
	setState: setStateType;
	toast: string;
	networkType: NetworkTypes;
	language: string;
	i18n: { [key: string]: string };
	vcInstance: VB | null;
	metamaskAddress: string;
	balances: {
		[network in Networks]: {
			[networkType in NetworkTypes]: Balance;
		};
	};
	tokens: {
		[tokenId: string]: TokenInfo;
	};
};

export type TokenInfo = {
	decimals: number;
	index: number;
	isOwnerBurnOnly: boolean;
	isReIssuable: boolean;
	maxSupply: string;
	owner: string;
	ownerBurnOnly: boolean;
	tokenId: string;
	tokenName: string;
	tokenSymbol: string;
	totalSupply: string;
};

export type NewAccountBlock = {
	hash: string;
	height: number;
	heightStr: string;
	removed: boolean;
};

export type BridgeTransaction = {
	id: string;
	idx: string;
	amount: string;
	fromAddress: string;
	toAddress: string;
	token: string;
	fromNet: string;
	fromHash: string;
	fromHashConfirmedHeight: number;
	fromHashConfirmationNums: number;
	fee: string;
	time: number;
	toNet: string;
	toHash: string;
	toHashConfirmedHeight: number;
	toHashConfirmationNums: number;
};
