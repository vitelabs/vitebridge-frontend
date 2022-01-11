import { BridgeTransaction, NetworkTypes } from '../types';

export const toURLParams = (obj: { [key: string]: any }) =>
	'?' +
	Object.entries(obj)
		.map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
		.join('&');

export const getBridgeTx = function (
	networkType: NetworkTypes,
	params: { from: string; to: string; id: string }
): Promise<any> {
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
