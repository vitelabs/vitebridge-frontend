import { viteAddressExample, ethAddressExample, ethTxHashExample, viteTxHashExample } from '../exampleData';

import {
	shortenAddress,
	shortenHash, //TODO: copyToClipboardAsync,
	toBiggestUnit,
	toSmallestUnit,
} from '../../utils/strings';

test('shortenAddress', () => {
	// expect(shortenAddress(viteAddressExample)).toEqual('vite_5e8d4ac7dc8b75394cacd21c5667d79fe1824acb46c6b7ab1f')
	expect(shortenAddress(viteAddressExample)).toEqual('vite_5e8...46c6b7ab1f');
	expect(shortenAddress(ethAddressExample)).toEqual('0xd8dA6B...D37aA96045');
	expect(shortenAddress(viteAddressExample, 7, 5)).toEqual('vite_5e...7ab1f');
	expect(shortenAddress(ethAddressExample, 6, 3)).toEqual('0xd8dA...045');
});

test('shortenHash', () => {
	expect(shortenHash(viteTxHashExample)).toEqual('98a7e...535f4');
	expect(shortenHash(ethTxHashExample)).toEqual('0x5d0...4c417');
});

// test('copyToClipboardAsync', async () => {
// 	const str = Math.random() + '';
// 	copyToClipboardAsync(str);
// 	expect(await navigator.clipboard.readText).toEqual(str);
// });

test('toBiggestUnit', () => {
	expect(toBiggestUnit('1')).toEqual('1');
	expect(toBiggestUnit('2', 1)).toEqual('0.2');
	expect(toBiggestUnit('3', 2)).toEqual('0.03');
	expect(toBiggestUnit('4', 3)).toEqual('0.004');
});

test('toSmallestUnit', () => {
	expect(toSmallestUnit('1')).toEqual('1');
	expect(toSmallestUnit('2', 1)).toEqual('20');
	expect(toSmallestUnit('3', 2)).toEqual('300');
	expect(toSmallestUnit('4', 3)).toEqual('4000');
});
