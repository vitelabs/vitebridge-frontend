export const PROD = process.env.NODE_ENV === 'production';

// https://chainlist.org/
export const chainIds = {
	// 'Ethereum Mainnet': '0x1',
	// 'Ropsten Testnet': '3', // for Ethereum
	// 'BSC Mainnet': '56',
	'BSC Testnet': '0x61', // Testnet(ChainID 0x61, 97 in decimal) https://docs.binance.org/smart-chain/developer/rpc.html
	'ETH Rinkeby': '0x4',
};

// https://github.com/vitelabs/vite-asset-bridge/blob/vite-bridge-rinkeby-buidl-patch/meta.json
export const viteBridgeAssets = {
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
				[
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
