import { accountBlock, utils } from '@vite/vitejs';
import _viteAbi from './channel.vite.abi.json';
import offChainCode from './offChainCode';
import { VC } from '../../viteConnect';
import { Transaction as ViteTransaction } from '@vite/vitejs/distSrc/accountBlock/type';
// TODO: use the right type

export class ViteChannel {
	viteChannelAddress: string;
	vpAddress?: string;
	vcInstance?: VC;
	viteChannelAbi: any[];
	viteOffChainCode: any;
	tokenId: string;

	constructor(config: { vpAddress?: string; vcInstance?: VC; address: string; tokenId: string }) {
		if (!config.vpAddress && !config.vcInstance) {
			throw new Error('config.vpAddress or config.vcInstance must be provided');
		}

		this.vpAddress = config.vpAddress;
		this.vcInstance = config.vcInstance;
		this.viteChannelAbi = _viteAbi;
		this.viteOffChainCode = utils._Buffer.from(offChainCode, 'hex').toString('base64');
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

		const params = [
			'callContract',
			{
				address: this.vpAddress || this.vcInstance!.accounts[0],
				abi: methodAbi,
				toAddress: this.viteChannelAddress,
				params: [channelId, address, value],
				tokenId: this.tokenId,
				amount: value,
			},
		] as const;

		if (this.vcInstance) {
			const block = await accountBlock.createAccountBlock(...params).accountBlock;
			return this.vcInstance.signAndSendTx([{ block }]) as Promise<ViteTransaction>;
		}
		return (await window.vitePassport!.writeAccountBlock(...params)).block;
	}
}
