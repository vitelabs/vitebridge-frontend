export const PROD = process.env.NODE_ENV === 'production';

export const allNetworks = {
	testnet: {
		VITE: { chainId: null },
		BSC: { chainId: '0x61' }, // chainId: 97
		ETH: { chainId: '0x5' },  // rinkby: 4, goerli: 5
		Aurora: { chainId: '0x4e454153' }, // chainId: 1313161555
		POLYGON: { chainId: '0x13881' }, // chainId: 80001
	},
	mainnet: {
		VITE: { chainId: null },
		BSC: { chainId: '' },
		ETH: { chainId: '0x1' },
		Aurora: { chainId: '0x4e454152' },
		POLYGON: { chainId: '0x89' }, // chainId: 137
	},
} as const;

type Channel = {
	network: 'VITE' | 'BSC' | 'ETH' | 'Aurora' | 'POLYGON';
	desc: 'Vite Testnet' | 'BSC Testnet' | 'ETH Goerli' | 'Aurora Testnet' | 'POLYGON Testnet';
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

// https://github.com/vitelabs/vite-asset-bridge/blob/master/meta.json
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
						contract: '0x767B2f5Cde13B9F19ACC467a8092776EfeB5A249',
						erc20: '0xDa457Fb8Ab7eB1ad7Fd7F0331c2408A69cc56080',
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
						contract: 'vite_7927693f6c15ab76c1e796dfabdf7bc0582cf90cc460472236',
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
				[
					{
						network: 'ETH',
						desc: 'ETH Goerli',
						icon: 'https://static.vite.net/image-1257137467/logo/ETH-logo.png',
						contract: '0xd32C96dccD8fd57B461C9B1f8052598d15ab941C',
						erc20: '0x29673303B938528389eE53daf55f6d6de6e0Cf80',
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
						contract: 'vite_79793150a79b7bf66cd5c984a2ff92fcbc189e40ced82b30ed',
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
				[
					{
						network: 'Aurora',
						desc: 'Aurora Testnet',
						icon: 'https://static.vite.net/image-1257137467/logo/aurora.png',
						contract: '0xED1E920A487B2c28D2f386690995b582A34C54F2',
						erc20: '0xCa9E81076aBc50843a9757dF093394512D556B72',
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
						contract: 'vite_d10566d5a58bfcb97ff052e7c8d608fe55b5b4ad54e409d3b0',
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
				[
					{
						network: 'POLYGON',
						desc: 'POLYGON Testnet',
						icon: 'https://static.vite.net/token-profile-1257137467/icon/19fb02528a61a094e2b74e2d5a5f2086.png',
						contract: '0xd32C96dccD8fd57B461C9B1f8052598d15ab941C',
						erc20: '0x29673303B938528389eE53daf55f6d6de6e0Cf80',
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
						contract: 'vite_73d5c1bd20c05408f3843745d7c64e7fdcf9e5e325994cfbf7',
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
						contract: '0x767B2f5Cde13B9F19ACC467a8092776EfeB5A249',
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
						contract: 'vite_7927693f6c15ab76c1e796dfabdf7bc0582cf90cc460472236',
						tokenId: 'tti_2be836f7e90b34c061de9f7b',
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
			token: 'USDV',
			icon: 'https://static.vite.net/image-1257137467/logo/usdt-logo2.png',
			channels: [
				[
					{
						network: 'ETH',
						desc: 'ETH Goerli',
						icon: 'https://static.vite.net/image-1257137467/logo/ETH-logo.png',
						contract: '0xd32C96dccD8fd57B461C9B1f8052598d15ab941C',
						erc20: '0x99Bfa07e420dF905823232C4d37515981689ef5b',
						channelId: 3,
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
						contract: 'vite_79793150a79b7bf66cd5c984a2ff92fcbc189e40ced82b30ed',
						tokenId: 'tti_608c638fb5984cf93cad6e4f',
						channelId: 3,
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
						desc: 'ETH Goerli',
						icon: 'https://static.vite.net/image-1257137467/logo/ETH-logo.png',
						contract: '0xd32C96dccD8fd57B461C9B1f8052598d15ab941C',
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
						contract: 'vite_79793150a79b7bf66cd5c984a2ff92fcbc189e40ced82b30ed',
						tokenId: 'tti_06822f8d096ecdf9356b666c',
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
