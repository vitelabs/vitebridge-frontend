// fork of https://github.com/weserickson/solpp-dapp-workshop/blob/master/src/vitescripts.js

import provider from '@vite/vitejs-ws';
import { ViteAPI } from '@vite/vitejs';

const providerURL = 'wss://buidl.vite.net/gvite/ws'; // testnet node
// const providerURL = 'wss://node-tokyo.vite.net/ws';
// const providerURL = 'wss://node.vite.net/gvite/ws';
const providerTimeout = 60000;
const providerOptions = { retryTimes: 10, retryInterval: 5000 };
const WS_RPC = new provider(providerURL, providerTimeout, providerOptions);
export const viteClient = new ViteAPI(WS_RPC, () => {
	// console.log('client connected');
});

export function getBalanceInfo(address: string) {
	return viteClient.getBalanceInfo(address);
}

export function subscribe(event: string, ...args: any) {
	return viteClient.subscribe(event, ...args);
}
