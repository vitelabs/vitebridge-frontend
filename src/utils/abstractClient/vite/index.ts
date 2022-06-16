import { accountBlock } from '@vite/vitejs';
import { Buffer } from 'buffer/'; // note: the trailing slash is important!
import _viteAbi from './channel.vite.abi.json';
import offChainCode from './offChainCode';
import { VC } from '../../viteConnect';
import { Transaction as ViteTransaction } from '@vite/vitejs/distSrc/accountBlock/type';

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

		return this.vcInstance.signAndSendTx([{ block }]) as Promise<ViteTransaction>;
	}
}
