export const PROD = process.env.NODE_ENV === 'production';

// https://chainlist.org/
export const chainInfo: { [key: string]: { id: string; rpc: string } } = {
	// 'Ethereum Mainnet': '0x1',
	// 'Ropsten Testnet': '3', // for Ethereum
	// 'BSC Mainnet': '56',
	'BSC Testnet': {
		id: '0x61', // Testnet(ChainID 0x61, 97 in decimal) https://docs.binance.org/smart-chain/developer/rpc.html
		rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
	},
	'ETH Rinkeby': {
		id: '0x4',
		rpc: 'https://node.vite.net/eth/rinkeby',
	},
} as const;

type Channel = {
	network: 'VITE' | 'BSC' | 'ETH';
	desc: 'Vite Testnet' | 'BSC Testnet' | 'ETH Rinkeby';
	icon: string;
	contract: string;
	tokenId?: string;
	erc20?: string;
	channelId: number;
	decimals: number;
	confirmedThreshold: number;
	max: string;
	min: string;
	fee: {
		fixed: string;
	};
};

// https://github.com/vitelabs/vite-asset-bridge/blob/vite-bridge-rinkeby-buidl-patch/meta.json
export const viteBridgeAssets: {
	tokens: {
		token: string;
		icon: string;
		channels: [Channel, Channel][];
	}[];
} = {
	tokens: [
		{
			token: 'VITE',
			icon: 'https://static.vite.net/image-1257137467/logo/VITE-logo.png',
			channels: [
				[
					{
						network: 'VITE',
						desc: 'Vite Testnet',
						icon: 'https://static.vite.net/image-1257137467/logo/VITE-logo.png',
						contract: 'vite_e94c882e6d3905ac212440b47bcdfdd1d2730610c11213d067',
						tokenId: 'tti_5649544520544f4b454e6e40',
						channelId: 0,
						decimals: 18,
						confirmedThreshold: 70,
						max: '5',
						min: '0.1',
						fee: {
							fixed: '0',
						},
					},
					{
						network: 'BSC',
						desc: 'BSC Testnet',
						icon: 'https://static.vite.net/image-1257137467/logo/bsc-logo.png',
						contract: '0x78C18d3D5f86c9e3e14C13b8065018ACd0d76C11',
						erc20: '0x84AEEa373eF0aCd04f94B15Aa36F4475A0ac6457',
						channelId: 1,
						decimals: 18,
						confirmedThreshold: 10,
						max: '5',
						min: '0.1',
						fee: {
							fixed: '0',
						},
					},
				],
				[
					{
						network: 'VITE',
						desc: 'Vite Testnet',
						icon: 'https://static.vite.net/image-1257137467/logo/VITE-logo.png',
						contract: 'vite_44949d8b8fde6cd83c816d7f69581f781b68ca46cca72ec92c',
						tokenId: 'tti_5649544520544f4b454e6e40',
						// channel: 0,
						channelId: 0,
						decimals: 18,
						confirmedThreshold: 70,
						max: '10',
						min: '0.1',
						fee: {
							fixed: '0',
						},
					},
					{
						network: 'ETH',
						desc: 'ETH Rinkeby',
						icon: 'https://static.vite.net/image-1257137467/logo/ETH-logo.png',
						contract: '0x649a886A441f3F956e6442E064C8958D191466a6',
						erc20: '0xDC0B2bd7cA7deFfbf1a713F87059C9a139c5bB1D',
						// channel: 1,
						channelId: 1,
						decimals: 18,
						confirmedThreshold: 10,
						max: '10',
						min: '0.1',
						fee: {
							fixed: '0',
						},
					},
				],
			],
		},
		{
			token: 'USDT',
			icon: 'https://static.vite.net/crypto-info/tokens/autk/tti_b0de22e5d54c92c43c3a9e54.jpg',
			channels: [
				[
					{
						network: 'VITE',
						desc: 'Vite Testnet',
						icon: 'https://static.vite.net/image-1257137467/logo/VITE-logo.png',
						contract: 'vite_44949d8b8fde6cd83c816d7f69581f781b68ca46cca72ec92c',
						tokenId: 'tti_973afc9ffd18c4679de42e93',
						channelId: 6,
						decimals: 6,
						confirmedThreshold: 70,
						max: '5',
						min: '0.1',
						fee: {
							fixed: '0',
						},
					},
					{
						network: 'ETH',
						desc: 'ETH Rinkeby',
						icon: 'https://static.vite.net/image-1257137467/logo/ETH-logo.png',
						contract: '0x649a886A441f3F956e6442E064C8958D191466a6',
						erc20: '0x8990FFEa1f2856a6e4e89743cbE9742EaE1DbDa0',
						channelId: 9,
						decimals: 18,
						confirmedThreshold: 10,
						max: '5',
						min: '0.01',
						fee: {
							fixed: '0',
						},
					},
				],
			],
		},
	],
};

export const channelCombos: {
	[token: string]: {
		[network: string]: string[];
	};
} = {};

viteBridgeAssets.tokens.forEach(({ token, channels }) => {
	if (!channelCombos[token]) {
		channelCombos[token] = {};
	}
	channels.forEach((channel, i) => {
		if (channel.length !== 2) {
			throw new Error('channel must have length 2');
		}
		channel.forEach((side, i) => {
			if (!channelCombos[token][side.desc]) {
				channelCombos[token][side.desc] = [];
			}
			channelCombos[token][side.desc].push(channel[i ? 0 : 1].desc);
		});
		for (const network in channelCombos[token]) {
			channelCombos[token][network].sort((a, b) => (a.includes('Vite') ? -1 : a < b ? -1 : 1));
		}
	});
});

// console.log('channelCombos', JSON.stringify(channelCombos, null, 2));
