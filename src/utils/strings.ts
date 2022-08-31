import BigNumber from 'bignumber.js';

export const shortenAddress = (address: string, startCount = 8, endCount = 10) =>
	address.slice(0, startCount) + '...' + address.slice(-endCount);
export const shortenHash = (hash: string, startCount = 5, endCount = 5) =>
	hash.slice(0, startCount) + '...' + hash.slice(-endCount);

// https://www.30secondsofcode.org/js/s/copy-to-clipboard-async?from=autocomplete
export const copyToClipboardAsync = (str = '') => {
	if (navigator?.clipboard?.writeText) return navigator.clipboard.writeText(str);
	return window.alert('The Clipboard API is not available.');
};

export const toBiggestUnit = (num: string, decimals = 0) => {
	return new BigNumber(num).dividedBy(10 ** decimals).toFixed();
};

export const toSmallestUnit = (num: string, decimals = 0) => {
	return new BigNumber(num).multipliedBy(10 ** decimals).toFixed();
};

export const roundDownTo6Decimals = (balance: string) =>
	Math.floor(+balance * 1000000) / 1000000 + '';

export const makeReadable = (err: any) =>
	err.toString() === '[object Object]' ? JSON.stringify(err) : err.toString();
