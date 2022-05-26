import { BridgeTransaction, NetworkTypes } from '../types';

export const toURLParams = (obj: { [key: string]: any }) =>
	'?' +
	Object.entries(obj)
		.map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
		.join('&');

export const getBridgeTx = function (networkType: NetworkTypes, params: { id: string }): Promise<any> {
	// update to:

	// 	If it is ETH to VITE
	// https://github.com/vitelabs/vite-asset-bridge/blob/master/bridge-eth/scripts_deploy/4input_query.js
	// https://github.com/vitelabs/vite-asset-bridge/blob/master/bridge-vite/scripts_deploy/3output_query.ts

	// If it is VITE to ETH
	// https://github.com/vitelabs/vite-asset-bridge/blob/master/bridge-vite/scripts_deploy/3input_query.ts
	// https://github.com/vitelabs/vite-asset-bridge/blob/master/bridge-eth/scripts_deploy/4output_query.js
	return Promise.race([
		new Promise((resolve) =>
			fetch(
				networkType === 'mainnet'
					? '' // TODO: get correct mainnet URL
					: 'https://buidl.vite.net/bridge/tx' + toURLParams(params)
			)
				.then((res) => res.json())
				.then(({ data, code }: { data: BridgeTransaction; code: number }) => resolve(data))
		),
		new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 30000)),
	]);
};
