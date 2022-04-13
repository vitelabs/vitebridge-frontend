// https://chainlist.org/
export const chainIds = {
	// 'Ethereum Mainnet': '0x1',
	// 'Ropsten Testnet': '3', // for Ethereum
	// 'BSC Mainnet': '56',
	'BSC Testnet': '0x61', // Testnet(ChainID 0x61, 97 in decimal) https://docs.binance.org/smart-chain/developer/rpc.html
	'ETH Rinkeby': '0x4',
};

// https://github.com/vitelabs/vite-asset-bridge/blob/194a2a3c27f5a24d945a3bda9e0f8eac25633e31/meta.json
export const viteBridgeAssets = {
	tokens: [
		{
			token: 'USDV',
			icon: 'https://static.vite.net/image-1257137467/logo/usdt-logo2.png',
			channels: [
				[
					{
						network: 'BSC',
						desc: 'BSC Testnet',
						icon: 'https://static.vite.net/image-1257137467/logo/bsc-logo.png',
						contract: '0x1fF7EFed79585D43FB1c637064480E10c21dB709',
						erc20: '0xA86f10a4742270466ea9A62C95AdfA1273DF1FaA',
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
						contract: 'vite_9c337fe9a8d4828c80de00d5c3432f62c3dece4ac9062aa008',
						tokenId: 'tti_2ff7518e3ee12eb611f895fb',
						decimals: 18,
						confirmedThreshold: 100,
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
			token: 'VITE',
			icon: 'https://static.vite.net/image-1257137467/logo/VITE-logo.png',
			channels: [
				[
					{
						network: 'BSC',
						desc: 'BSC Testnet',
						icon: 'https://static.vite.net/image-1257137467/logo/bsc-logo.png',
						contract: '0xEa52147b9b1d2bf069Da858eFE78bB2aC3dc2EA0',
						erc20: '0x84AEEa373eF0aCd04f94B15Aa36F4475A0ac6457',
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
						contract: 'vite_029b2a33f03a39009f96f141b7e1ae52c73830844f3b9804e8',
						tokenId: 'tti_5649544520544f4b454e6e40',
						decimals: 18,
						confirmedThreshold: 100,
						max: '10',
						min: '0.1',
						fee: {
							fixed: '0',
						},
					},
				],
				[
					{
						network: 'ETH',
						desc: 'ETH Rinkeby',
						// icon: 'https://static.vite.net/image-1257137467/logo/bsc-logo.png',
						// TODO: update icon. Just using this placeholder to differentiate from bsc
						icon: 'https://static.vite.net/image-1257137467/logo/usdt-logo2.png',
						contract: '0x848aB97D30fC2E3f4cc9d8F37Aff68A5A716a352',
						erc20: '0xDC0B2bd7cA7deFfbf1a713F87059C9a139c5bB1D',
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
						contract: 'vite_1c5d11538b40abab906beea5cb1f9dbca259ed275b24521e2b',
						tokenId: 'tti_5649544520544f4b454e6e40',
						decimals: 18,
						confirmedThreshold: 100,
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

export const combos: {
	[token: string]: {
		[network: string]: string[];
	};
} = {};

viteBridgeAssets.tokens.forEach(({ token, channels }) => {
	combos[token] = {};
	channels.forEach((channel, i) => {
		// NOTE: This assume channel.length = 2
		channel.forEach((side, i) => {
			combos[token][side.desc] = combos[token][side.desc] || [];
			combos[token][side.desc].push(channel[i ? 0 : 1].desc);
		});
	});
});

// console.log('combos', JSON.stringify(combos, null, 2));
