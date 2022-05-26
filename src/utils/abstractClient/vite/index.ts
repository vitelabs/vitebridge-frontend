import { accountBlock } from '@vite/vitejs';
import { Buffer } from 'buffer/'; // note: the trailing slash is important!
import _viteAbi from './channel.vite.abi.json';
import offChainCode from './offChainCode';
import { VC } from '../../viteConnect';
import { ViteAPI } from '@vite/vitejs/distSrc/viteAPI/type';

export class ViteChannel {
	viteChannelAddress: string;
	vcInstance: VC;
	viteChannelAbi: any[];
	viteOffChainCode: any;
	tokenId: string;

	constructor(config: { vcInstance: VC; address: string; tokenId: string }) {
		this.vcInstance = config.vcInstance;
		this.viteChannelAbi = _viteAbi;
		this.viteOffChainCode = Buffer.from(offChainCode, 'hex').toString('base64');
		this.viteChannelAddress = config.address;
		this.tokenId = config.tokenId;
	}

	async input(channelId: number, address: string, value: string) {
		console.log('channelId:', channelId);
		console.log('address:', address);
		console.log('value:', value);
		const methodName = 'input';
		const methodAbi = this.viteChannelAbi.find(
			(x) => x.name === methodName && x.type === 'function'
		);
		if (!methodAbi) {
			throw new Error(`method not found: ${methodName}`);
		}

		const block = await accountBlock.createAccountBlock('callContract', {
			address: this.vcInstance.accounts[0],
			abi: methodAbi,
			toAddress: this.viteChannelAddress,
			params: [channelId, address, value],
			tokenId: this.tokenId,
			amount: value,
		}).accountBlock;

		return this.vcInstance.signAndSendTx([{ block }]);
	}

	async prevInputId(viteApi: ViteAPI) {
		return readContract(
			viteApi,
			this.viteChannelAddress,
			this.viteChannelAbi,
			this.viteOffChainCode,
			'prevInputId',
			[]
		);
	}
}

async function readContract(
	viteApi: ViteAPI,
	to: string,
	abi: Array<{ name: string; type: string }>,
	code: string,
	methodName: string,
	params: any[]
) {
	const methodAbi = abi.find(
		(x) => x.type === 'offchain' && x.name === methodName
	);
	if (!methodAbi) {
		throw new Error(`method not found: ${methodName}`);
	}

	return viteApi.callOffChainContract({
		address: to,
		abi: methodAbi,
		code: code,
		params: params,
	});
}
