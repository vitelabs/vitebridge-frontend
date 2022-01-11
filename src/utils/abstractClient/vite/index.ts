import { abi, accountBlock } from '@vite/vitejs';
import { Buffer } from 'buffer/'; // note: the trailing slash is important!
import _viteAbi from './channel.json';
import offChainCode from './offChainCode';
import { viteClient } from '../../vitescripts';
import { VB } from '../../vb';

export class ChannelVite {
	viteProvider: typeof viteClient;
	viteChannelAddress: string;

	vbInstance: VB;
	viteChannelAbi: any[];
	viteOffChainCode: any;
	tokenId: string;

	constructor(config: { vbInstance: VB; address: string; tokenId: string }) {
		this.vbInstance = config.vbInstance;
		this.viteChannelAbi = _viteAbi;
		this.viteOffChainCode = Buffer.from(offChainCode, 'hex').toString('base64');
		this.viteProvider = viteClient;
		this.viteChannelAddress = config.address;
		this.tokenId = config.tokenId;
	}

	// async scanInputEvents(fromHeight: string) {
	// 	console.log('vite', 'scan input events', fromHeight);
	// 	return this.scanEvents(fromHeight, 'Input');
	// }

	// async scanInputProvedEvents(fromHeight: string) {
	// 	console.log('vite', 'scan proved events', fromHeight);
	// 	return this.scanEvents(fromHeight, 'InputProved');
	// }

	// async scanEvents(fromHeight: string, eventName: string) {
	// 	const channelAddress = this.viteChannelAddress;
	// 	const heightRange = {
	// 		[channelAddress]: {
	// 			fromHeight: (BigInt(fromHeight) + BigInt(1)).toString(),
	// 			toHeight: '0',
	// 		},
	// 	};
	// 	// console.log(JSON.stringify(heightRange));
	// 	const vmLogs = await this.viteProvider.request('ledger_getVmLogsByFilter', { addressHeightRange: heightRange });

	// 	if (!vmLogs) {
	// 		return {
	// 			toHeight: fromHeight,
	// 			events: [],
	// 		};
	// 	}
	// 	const eventAbi = this.viteChannelAbi.find(
	// 		(item: { name: string; type: string }) => item.type === 'event' && item.name === eventName
	// 	);

	// 	const events = vmLogs.filter((x: any) => this.encodeLogId(eventAbi) === x.vmlog.topics[0]);

	// 	if (!events || events.length === 0) {
	// 		return { toHeight: fromHeight, events: [] };
	// 	}

	// 	return {
	// 		toHeight: fromHeight,
	// 		events: events.map((input: any) => {
	// 			const event: any = this.decodeEvent(input.vmlog, this.viteChannelAbi, eventName);
	// 			return {
	// 				event: event,
	// 				height: input.accountBlockHeight,
	// 				hash: input.accountBlockHash,
	// 			};
	// 		}),
	// 	};
	// }

	// decodeEvent(log: any, channelAbi: Array<{ name: string; type: string }>, name: string) {
	// 	const result = abi.decodeLog(
	// 		channelAbi,
	// 		Buffer.from(log.data ? log.data : '', 'base64').toString('hex'),
	// 		log.topics.slice(1, log.topics.length),
	// 		name
	// 	);
	// 	return Object.assign(result, { name: name });
	// }

	// decodeLog(log: any, channelAbi: Array<{ name: string; type: string }>) {
	// 	// console.log(JSON.stringify(log));
	// 	// console.log(JSON.stringify(channelAbi));
	// 	// console.log(log, log['topics'], log['topics'][0]);
	// 	const abiItem = channelAbi.find((item) => this.encodeLogId(item) === log.topics[0]);

	// 	// console.log(abiItem);
	// 	const result = abi.decodeLog(
	// 		channelAbi,
	// 		Buffer.from(log.data ? log.data : '', 'base64').toString('hex'),
	// 		log.topics.slice(1, log.topics.length),
	// 		abiItem?.name
	// 	);
	// 	return Object.assign(result, { name: abiItem?.name });
	// }

	// encodeLogId(item: { name: string; type: string }) {
	// 	let id = '';
	// 	if (item.type === 'function') {
	// 		id = abi.encodeFunctionSignature(item);
	// 	} else if (item.type === 'event') {
	// 		id = abi.encodeLogSignature(item);
	// 	}
	// 	return id;
	// }

	async input(address: string, value: string) {
		const methodName = 'input';
		const methodAbi = this.viteChannelAbi.find((x) => x.name === methodName && x.type === 'function');
		if (!methodAbi) {
			throw new Error(`method not found: ${methodName}`);
		}

		const block = await accountBlock.createAccountBlock('callContract', {
			address: this.vbInstance.accounts[0],
			abi: methodAbi,
			toAddress: this.viteChannelAddress,
			params: [address, value],
			tokenId: this.tokenId,
			amount: value,
		}).accountBlock;

		return this.vbInstance.sendVbTx({
			block,
			abi,
		});
	}

	// async inputIndex() {
	// 	return readContract(
	// 		this.viteProvider,
	// 		this.viteChannelAddress,
	// 		this.viteChannelAbi,
	// 		this.viteOffChainCode,
	// 		'inputIndex',
	// 		[]
	// 	);
	// }

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

	// async outputIndex() {
	// 	return readContract(
	// 		this.viteProvider,
	// 		this.viteChannelAddress,
	// 		this.viteChannelAbi,
	// 		this.viteOffChainCode,
	// 		'outputIndex',
	// 		[]
	// 	);
	// }

	// async prevOutputId() {
	// 	return readContract(
	// 		this.viteProvider,
	// 		this.viteChannelAddress,
	// 		this.viteChannelAbi,
	// 		this.viteOffChainCode,
	// 		'prevOutputId',
	// 		[]
	// 	);
	// }

	// async approvedCnt(id: string) {
	// 	return readContract(
	// 		this.viteProvider,
	// 		this.viteChannelAddress,
	// 		this.viteChannelAbi,
	// 		this.viteOffChainCode,
	// 		'approvedCnt',
	// 		[id]
	// 	);
	// }

	// async approvedKeepers(id: string, address: string) {
	// 	return readContract(
	// 		this.viteProvider,
	// 		this.viteChannelAddress,
	// 		this.viteChannelAbi,
	// 		this.viteOffChainCode,
	// 		'approvedKeepers',
	// 		[id, address]
	// 	);
	// }
}

async function readContract(
	provider: any,
	to: string,
	abi: Array<{ name: string; type: string }>,
	code: any,
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
