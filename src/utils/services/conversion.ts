import { Contract, ethers } from 'ethers';
import { NetworkTypes } from '../types';

// // https://github.com/vitelabs/vite-asset-bridge/blob/master/bridge-eth/scripts_deploy/4input_query.js
// export const readEthToViteInputTx = async (
// 	ethersProvider: ethers.providers.Web3Provider,
// 	txHash: string,
// 	contractAddress: string
// ) => {
// 	console.log('txHash:', txHash);
// 	const tx = await ethersProvider.getTransaction(txHash);
// 	console.log('tx:', tx);
// 	if (tx) {
// 		// const currentNumber = await ethersProvider.getBlockNumber();
// 		// console.log('confirmed number:', currentNumber - tx.blockNumber!);
// 		const events = await ethersProvider!.getLogs({
// 			fromBlock: tx.blockNumber,
// 			toBlock: tx.blockNumber,
// 			address: contractAddress,
// 			topics: [
// 				ethers.utils.id('Input(uint256,uint256,bytes32,bytes,uint256,address)'),
// 			],
// 		});
// 		if (events && events.length > 0) {
// 			console.log(events);
// 			console.log(events[0]);
// 			// console.log(
// 			// 	`channelId:${events[0].args.channelId.toString()}, inputHash:${
// 			// 		events[0].args.inputHash
// 			// 	}, inputId:${events[0].args.index.toString()}`
// 			// );

// 			// You can also pull in your JSON ABI; I'm not sure of the structure inside artifacts
// 			let abi = [
// 				'event Input(uint256 channelId, uint256 index, bytes32 inputHash, bytes dest, uint256 value, address from)',
// 			];
// 			let iface = new ethers.utils.Interface(abi);
// 			let parsedEvents = events.map((log) => iface.parseLog(log));
// 			console.log('parsedEvents:', parsedEvents);
// 		}
// 	}
// };

// // const parseEventLogs = (arr: any[]) => {

// // }

// // https://github.com/vitelabs/vite-asset-bridge/blob/master/bridge-vite/scripts_deploy/3output_query.ts
// export const readEthToViteOutputTx = async () => {
// 	const provider = vuilder.newProvider(config.http);
// 	const deployer = vuilder.newAccount(config.deployer, 0, provider);
// 	const compiledContracts = await vuilder.compile('Vault.solpp');
// 	expect(compiledContracts).to.have.property('Vault');
// 	// deploy
// 	const vault = compiledContracts.Vault;
// 	vault.setDeployer(deployer).setProvider(provider);
// 	await vault.attach(contractCfg.vault);
// 	expect(vault.address).to.be.a('string');
// 	const block = await provider.request(
// 		'ledger_getLatestAccountBlock',
// 		contractCfg.vault
// 	);
// 	const output = {
// 		channelId: 0,
// 		outputHash:
// 			'0x9df3caa84eee27c5785fc2a9b5cc5295154231968f683a32c99a13ff73fa49f6',
// 		outputId: 1,
// 	};
// 	const channel = await vault.query('channels', [output.channelId]);
// 	if (+channel[2].toString() >= output.outputId) {
// 		const event = await scanOutputBlock(
// 			vault,
// 			+block.height - 10 < 0 ? 1 : +block.height - 10,
// 			output.outputHash.replace('0x', '')
// 		);
// 		if (event) {
// 			const block = await provider.request(
// 				'ledger_getAccountBlockByHash',
// 				event.accountBlockHash
// 			);
// 			console.log('confirmations:', block.confirmations);
// 		}
// 	}
// 	return;
// };

// async function scanOutputBlock(vault: any, height: number, outputHash: string) {
// 	const events = await vault.getPastEvents('Output', {
// 		fromHeight: height.toString(),
// 		toHeight: '0',
// 	});

// 	//   console.log("events", events);
// 	for (let i = 0; i < events.length; i++) {
// 		if (events[i].returnValues['outputHash'] === outputHash) {
// 			return events[i];
// 		}
// 	}
// 	return undefined;
// }

// // https://github.com/vitelabs/vite-asset-bridge/blob/master/bridge-vite/scripts_deploy/3input_query.ts
// export const readViteToEthInputTx = async () => {
// 	const provider = vuilder.newProvider(config.http);
// 	const deployer = vuilder.newAccount(config.deployer, 0, provider);
// 	const compiledContracts = await vuilder.compile('Vault.solpp');
// 	expect(compiledContracts).to.have.property('Vault');
// 	// deploy
// 	const vault = compiledContracts.Vault;
// 	vault.setDeployer(deployer).setProvider(provider);
// 	await vault.attach(contractCfg.vault);
// 	expect(vault.address).to.be.a('string');
// 	const txHash =
// 		'222f301a96e0e9248ab14f9877736d7c1c3b4a5a9e3ac1bb219c05c419bf85aa';
// 	const block = await provider.request('ledger_getAccountBlockByHash', txHash);
// 	if (block.receiveBlockHash) {
// 		const receivedBlock = await provider.request(
// 			'ledger_getAccountBlockByHash',
// 			block.receiveBlockHash
// 		);
// 		const events = await vault.getPastEvents('Input', {
// 			fromHeight: receivedBlock.height.toString(),
// 			toHeight: '0',
// 		});
// 		if (events && events.length > 0) {
// 			console.log('channelId:', events[0].returnValues.channelId);
// 			console.log('inputId:', events[0].returnValues.index);
// 			console.log('inputHash:', events[0].returnValues.inputHash);
// 		}
// 		console.log('confirmations:', receivedBlock.confirmations);
// 	}
// 	return;
// };

// // https://github.com/vitelabs/vite-asset-bridge/blob/master/bridge-eth/scripts_deploy/4output_query.js
// export const readViteToEthOutputTx = async () => {
// 	// @ts-ignore
// 	const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
// 	const vault = await attach('Vault', vaultCfg.vault);
// 	const output = {
// 		ethChannelId: 1,
// 		outputHash:
// 			'0x' + 'ea509329d12c46c102b782735d10edc490a4e148576fe1c3a5c3a0bee0344648',
// 		outputId: 1,
// 	};
// 	const currentNumber = await ethersProvider.getBlockNumber();
// 	// console.log("confirmed number:", currentNumber - tx.blockNumber);
// 	const events = await vault.queryFilter(
// 		vault.filters.Output(null, null, null, null, null),
// 		currentNumber - 1000,
// 		currentNumber
// 	);
// 	if (events && events.length > 0) {
// 		const target = events.filter((x) => {
// 			console.log(x.args.outputHash === output.outputHash);
// 			return x.args.outputHash === output.outputHash;
// 		});
// 		console.log('confirmations:', currentNumber - target[0].blockNumber);
// 		// console.log("confirmed number:", currentNumber - tx.blockNumber);
// 	}
// 	// console.log(tx);
// };
