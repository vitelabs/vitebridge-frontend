import { abi, accountBlock } from '@vite/vitejs';
import { Buffer } from 'buffer/'; // note: the trailing slash is important!
import _viteAbi from './channel.json';
import offChainCode from './offChainCode';
import { viteClient } from '../../vitescripts';
import { VB } from '../../vb';

export class ChannelVite {
	viteProvider: typeof viteClient;
	viteChannelAddress: string;

	vcInstance: VB;
	viteChannelAbi: any[];
	viteOffChainCode: any;
	tokenId: string;

	constructor(config: { vcInstance: VB; address: string; tokenId: string }) {
		this.vcInstance = config.vcInstance;
		this.viteChannelAbi = _viteAbi;
		this.viteOffChainCode = Buffer.from(offChainCode, 'hex').toString('base64');
		this.viteProvider = viteClient;
		this.viteChannelAddress = config.address;
		this.tokenId = config.tokenId;
	}

	async input(address: string, value: string) {
		const methodName = 'input';
		const methodAbi = this.viteChannelAbi.find((x) => x.name === methodName && x.type === 'function');
		if (!methodAbi) {
			throw new Error(`method not found: ${methodName}`);
		}

		const block = await accountBlock.createAccountBlock('callContract', {
			address: this.vcInstance.accounts[0],
			abi: methodAbi,
			toAddress: this.viteChannelAddress,
			params: [address, value],
			tokenId: this.tokenId,
			amount: value,
		}).accountBlock;

		return this.vcInstance.sendVbTx({
			block,
			abi,
		});
	}

	async prevInputId() {
		return readContract(
			this.viteProvider,
			this.viteChannelAddress,
			this.viteChannelAbi,
			this.viteOffChainCode,
			'prevInputId',
			[]
		);
	}
}

async function readContract(
	provider: typeof viteClient,
	to: string,
	abi: Array<{ name: string; type: string }>,
	code: string,
	methodName: string,
	params: any[]
) {
	const methodAbi = abi.find((x) => x.type === 'offchain' && x.name === methodName);
	if (!methodAbi) {
		throw new Error(`method not found:${methodName}`);
	}

	return provider.callOffChainContract({
		address: to,
		abi: methodAbi,
		code: code,
		params: params,
	});
}
