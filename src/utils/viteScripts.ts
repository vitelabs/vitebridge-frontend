import { abi as abiUtil, utils } from '@vite/vitejs';
import { ViteAPI } from '@vite/vitejs/distSrc/utils/type';

export const getPastEvents = async (
	viteApi: ViteAPI,
	contractAddress: string,
	contractAbi: any[],
	eventName: string = 'allEvents',
	{
		fromHeight = 0,
		toHeight = 0,
	}: {
		filter?: Object;
		fromHeight?: Number;
		toHeight?: Number;
	}
) => {
	let result: any[] = [];
	let logs = await viteApi.request('ledger_getVmLogsByFilter', {
		addressHeightRange: {
			[contractAddress!]: {
				fromHeight: fromHeight.toString(),
				toHeight: toHeight.toString(),
			},
		},
	});
	const filteredAbi =
		eventName === 'allEvents'
			? contractAbi
			: contractAbi.filter((a: any) => {
					return a.name === eventName;
			  });
	if (logs) {
		for (let log of logs) {
			let vmLog = log.vmlog;
			let topics = vmLog.topics;
			for (let abiItem of filteredAbi) {
				let signature = abiUtil.encodeLogSignature(abiItem);
				if (abiItem.type === 'event' && signature === topics[0]) {
					let dataHex;
					if (vmLog.data) {
						dataHex = utils._Buffer.from(vmLog.data, 'base64').toString('hex');
					}
					let returnValues = abiUtil.decodeLog(abiItem, dataHex, topics);
					let item = {
						returnValues: returnValues,
						event: abiItem.name,
						raw: {
							data: dataHex,
							topics: topics,
						},
						signature: signature,
						accountBlockHeight: log.accountBlockHeight,
						accountBlockHash: log.accountBlockHash,
						address: log.address,
					};
					result.push(item);
					break;
				}
			}
		}
	}
	return result;
};

export const query = async (
	viteApi: ViteAPI,
	abi: any[],
	address: string,
	methodName: string,
	params: any[]
) => {
	const methodAbi = abi.find((x: { name: string }) => {
		return x.name === methodName;
	});
	if (!methodAbi) {
		throw new Error('method not found:' + methodName);
	}

	let data = abiUtil.encodeFunctionCall(methodAbi, params);
	let dataBase64 = utils._Buffer.from(data, 'hex').toString('base64');
	while (true) {
		let result = await viteApi.request('contract_query', {
			address,
			data: dataBase64,
		});

		// parse result
		if (result) {
			let resultBytes = utils._Buffer.from(result, 'base64').toString('hex');
			let outputs = [];
			for (let i = 0; i < methodAbi.outputs.length; i++) {
				outputs.push(methodAbi.outputs[i].type);
			}
			return abiUtil.decodeParameters(outputs, resultBytes);
		}
		console.log('Query failed, try again.');
		await new Promise((res) => setTimeout(res, 500));
	}
};
