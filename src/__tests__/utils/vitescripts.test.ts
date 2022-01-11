import { viteAddressExample, ethAddressExample, ethTxHashExample, viteTxHashExample } from '../exampleData';
import { getBalanceInfo, subscribe } from '../../utils/vitescripts';

test('getBalanceInfo', async () => {
	const balanceInfo = await getBalanceInfo(viteAddressExample);
	expect(balanceInfo.balance).toBeInstanceOf(Object);
	expect(balanceInfo.unreceived).toBeInstanceOf(Object);
});

// test('subscribe', async () => {
// 	subscribe
// });
