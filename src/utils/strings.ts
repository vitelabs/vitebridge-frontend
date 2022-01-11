export const shortenAddress = (address: string, startCount = 8, endCount = 10) =>
	address.substring(0, startCount) + '...' + address.substring(address.length - endCount);
export const shortenHash = (hash: string, startCount = 5, endCount = 5) =>
	hash.substring(0, startCount) + '...' + hash.substring(hash.length - endCount);

// https://www.30secondsofcode.org/js/s/copy-to-clipboard-async?from=autocomplete
export const copyToClipboardAsync = (str = '') => {
	if (navigator && navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(str);
	return window.alert('The Clipboard API is not available.');
};

export const toBiggestUnit = (num: string, decimals = 0) => {
	// Assume num is a unsigned integer (i.e. positive with no decimals) and decimals is > 0
	num = `${num.substring(0, num.length - decimals) || 0}.${'0'.repeat(
		Math.max(0, decimals - num.length)
	)}${num.substring(Math.max(0, num.length - decimals))}`;
	return num.replace(/(0+|\.0+|\.)$/, '');
};

export const toSmallestUnit = (num: string, decimals = 0) => {
	// Assume num is a positive number and decimals is > 0
	const indexOfDot = num.indexOf('.');
	if (indexOfDot === -1) {
		return num + '0'.repeat(decimals);
	}
	const decimalPlaces = num.length - indexOfDot - 1;
	return (
		num.substring(num[0] === '0' ? 1 : 0, indexOfDot) +
		num.substring(indexOfDot + 1) +
		'0'.repeat(decimals - decimalPlaces)
	);
};
