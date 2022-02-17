// https://chainlist.org/
export const chainIds = {
	// 'Ethereum Mainnet': '0x1',
	// 'Ropsten Testnet': '3', // for Ethereum
	// 'BSC Mainnet': '56',
	'BSC Testnet': '0x61', // Testnet(ChainID 0x61, 97 in decimal) https://docs.binance.org/smart-chain/developer/rpc.html
};

export const viteTokenId = 'tti_5649544520544f4b454e6e40';

// https://raw.githubusercontent.com/vitelabs/vite-asset-bridge/master/meta.json
export const viteBridgeAssets = {
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
				],
			],
		},
		{
			token: 'USDV',
			icon: 'https://static.vite.net/image-1257137467/logo/usdt-logo2.png',
			channels: [
				[
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
				],
				// [ // for testing purposes only
				// 	{
				// 		network: 'ETH',
				// 		desc: 'ETH Testnet',
				// 		icon: 'https://static.vite.net/image-1257137467/logo/VITE-logo.png',
				// 		contract: 'vite_9c337fe9a8d4828c80de00d5c3432f62c3dece4ac9062aa008',
				// 		tokenId: 'tti_2ff7518e3ee12eb611f895fb',
				// 		decimals: 18,
				// 		confirmedThreshold: 100,
				// 		max: '5',
				// 		min: '0.1',
				// 		fee: {
				// 			fixed: '0',
				// 		},
				// 	},
				// 	{
				// 		network: 'BSC',
				// 		desc: 'BSC Testnet',
				// 		icon: 'https://static.vite.net/image-1257137467/logo/bsc-logo.png',
				// 		contract: '0x1fF7EFed79585D43FB1c637064480E10c21dB709',
				// 		erc20: '0xA86f10a4742270466ea9A62C95AdfA1273DF1FaA',
				// 		decimals: 18,
				// 		confirmedThreshold: 10,
				// 		max: '5',
				// 		min: '0.1',
				// 		fee: {
				// 			fixed: '0',
				// 		},
				// 	},
				// ],
			],
		},
	],
};
