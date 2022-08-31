import { AccountBlockBlock } from '@vite/vitejs/distSrc/utils/type';
import { ViteAPI } from '@vite/vitejs/distSrc/viteAPI/type';
import en from '../i18n/en';
import { setStateType } from './globalContext';
import { VC } from './viteConnect';

type Network = {
	name: string;
	rpcUrl: string;
	explorerUrl?: string;
};

type injectedScriptEvents = 'accountChange' | 'networkChange';
type VitePassport = {
	// These methods are relayed from contentScript.ts => injectedScript.ts
	getConnectedAddress: () => Promise<undefined | string>;
	disconnectWallet: () => Promise<undefined>;
	getNetwork: () => Promise<Network>;

	// These methods are relayed from contentScript.ts => background.ts => popup => contentScript.ts => injectedScript.ts
	connectWallet: () => Promise<{ domain: string }>;
	writeAccountBlock: (type: string, params: object) => Promise<{ block: AccountBlockBlock }>;

	// `on` subscribes to `event` and returns an unsubscribe function
	on: (
		event: injectedScriptEvents,
		callback: (payload: { activeAddress?: string; activeNetwork: Network }) => void
	) => () => void;
};
declare global {
	interface Window {
		vitePassport?: VitePassport;
	}
}

export type Balance = {
	[tokenId: string]: string;
};

export type State = {
	setState: setStateType;
	viteApi: ViteAPI;
	toast: any;
	networkType: 'testnet' | 'mainnet';
	languageType: string;
	i18n: typeof en;
	vcInstance?: VC;
	vpAddress?: string;
	metamaskAddress: string;
	viteBalanceInfo: ViteBalanceInfo;
	activeViteAddress?: string;
};

export type ViteBalanceInfo = {
	balance: {
		address: string;
		blockCount: string;
		balanceInfoMap?: {
			[tokenId: string]: {
				tokenInfo: TokenInfo;
				balance: string;
			};
		};
	};
	unreceived: {
		address: string;
		blockCount: string;
	};
};

export type TokenInfo = {
	tokenName: string;
	tokenSymbol: string;
	totalSupply: string;
	decimals: number;
	owner: string;
	tokenId: string;
	maxSupply: string;
	ownerBurnOnly: false;
	isReIssuable: false;
	index: number;
	isOwnerBurnOnly: false;
};

export type NewAccountBlock = {
	hash: string;
	height: number;
	heightStr: string;
	removed: boolean;
};

export type BridgeTransaction = {
	// id: string;
	// idx: string;
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
