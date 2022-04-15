// @ts-nocheck

import { toBiggestUnit } from './strings';
import { ViteBalanceInfo } from './types';

// import detectEthereumProvider from '@metamask/detect-provider';
// const provider = await detectEthereumProvider();

// https://docs.metamask.io/guide/getting-started.html#basic-considerations
export const metaMaskIsSupported = () => typeof window.ethereum !== 'undefined';

export const getMetaMaskAccount = async () => {
	if (!metaMaskIsSupported()) return;
	return (await ethereum.request({ method: 'eth_accounts' }))[0];
};

export const promptMetaMaskAccount = async () => {
	if (!metaMaskIsSupported()) return;
	return (await ethereum.request({ method: 'eth_requestAccounts' }))[0];
};

export const getViteTokenBalance = (viteBalanceInfo: ViteBalanceInfo, tokenId: string) => {
	if (viteBalanceInfo.balance.balanceInfoMap) {
		const { balance, tokenInfo } = viteBalanceInfo.balance.balanceInfoMap[tokenId];
		return toBiggestUnit(balance, tokenInfo.decimals);
	}
	return '0';
};
