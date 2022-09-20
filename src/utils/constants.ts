export const PROD = process.env.NODE_ENV === 'production';

export const allNetworks = {
	testnet: {
		VITE: { chainId: null },
		BSC: { chainId: '0x61' },
		ETH: { chainId: '0x4' },
		Aurora: { chainId: '0x4e454153' },
	},
	mainnet: {
		VITE: { chainId: null },
		BSC: { chainId: '' },
		ETH: { chainId: '0x1' },
		Aurora: { chainId: '0x4e454152' },
	},
} as const;

type Channel = {
	network: 'VITE' | 'BSC' | 'ETH' | 'Aurora';
	desc: 'Vite Testnet' | 'BSC Testnet' | 'ETH Rinkeby' | 'Aurora Testnet';
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
				],
			],
		},
		{
			token: 'BNB',
			icon: 'https://static.vite.net/image-1257137467/logo/bsc-logo.png',
			channels: [
				[
					{
						network: 'BSC',
						desc: 'BSC Testnet',
						icon: 'https://static.vite.net/image-1257137467/logo/bsc-logo.png',
						contract: '0x78C18d3D5f86c9e3e14C13b8065018ACd0d76C11',
						// erc20: 'none',
						channelId: 0,
						decimals: 18,
						confirmedThreshold: 10,
						max: '0.1',
						min: '0.01',
						fee: {
							fixed: '0',
						},
					},
					{
						network: 'VITE',
						desc: 'Vite Testnet',
						icon: 'https://static.vite.net/image-1257137467/logo/VITE-logo.png',
						contract: 'vite_e94c882e6d3905ac212440b47bcdfdd1d2730610c11213d067',
						tokenId: 'tti_87a529624c7ad1de5f971a34',
						channelId: 1,
						decimals: 18,
						confirmedThreshold: 70,
						max: '0.1',
						min: '0.01',
						fee: {
							fixed: '0',
						},
					},
				],
			],
		},
		{
			token: 'VITE',
			icon: 'https://static.vite.net/image-1257137467/logo/VITE-logo.png',
			channels: [
				[
					{
						network: 'ETH',
						desc: 'ETH Rinkeby',
						icon: 'https://static.vite.net/image-1257137467/logo/ETH-logo.png',
						contract: '0x649a886A441f3F956e6442E064C8958D191466a6',
						erc20: '0xDC0B2bd7cA7deFfbf1a713F87059C9a139c5bB1D',
						channelId: 1,
						decimals: 18,
						confirmedThreshold: 10,
						max: '10',
						min: '0.1',
						fee: {
							fixed: '0',
						},
					},
					{
						network: 'VITE',
						desc: 'Vite Testnet',
						icon: 'https://static.vite.net/image-1257137467/logo/VITE-logo.png',
						contract: 'vite_44949d8b8fde6cd83c816d7f69581f781b68ca46cca72ec92c',
						tokenId: 'tti_5649544520544f4b454e6e40',
						channelId: 0,
						decimals: 18,
						confirmedThreshold: 70,
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
			token: 'USDV',
			icon: 'https://static.vite.net/image-1257137467/logo/usdt-logo2.png',
			channels: [
				[
					{
						network: 'ETH',
						desc: 'ETH Rinkeby',
						icon: 'https://static.vite.net/image-1257137467/logo/ETH-logo.png',
						contract: '0x649a886A441f3F956e6442E064C8958D191466a6',
						erc20: '0xF45143E038E14925ea99AfeE74b7b456AD178fa8',
						channelId: 8,
						decimals: 18,
						confirmedThreshold: 10,
						max: '5',
						min: '0.1',
						fee: {
							fixed: '0',
						},
					},
					{
						network: 'VITE',
						desc: 'Vite Testnet',
						icon: 'https://static.vite.net/image-1257137467/logo/VITE-logo.png',
						contract: 'vite_44949d8b8fde6cd83c816d7f69581f781b68ca46cca72ec92c',
						tokenId: 'tti_2ff7518e3ee12eb611f895fb',
						channelId: 5,
						decimals: 18,
						confirmedThreshold: 70,
						max: '5',
						min: '0.1',
						fee: {
							fixed: '0',
						},
					},
				],
			],
		},
		{
			token: 'ETH',
			icon: 'https://static.vite.net/image-1257137467/logo/ETH-logo.png',
			channels: [
				[
					{
						network: 'ETH',
						desc: 'ETH Rinkeby',
						icon: 'https://static.vite.net/image-1257137467/logo/ETH-logo.png',
						contract: '0x649a886A441f3F956e6442E064C8958D191466a6',
						// erc20: 'none',
						channelId: 0,
						decimals: 18,
						confirmedThreshold: 10,
						max: '0.1',
						min: '0.01',
						fee: {
							fixed: '0',
						},
					},
					{
						network: 'VITE',
						desc: 'Vite Testnet',
						icon: 'https://static.vite.net/image-1257137467/logo/VITE-logo.png',
						contract: 'vite_44949d8b8fde6cd83c816d7f69581f781b68ca46cca72ec92c',
						tokenId: 'tti_06822f8d096ecdf9356b666c',
						channelId: 7,
						decimals: 18,
						confirmedThreshold: 70,
						max: '0.1',
						min: '0.01',
						fee: {
							fixed: '0',
						},
					},
				],
			],
		},
		{
			token: 'VITE',
			icon: 'https://static.vite.net/image-1257137467/logo/VITE-logo.png',
			channels: [
				[
					{
						network: 'Aurora',
						desc: 'Aurora Testnet',
						icon: 'https://static.vite.net/image-1257137467/logo/aurora.png',
						contract: '0xDC0B2bd7cA7deFfbf1a713F87059C9a139c5bB1D',
						erc20: '0xd32C96dccD8fd57B461C9B1f8052598d15ab941C',
						channelId: 1,
						decimals: 18,
						confirmedThreshold: 70,
						max: '5',
						min: '0.1',
						fee: {
							fixed: '0',
						},
					},
					{
						network: 'VITE',
						desc: 'Vite Testnet',
						icon: 'https://static.vite.net/image-1257137467/logo/VITE-logo.png',
						contract: 'vite_28624c41307ff6f2e9f61b14a82dbf295353dbeb5ab5143834',
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
	channels.forEach((channel) => {
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
