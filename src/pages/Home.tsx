import { useCallback, useEffect, useMemo, useState } from 'react';
import { wallet, constant } from '@vite/vitejs';
import { ethers } from 'ethers';
import Picker from '../components/Picker';
import { allNetworks, channelCombos, PROD, viteBridgeAssets } from '../utils/constants';
import { connect } from '../utils/globalContext';
import { useTitle } from '../utils/hooks';
import { BridgeTransaction, State } from '../utils/types';
import transImageSrc from '../assets/trans.png';
import vcConfirmImageSrc from '../assets/vc_confirm.png';
import vcConfirmDarkImageSrc from '../assets/vc_confirm.dark.png';
import ConnectWalletButton from '../containers/ConnectWalletButton';
import {
	copyToClipboardAsync,
	roundDownTo6Decimals,
	shortenAddress,
	shortenHash,
	toSmallestUnit,
} from '../utils/strings';
import NumericalInput from '../components/NumericalInput';
import TextInput from '../components/TextInput';
import IconCircle from '../components/IconCircle';
import Logout from '../assets/Logout';
import Link from '../assets/Link';
import ExternalLink from '../assets/ExternalLink';
import A from '../components/A';
import Modal from '../components/Modal';
import Checkbox from '../components/Checkbox';
import { isDarkMode } from '../utils/misc';
import { ViteChannel } from '../utils/abstractClient/vite';
import erc20Abi from '../utils/abstractClient/erc20/erc20.json';
import channelAbi from '../utils/abstractClient/erc20/channel.ether.abi.json';
import Check from '../assets/Check';
import PendingDots from '../components/PendingDots';
import { getViteTokenBalance, metaMaskIsSupported } from '../utils/wallet';
import Duplicate from '../assets/Duplicate';
import { Transaction as ViteTransaction } from '@vite/vitejs/distSrc/accountBlock/type';
import { getPastEvents, query } from '../utils/viteScripts';
import { AccountBlockType } from '@vite/vitejs/distSrc/utils/type';

const sleep = (ms = 0): Promise<void> => new Promise((res) => setTimeout(() => res(), ms));
let bridgeTxStatusModalOpen = false;

const Home = ({
	setState,
	viteApi,
	i18n,
	metamaskAddress,
	vcInstance,
	vpAddress,
	viteBalanceInfo,
	activeViteAddress,
	networkType,
}: State) => {
	useTitle('');
	const [assetIndex, assetIndexSet] = useState(0);
	const [confirmingBridgeTx, confirmingBridgeTxSet] = useState(false);
	const [confirmingViteConnect, confirmingViteConnectSet] = useState(false);
	const [transactionConfirmationStatusOpen, transactionConfirmationStatusOpenSet] = useState(false);
	const [fromNetworkIndex, fromNetworkIndexSet] = useState(0);
	const [toNetworkIndex, toNetworkIndexSet] = useState(0);
	const [destinationAddress, destinationAddressSet] = useState('');
	const [amount, amountSet] = useState(PROD ? '' : '0.01'); // saves time during development
	const [agreesToTerms, agreesToTermsSet] = useState(false);
	const [bridgeTransaction, bridgeTransactionSet] = useState<Partial<BridgeTransaction> | null>(
		null
	);
	const [walletPromptLoading, walletPromptLoadingSet] = useState(false);
	const [metaMaskChainId, metaMaskChainIdSet] = useState(
		metaMaskIsSupported() ? window.ethereum?.chainId : ''
	);
	const [metaMaskNativeAssetBalance, metaMaskNativeAssetBalanceSet] = useState<string>();
	const [metaMaskFromAssetBalance, metaMaskFromAssetBalanceSet] = useState<string>();

	const asset = useMemo(() => viteBridgeAssets.tokens[assetIndex], [assetIndex]);
	const networks = useMemo(() => {
		const flattenedChannels = asset.channels.flat();
		const flattenedNetworks = flattenedChannels.map((o) => o.network);
		return flattenedChannels
			.filter(({ network }, i) => !flattenedNetworks.includes(network, i + 1))
			.map(({ icon, desc }) => ({ icon, label: desc }))
			.sort((a, b) =>
				a.label.includes('Vite') ? -1 : b.label.includes('Vite') ? 1 : a.label < b.label ? -1 : 1
			);
	}, [asset.channels]);
	const fromNetworkOptions = useMemo(() => {
		// Show all possible networks.
		// If it's incompatible with the toNetwork, reset it to something that is compatible.
		return networks;
	}, [networks]);
	const fromNetwork = useMemo(
		() => fromNetworkOptions[fromNetworkIndex],
		[fromNetworkOptions, fromNetworkIndex]
	);
	const toNetworkOptions = useMemo(() => {
		return networks.filter((network) => {
			return channelCombos[asset.token][fromNetwork.label].includes(network.label);
		});
	}, [asset.token, fromNetwork.label, networks]);
	const toNetwork = useMemo(
		() => toNetworkOptions[toNetworkIndex],
		[toNetworkOptions, toNetworkIndex]
	);
	const selectedChannel = useMemo(() => {
		return asset.channels.find(
			(channel) =>
				(channel[0].desc === fromNetwork.label || channel[1].desc === fromNetwork.label) &&
				(channel[0].desc === toNetwork.label || channel[1].desc === toNetwork.label)
		)!;
	}, [asset.channels, fromNetwork, toNetwork]);
	const channelFrom = useMemo(() => {
		return selectedChannel.find(
			(side) => side.desc === fromNetworkOptions[fromNetworkIndex].label
		)!;
	}, [selectedChannel, fromNetworkOptions, fromNetworkIndex]);
	const channelTo = useMemo(() => {
		return selectedChannel.find((side) => side.desc === toNetworkOptions[toNetworkIndex].label)!;
	}, [selectedChannel, toNetworkOptions, toNetworkIndex]);
	const channelFromId = useMemo(() => {
		return channelFrom.channelId;
	}, [channelFrom]);
	const fromAddress = useMemo(
		() => (channelFrom.network === 'VITE' ? activeViteAddress : metamaskAddress) || '',
		[channelFrom, activeViteAddress, metamaskAddress]
	);
	const metaMaskWalletToShow = useMemo(() => {
		const network = channelFrom.network === 'VITE' ? channelTo.network : channelFrom.network;
		if (network === 'VITE') throw new Error('frontend error');
		return network;
	}, [channelFrom, channelTo]);
	const minAmount = useMemo(() => +(channelFrom.min || 0), [channelFrom]);
	const maxAmount = useMemo(() => +(channelFrom.max || 0), [channelFrom]);
	const fromWallet = useMemo(
		() => (channelFrom.network === 'VITE' ? 'Vite Wallet' : 'MetaMask'),
		[channelFrom]
	);
	const toWallet = useMemo(
		() => (channelTo.network === 'VITE' ? 'Vite Wallet' : 'MetaMask'),
		[channelTo]
	);
	const metaMaskNetworkMatchesFromNetwork = useMemo(
		() => metaMaskChainId === allNetworks[networkType][channelFrom.network].chainId,
		[metaMaskChainId, channelFrom, networkType]
	);
	const metaMaskNetworkMatchesToNetwork = useMemo(
		() => metaMaskChainId === allNetworks[networkType][channelTo.network].chainId,
		[metaMaskChainId, channelTo, networkType]
	);
	const fromAssetBalance = useMemo(() => {
		if (!metaMaskNetworkMatchesFromNetwork && fromWallet === 'MetaMask') {
			return '';
		}
		if (channelFrom) {
			let balance;
			if (viteBalanceInfo && channelFrom.network === 'VITE') {
				balance = getViteTokenBalance(viteBalanceInfo, channelFrom.tokenId!);
			} else {
				balance = metaMaskFromAssetBalance;
			}
			if (balance) {
				return roundDownTo6Decimals(balance);
			}
		}
		return '';
	}, [
		fromWallet,
		metaMaskFromAssetBalance,
		metaMaskNetworkMatchesFromNetwork,
		viteBalanceInfo,
		channelFrom,
	]);
	const fromAssetBalanceIsBelowInputAmount = useMemo(() => {
		return +fromAssetBalance < +amount;
	}, [fromAssetBalance, amount]);
	const fromWalletConnected = useMemo(() => {
		if (fromWallet === 'Vite Wallet') {
			return !!activeViteAddress;
		} else {
			return !!metamaskAddress;
		}
	}, [fromWallet, activeViteAddress, metamaskAddress]);
	const progressPercentage = useMemo(() => {
		let stepsCompleted = 0;
		if (fromWalletConnected) {
			stepsCompleted++;
		}
		if (bridgeTransaction?.fromHash) {
			stepsCompleted++;
		}
		if (
			(bridgeTransaction?.fromHashConfirmationNums || 0) >= channelFrom.confirmedThreshold &&
			(bridgeTransaction?.toHashConfirmationNums || 0) >= channelTo.confirmedThreshold
		) {
			stepsCompleted++;
		}
		return (stepsCompleted / 3) * 100;
	}, [fromWalletConnected, channelFrom, channelTo, bridgeTransaction]);
	const channelFromEthersProvider = useMemo(() => {
		if (
			channelFrom.network !== 'VITE' &&
			allNetworks[networkType][channelFrom.network].chainId === metaMaskChainId
		) {
			return new ethers.providers.Web3Provider(window.ethereum);
		}
	}, [networkType, channelFrom, metaMaskChainId]);
	const channelToEthersProvider = useMemo(() => {
		// don't really have to check metaMaskChainId. Just need the provider to refresh when the MetaMask network changes
		if (channelTo.network !== 'VITE' && metaMaskChainId) {
			return new ethers.providers.Web3Provider(window.ethereum);
		}
	}, [metaMaskChainId, channelTo]);
	const channelFromERC20Contract = useMemo(() => {
		if (channelFrom.erc20 && channelFromEthersProvider) {
			return new ethers.Contract(
				channelFrom.erc20,
				erc20Abi,
				channelFromEthersProvider.getSigner(metamaskAddress)
			);
		}
	}, [channelFrom, channelFromEthersProvider, metamaskAddress]);

	const copyWithToast = useCallback(
		(text = '') => {
			copyToClipboardAsync(text);
			setState({ toast: i18n.successfullyCopied });
		},
		[setState, i18n]
	);

	const openBridgeConfirmationModal = useCallback(async () => {
		const num = +amount;
		if (num < minAmount || num > maxAmount) {
			return setState({ toast: i18n.illegalAmount });
		}
		if (
			((channelTo.network === 'BSC' || channelTo.network === 'ETH') &&
				!ethers.utils.isAddress(destinationAddress)) ||
			(channelTo.network === 'VITE' && !wallet.isValidAddress(destinationAddress))
		) {
			return setState({ toast: i18n.illegalAddress });
		}
		confirmingBridgeTxSet(true);
		agreesToTermsSet(!PROD); // saves time during development
		walletPromptLoadingSet(false);
	}, [amount, channelTo, destinationAddress, i18n, maxAmount, minAmount, setState]);

	const startBridgeTransaction = useCallback(async () => {
		if (fromWallet === 'MetaMask' && !metaMaskNetworkMatchesFromNetwork) {
			return setState({
				toast: i18n.switchTheNetworkInYourMetaMaskWalletSoThatItMatchesTheFromNetwork,
			});
		}
		if (toWallet === 'MetaMask' && !metaMaskNetworkMatchesToNetwork) {
			return setState({
				toast: i18n.switchTheNetworkInYourMetaMaskWalletSoThatItMatchesTheToNetwork,
			});
		}

		if (channelFrom.network === 'VITE' && vpAddress) {
			const activeViteNetwork = await window.vitePassport!.getNetwork();
			if (networkType === 'testnet') {
				if (
					activeViteNetwork.rpcUrl !== 'wss://buidl.vite.net/gvite/ws' &&
					activeViteNetwork.rpcUrl !== 'https://buidl.vite.net/gvite'
				) {
					return setState({ toast: i18n.switchVitePassportNetworkToTestnet });
				}
			} else if (
				activeViteNetwork.rpcUrl !== 'wss://node.vite.net/gvite/ws' &&
				activeViteNetwork.rpcUrl !== 'https://node.vite.net/gvite'
			) {
				return setState({ toast: i18n.switchVitePassportNetworkToMainnet });
			}
		}

		// TODO: No way to check network on Vite Wallet app via ViteConnect?

		bridgeTransactionSet(null);
		walletPromptLoadingSet(true);

		let ethToViteInputTx!: ethers.providers.TransactionResponse;
		let ethToViteOutputSendTx: ViteTransaction; // | ethers.providers.TransactionResponse;
		let viteToEthInputReceiveTx!: ViteTransaction;
		let viteToEthOutputTxHash: string;
		let ethToViteOutputHash: string;
		try {
			const amountInSmallestUnit = toSmallestUnit(amount, channelFrom.decimals);
			if (fromWallet === 'MetaMask') {
				// TODO: come up with better names for allowance and approved
				if (channelFromERC20Contract) {
					const allowance = await channelFromERC20Contract.allowance(
						fromAddress,
						channelFrom.contract
					);
					// https://ethereum.org/hr/developers/tutorials/erc20-annotated-code/
					const approved = +allowance.toString() >= +amountInSmallestUnit;
					if (!approved) {
						await channelFromERC20Contract.approve(channelFrom.contract, amountInSmallestUnit);
					}
				}
				const ethChannel = new ethers.Contract(
					channelFrom.contract,
					channelAbi,
					channelFromEthersProvider!.getSigner(metamaskAddress)
				);
				const originAddr = `0x${wallet.getOriginalAddressFromAddress(destinationAddress)}`;
				ethToViteInputTx = await ethChannel.input(channelFromId, originAddr, amountInSmallestUnit, {
					// https://github.com/MetaMask/metamask-extension/issues/7286#issuecomment-557838325
					gasLimit: 1000000,
					value: channelFromERC20Contract ? 0 : amountInSmallestUnit,
				});
				confirmingBridgeTxSet(false);
				confirmingViteConnectSet(false);
				transactionConfirmationStatusOpenSet(true);
				bridgeTxStatusModalOpen = true;
				walletPromptLoadingSet(false);
				while (true) {
					ethToViteInputTx = await channelFromEthersProvider!.getTransaction(ethToViteInputTx.hash);
					if (ethToViteInputTx.blockNumber) break;
					await sleep(5000);
				}
				const events = await channelFromEthersProvider!.getLogs({
					fromBlock: ethToViteInputTx.blockNumber,
					toBlock: ethToViteInputTx.blockNumber,
					address: channelFrom.contract,
					topics: [ethers.utils.id('Input(uint256,uint256,bytes32,bytes,uint256,address)')],
				});
				const abi = [
					'event Input(uint256 channelId, uint256 index, bytes32 inputHash, bytes dest, uint256 value, address from)',
				];
				const iface = new ethers.utils.Interface(abi);
				const parsedEvents = events.map((log) => iface.parseLog(log));
				ethToViteOutputHash = parsedEvents[0].args.inputHash;
			} else {
				const viteChannel = new ViteChannel({
					vpAddress,
					vcInstance,
					address: channelFrom.contract,
					tokenId: channelFrom.tokenId!,
				});
				confirmingViteConnectSet(true);
				// TODO: use the right type
				let viteToEthInputSendTx: Partial<AccountBlockType> = await viteChannel.input(
					channelFromId,
					destinationAddress,
					amountInSmallestUnit
				);
				// console.log('viteToEthInputSendTx:', viteToEthInputSendTx);
				confirmingBridgeTxSet(false);
				confirmingViteConnectSet(false);
				transactionConfirmationStatusOpenSet(true);
				bridgeTxStatusModalOpen = true;
				walletPromptLoadingSet(false);
				while (true) {
					viteToEthInputSendTx = await viteApi.request(
						'ledger_getAccountBlockByHash',
						viteToEthInputSendTx.hash
					);
					if (viteToEthInputSendTx.receiveBlockHash) break;
					await sleep(5000);
				}
				// console.log('viteToEthInputSendTx2:', viteToEthInputSendTx);
				viteToEthInputReceiveTx = await viteApi.request(
					'ledger_getAccountBlockByHash',
					viteToEthInputSendTx.receiveBlockHash
				);
				// console.log('viteToEthInputReceiveTx:', viteToEthInputReceiveTx);
				const events = await getPastEvents(viteApi, channelFrom.contract, channelAbi, 'Input', {
					fromHeight: +viteToEthInputReceiveTx.height,
					toHeight: 0,
				});
				// console.log('events:', events);
				if (events && events.length > 0) {
					viteToEthOutputTxHash = '0x' + events[0].returnValues.inputHash;
				}
			}

			const bridgeTx: Partial<BridgeTransaction> = {
				fromHash: ethToViteInputTx?.hash || viteToEthInputReceiveTx?.hash,
			};
			let fromConfirmed = false;
			let toConfirmed = false;
			while (true) {
				fromConfirmed = (bridgeTx.fromHashConfirmationNums || 0) >= channelFrom.confirmedThreshold;
				if (ethToViteInputTx!) {
					if (ethToViteInputTx.blockNumber) {
						if (!fromConfirmed) {
							const currentNumber = await channelFromEthersProvider!.getBlockNumber();
							bridgeTx.fromHashConfirmationNums = currentNumber - ethToViteInputTx.blockNumber;
						}
					}
					if (!bridgeTx.toHash) {
						ethToViteOutputSendTx = await viteApi.request(
							'ledger_getLatestAccountBlock',
							channelTo.contract
						);
						const output = {
							channelId: channelTo.channelId,
							outputHash: ethToViteOutputHash!,
							outputId: channelFrom.channelId, // NOTE: assume outputId is channelFrom.channelId
						};
						const channel = await query(viteApi, channelAbi, channelTo.contract, 'channels', [
							output.channelId + '',
						]);
						if (+channel?.[2].toString() >= output.outputId) {
							const events = await getPastEvents(
								viteApi,
								channelTo.contract,
								channelAbi,
								'Output',
								{
									fromHeight:
										+ethToViteOutputSendTx.height - 10 < 0 ? 1 : +ethToViteOutputSendTx.height - 10,
									toHeight: 0,
								}
							);
							const originalHash = output.outputHash.replace('0x', '');
							const event = events.find((e) => e.returnValues['outputHash'] === originalHash);
							if (event) {
								bridgeTx.toHash = event.accountBlockHash;
								const block = await viteApi.request(
									'ledger_getAccountBlockByHash',
									event.accountBlockHash
								);
								bridgeTx.toHashConfirmationNums = block.confirmations;
							}
						}
					} else {
						bridgeTx.toHashConfirmationNums = (
							await viteApi.request('ledger_getAccountBlockByHash', bridgeTx.toHash)
						).confirmations;
					}
				} else if (viteToEthInputReceiveTx) {
					if (!fromConfirmed) {
						viteToEthInputReceiveTx = await viteApi.request(
							'ledger_getAccountBlockByHash',
							viteToEthInputReceiveTx.hash
						);
						bridgeTx.fromHashConfirmationNums = +viteToEthInputReceiveTx.confirmations!;
					}
					// console.log('bridgeTx:', bridgeTx);
					const currentNumber = await channelToEthersProvider!.getBlockNumber();
					// console.log('currentNumber:', currentNumber);
					if (!bridgeTx.toHash) {
						const events = await channelToEthersProvider!.getLogs({
							fromBlock: currentNumber - 100,
							toBlock: currentNumber,
							address: channelTo.contract,
							topics: [ethers.utils.id('Output(uint256,uint256,bytes32,address,uint256)')],
						});
						const abi = [
							'event Output(uint256 channelId, uint256 index, bytes32 outputHash, address dest, uint256 value)',
						];
						const iface = new ethers.utils.Interface(abi);
						const parsedEvents = events.map((log) => iface.parseLog(log));
						if (parsedEvents.length) {
							const target =
								events[parsedEvents.findIndex((x) => x.args.outputHash === viteToEthOutputTxHash)];
							if (target) {
								bridgeTx.toHash = target.transactionHash;
							}
						}
						// console.log('bridgeTx2:', bridgeTx);
					} else {
						const viteToEthOutputTx = await channelToEthersProvider!.getTransaction(
							bridgeTx.toHash
						);
						if (viteToEthOutputTx?.blockNumber) {
							bridgeTx.toHashConfirmationNums = currentNumber - viteToEthOutputTx.blockNumber;
						}
					}
				}
				fromConfirmed = (bridgeTx.fromHashConfirmationNums || 0) >= channelFrom.confirmedThreshold;
				toConfirmed = (bridgeTx.toHashConfirmationNums || 0) >= channelTo.confirmedThreshold;
				bridgeTransactionSet({ ...bridgeTx });

				if ((fromConfirmed && toConfirmed) || !bridgeTxStatusModalOpen) {
					break;
				}
				await sleep(5000);
			}
			if (bridgeTxStatusModalOpen) {
				// QUESTION: Isn't the transaction technically completed when bridgeTx has a `toHash` with sufficient confirmations?
				// I've noticed the BSC network reaches its threshold a lot faster than Vite.
				setState({ toast: i18n.bridgingTransactionComplete });
			}
		} catch (e: any) {
			console.log('e:', e);
			confirmingBridgeTxSet(false);
			transactionConfirmationStatusOpenSet(false);
			walletPromptLoadingSet(false);
			confirmingViteConnectSet(false);
			if (e?.code) {
				// usually { code: 11012, message: "User Canceled" }
				// @ts-ignore
				setState({ toast: { 11012: i18n.userCanceled }[e.code] || e.message });
			} else {
				setState({ toast: e });
			}
		}
	}, [
		metaMaskNetworkMatchesToNetwork,
		metaMaskNetworkMatchesFromNetwork,
		networkType,
		vpAddress,
		channelFromId,
		i18n,
		viteApi,
		amount,
		fromWallet,
		toWallet,
		channelFromEthersProvider,
		channelToEthersProvider,
		channelFrom,
		channelTo,
		destinationAddress,
		channelFromERC20Contract,
		fromAddress,
		setState,
		metamaskAddress,
		vcInstance,
	]);

	useEffect(() => {
		if (metaMaskIsSupported()) {
			window.ethereum.on('chainChanged', (chainId: string) => {
				metaMaskChainIdSet(chainId);
				metaMaskFromAssetBalanceSet(undefined);
			});
		}
	}, []);

	useEffect(() => {
		if (channelTo.network === 'VITE') {
			destinationAddressSet(activeViteAddress || '');
		} else {
			destinationAddressSet(metamaskAddress || '');
		}
	}, [activeViteAddress, channelTo, metamaskAddress]);

	useEffect(() => {
		if (!fromAssetBalance && metamaskAddress && metaMaskNetworkMatchesFromNetwork) {
			if (channelFromERC20Contract) {
				channelFromERC20Contract
					.balanceOf(metamaskAddress)
					.then((data: ethers.BigNumber) =>
						metaMaskFromAssetBalanceSet(ethers.utils.formatUnits(data))
					)
					.catch((e: any) => {
						console.log('e:', e);
					});
			} else {
				metaMaskFromAssetBalanceSet(metaMaskNativeAssetBalance);
			}
		}
	}, [
		channelFrom,
		fromAssetBalance,
		metaMaskNetworkMatchesFromNetwork,
		channelFromERC20Contract,
		metamaskAddress,
		metaMaskNativeAssetBalance,
		setState,
		networkType,
	]);

	useEffect(() => {
		const provider = channelFromEthersProvider || channelToEthersProvider;
		if (
			provider &&
			metamaskAddress &&
			(metaMaskNetworkMatchesFromNetwork || metaMaskNetworkMatchesToNetwork)
		) {
			provider
				.getBalance(metamaskAddress)
				.then((data) => metaMaskNativeAssetBalanceSet(ethers.utils.formatEther(data)))
				.catch((e: any) => {
					console.log('e:', e);
				});
		}
	}, [
		metaMaskChainId,
		metaMaskNetworkMatchesFromNetwork,
		metaMaskNetworkMatchesToNetwork,
		channelFromEthersProvider,
		channelToEthersProvider,
		metamaskAddress,
	]);

	return (
		<div className="m-5 xy flex-col lg:flex-row lg:items-start lg:justify-center">
			<div className="flex-1 hidden lg:flex flex-col"></div>
			<div className="w-full flex flex-col min-h-[48rem] max-w-2xl py-10 rounded-sm shadow-skin-base bg-skin-middleground">
				<div className="px-10 flex-1">
					<p className="text-lg mb-5 font-semibold">{i18n.chooseAsset}</p>
					<Picker
						big
						selectedIndex={assetIndex}
						options={viteBridgeAssets.tokens.map(({ token, icon }) => ({
							icon,
							label: token,
						}))}
						onPick={(_, i) => {
							assetIndexSet(i);
							if (fromNetworkOptions[fromNetworkIndex]) {
								fromNetworkIndexSet(0);
							}
							if (toNetworkOptions[toNetworkIndex]) {
								toNetworkIndexSet(0);
							}
						}}
					/>
					<div className="xy my-9 xy gap-3">
						<div className="p-4 space-y-3 flex-1 rounded-sm shadow-skin-base bg-skin-middleground dark:bg-skin-foreground">
							<p className="text-sm font-bold">{i18n.from}</p>
							<Picker
								selectedIndex={fromNetworkIndex}
								options={fromNetworkOptions}
								onPick={({ label }, i) => {
									fromNetworkIndexSet(i);
									if (i >= channelCombos[asset.token][label].length) {
										toNetworkIndexSet(0);
									}
								}}
							/>
							<IconCircle src={channelFrom.icon} alt={channelFrom.desc} />
						</div>
						<button
							className="w-12"
							onClick={() => {
								fromNetworkIndexSet(
									Math.max(
										0,
										networks.findIndex(({ label }) => label === toNetwork.label)
									)
								);
								toNetworkIndexSet(
									Math.max(
										0,
										channelCombos[asset.token][toNetwork.label].findIndex(
											(networkLabel) => fromNetwork.label === networkLabel
										)
									)
								);
							}}
						>
							<img src={transImageSrc} alt="Flip networks" className="w-12" />
						</button>
						<div className="p-4 space-y-3 flex-1 rounded-sm shadow-skin-base bg-skin-middleground dark:bg-skin-foreground">
							<p className="text-sm font-bold">{i18n.to}</p>
							<Picker
								selectedIndex={toNetworkIndex}
								options={toNetworkOptions}
								onPick={(_, i) => toNetworkIndexSet(i)}
							/>
							<IconCircle src={channelTo.icon} alt={channelTo.desc} />
						</div>
					</div>
					{fromWalletConnected ? (
						<div className="space-y-5">
							<div>
								<div className="flex justify-between">
									<p className="text-xs font-semibold">{i18n.amount}</p>
									<div className="flex gap-4 text-xs font-normal">
										{fromAssetBalanceIsBelowInputAmount &&
											fromAssetBalance &&
											(fromWallet === 'MetaMask'
												? metaMaskNetworkMatchesFromNetwork || metaMaskNetworkMatchesToNetwork
												: true) && <p className="text-red-500">{i18n.insufficientBalance}</p>}
										<p>
											{i18n.balance} :{' '}
											{metaMaskNetworkMatchesFromNetwork || fromWallet === 'Vite Wallet'
												? fromAssetBalance || '...'
												: i18n.metaMaskNetworkDoesNotMatch}
										</p>
									</div>
								</div>
								<div className="mt-3 border border-skin-muted dark:border-none bg-skin-input text-sm flex items-center rounded-sm">
									<NumericalInput
										value={amount}
										onUserInput={(v) => amountSet(v.trim())}
										className="flex-1 pl-3 py-1"
										maxDecimals={18}
									/>
									<button
										className="px-3"
										onClick={() => fromAssetBalance && amountSet(fromAssetBalance)}
									>
										<p className="leading-4 text-skin-highlight border-b border-b-skin-highlight border-dashed">
											{i18n.all}
										</p>
									</button>
								</div>
							</div>
							<div>
								<p className="mb-3 text-xs font-semibold">{i18n.destinationAddress}</p>
								<TextInput
									value={destinationAddress}
									onUserInput={(v) => destinationAddressSet(v.trim())}
									className="border border-skin-muted dark:border-none bg-skin-input text-sm flex-1 pl-3 py-1 rounded-sm w-full"
								/>
							</div>
							<button
								disabled={fromAssetBalanceIsBelowInputAmount}
								className="blue-rect"
								onClick={openBridgeConfirmationModal}
							>
								{i18n.next}
							</button>
							<div className="bg-skin-reminder font-normal px-5 py-4 text-xs space-y-2">
								<div className="flex items-center">
									<div className="rounded-full h-1.5 w-1.5 mr-2 bg-skin-reminder-dot"></div>
									<p>{i18n.reminder}</p>
								</div>
								<p>
									{i18n.theMaximumBridgeAmountIs} {maxAmount} {asset.token}
								</p>
								<p>
									{i18n.theMinimumBridgeAmountIs} {minAmount} {asset.token}
								</p>
							</div>
						</div>
					) : (
						<ConnectWalletButton className="blue-rect" walletType={fromWallet}>
							{i18n.connect} {fromWallet}
						</ConnectWalletButton>
					)}
				</div>
				<div>
					<div className="relative flex w-full">
						<div
							className="h-0.5 absolute mt-[9px]"
							style={{
								marginLeft: 'calc(100% / 8)',
								width: 'calc(100% - 100% / 4)',
								background: `linear-gradient(to right, var(--highlight-color), var(--highlight-color) ${progressPercentage}%, var(--lowlight-color) ${progressPercentage}%, var(--lowlight-color))`,
							}}
						/>
						{[i18n.chooseChainAsset, i18n.connectWallet, i18n.sendTransaction, i18n.success].map(
							(text, i) => {
								const passed = progressPercentage >= (i / 3) * 100;
								return (
									<div key={text} className="flex-1 xy flex-col z-10 overflow-clip">
										<div className="flex xy mb-4">
											<div
												className={`h-5 w-5 rounded-full bg-skin-middleground shadow-skin-base ${
													passed
														? 'border-skin-highlight border-[6px]'
														: 'border-skin-lowlight border-[3px]'
												}`}
											/>
										</div>
										<p
											className={`text-xs max-w-full truncate ${
												passed ? 'font-semibold' : 'font-normal text-skin-muted'
											}`}
										>
											{text}
										</p>
									</div>
								);
							}
						)}
					</div>
				</div>
			</div>
			<div className="flex-1 ml-0 mt-6 lg:mt-0 lg:ml-6">
				<div className="w-[25rem] p-7 bg-skin-middleground shadow-skin-base rounded-sm space-y-5">
					<p className="text-lg font-semibold">
						{i18n.wallet} {i18n.connect}
					</p>
					{[
						{
							platform: 'Vite',
							token: 'Vite',
							desc: 'Testnet',
							walletType: 'Vite Wallet',
							icon: 'https://static.vite.net/image-1257137467/logo/VITE-logo.png',
						},
						{
							ETH: {
								platform: 'ETH',
								token: 'ETH',
								desc: 'Goerli',
								walletType: 'MetaMask',
								icon: 'https://static.vite.net/image-1257137467/logo/ETH-logo.png',
							},
							BSC: {
								platform: 'BSC',
								token: 'BNB',
								desc: 'Testnet',
								walletType: 'MetaMask',
								icon: 'https://static.vite.net/image-1257137467/logo/bsc-logo.png',
							},
							Aurora: {
								platform: 'Aurora',
								token: 'ETH',
								desc: 'Testnet',
								walletType: 'MetaMask',
								icon: 'https://static.vite.net/image-1257137467/logo/aurora.png',
							},
							POLYGON: {
								platform: 'POLYGON',
								token: 'MATIC',
								desc: 'Testnet',
								walletType: 'MetaMask',
								icon: 'https://static.vite.net/token-profile-1257137467/icon/19fb02528a61a094e2b74e2d5a5f2086.png',
							},
						}[metaMaskWalletToShow],
					].map(({ icon, platform, token, desc, walletType }) => {
						const wallet =
							walletType === 'MetaMask'
								? {
										address: metamaskAddress,
										balance:
											metaMaskNetworkMatchesFromNetwork || metaMaskNetworkMatchesToNetwork
												? metaMaskNativeAssetBalance
													? roundDownTo6Decimals(metaMaskNativeAssetBalance)
													: '...'
												: i18n.metaMaskNetworkDoesNotMatch,
										addressExplorerURL: metaMaskWalletToShow
											? `https://${
													networkType === 'testnet' ? 'goerli.' : ''
											  }etherscan.io/address/${metamaskAddress}`
											: `https://${
													networkType === 'testnet' ? 'testnet.' : ''
											  }bscscan.com/address/${metamaskAddress}`,
								  }
								: {
										address: activeViteAddress,
										// `() => vcInstance?.killSession()` doesn't work by itself for some reason
										logOut: vcInstance?.killSession
											? () => vcInstance.killSession()
											: window.vitePassport
											? () => {
													window.vitePassport!.disconnectWallet();
													setState({ vpAddress: undefined });
											  }
											: undefined,
										balance: viteBalanceInfo
											? roundDownTo6Decimals(
													getViteTokenBalance(viteBalanceInfo, constant.Vite_TokenId)
											  )
											: '...',
										addressExplorerURL: `https://${
											networkType === 'testnet' ? 'test.' : ''
										}vitescan.io/address/${activeViteAddress}`,
								  };
						const connected = !!wallet?.address;

						return (
							<div
								key={platform}
								className="p-5 bg-skin-foreground rounded-sm border border-skin-muted dark:border-none dark:shadow-skin-base"
							>
								<div className="xy justify-between">
									<div>
										<div className="xy justify-start">
											<IconCircle src={icon} alt={platform} />
											<div className="">
												<p className="text-sm">{platform}</p>
												<p className="text-sm font-normal text-skin-secondary">
													{i18n.network} : {desc}
												</p>
											</div>
										</div>
									</div>
									{connected && !!wallet.logOut && (
										<button
											className="text-white rounded-full bg-skin-highlight xy h-7 w-7"
											onClick={wallet.logOut}
										>
											<Logout size={20} />
										</button>
									)}
									<ConnectWalletButton
										className={`text-white rounded-full bg-skin-highlight xy h-7 w-7 ${
											connected ? 'hidden' : ''
										}`}
										walletType={walletType as 'Vite Wallet' | 'MetaMask'}
									>
										<Link size={20} />
									</ConnectWalletButton>
								</div>
								{connected && (
									<>
										<div className="h-[1px] my-5 bg-skin-line-divider" />
										<div className="xy justify-between text-xs font-normal">
											<p className="flex-1">
												{platform} {i18n.address} : {shortenAddress(wallet.address!)}
											</p>
											<div className="xy gap-1 text-skin-muted">
												<button onClick={() => copyWithToast(wallet.address)}>
													<Duplicate size={20} />
												</button>
												<A href={wallet.addressExplorerURL}>
													<ExternalLink size={20} />
												</A>
											</div>
										</div>
										<p className="mt-3 text-xs font-normal">
											{token} {i18n.balance} : {wallet.balance}
										</p>
									</>
								)}
							</div>
						);
					})}
				</div>
			</div>
			{confirmingBridgeTx && (
				<Modal
					header={i18n.confirm}
					onClose={() => confirmingBridgeTxSet(false)}
					className="w-full max-w-lg"
				>
					<div className="xy py-7 bg-skin-dropdown-hover">
						<p className="text-4xl font-normal">
							{amount} {asset.token}
						</p>
					</div>
					<div className="bg-skin-middleground p-7 space-y-4">
						<div className="shadow-skin-base flex justify-between p-5">
							<div className="space-y-2">
								<p className="text-sm font-semibold">{i18n.from.toUpperCase()}</p>
								<p className="text-sm font-normal text-skin-muted">{channelFrom.desc}</p>
								<img src={channelFrom.icon} alt={channelFrom.desc} className="w-8" />
							</div>
							<div className="space-y-2">
								<p className="text-sm font-semibold">{i18n.to.toUpperCase()}</p>
								<p className="text-sm font-normal text-skin-muted">{channelTo.desc}</p>
								<img src={channelTo.icon} alt={channelTo.desc} className="w-8" />
							</div>
						</div>
						<p className="text-skin-muted font-normal text-sm">
							{i18n.asset}:<span className="text-skin-base ml-3">{asset.token}</span>
						</p>
						<p className="text-skin-muted font-normal text-sm truncate">
							{i18n.destination}:<span className="text-skin-base ml-3">{destinationAddress}</span>
						</p>
						<p className="text-skin-muted font-normal text-sm">
							{i18n.youWillReceive}:
							<span className="text-skin-base ml-3">
								{amount} {asset.token}
							</span>
						</p>
						<div className="bg-skin-reminder px-5 py-4">
							<p className="text-sm font-normal">
								{i18n.theTransactionFeesAreSubjectToNetworkConditionsAndMayChange}
							</p>
						</div>
						<Checkbox checked={agreesToTerms} onUserInput={(b) => agreesToTermsSet(b)}>
							{i18n.iHaveReadAndAgreeToThe}{' '}
							<A href="https://vite.org/terms.html" className="text-skin-highlight">
								{i18n.termsOfUse}.
							</A>
						</Checkbox>
						<button
							className="blue-rect"
							disabled={!agreesToTerms}
							onClick={() => !walletPromptLoading && startBridgeTransaction()}
						>
							{walletPromptLoading ? <PendingDots bigWhite /> : i18n.confirm}
						</button>
					</div>
				</Modal>
			)}
			{confirmingViteConnect && (
				<Modal
					noX
					header="ViteConnect"
					onClose={() => confirmingViteConnectSet(false)}
					className="w-full max-w-lg"
				>
					<div className="p-6 bg-skin-viteconnect-confirm">
						<p className="font-normal">{i18n.pleaseConfirmTransactionOnYourViteWallet}</p>
					</div>
					<div className="bg-skin-middleground space-y-7 p-7">
						<div className="xy">
							<picture>
								{isDarkMode() && <source srcSet={vcConfirmDarkImageSrc} />}
								<img
									src={vcConfirmImageSrc}
									alt={i18n.pleaseConfirmTransactionOnYourViteWallet}
									className="h-32"
								/>
							</picture>
						</div>
						<button
							className="blue-rect"
							disabled={!agreesToTerms}
							onClick={() => confirmingViteConnectSet(false)}
						>
							{i18n.close}
						</button>
					</div>
				</Modal>
			)}
			{transactionConfirmationStatusOpen && (
				<Modal
					header={i18n.transactionConfirmationStatus}
					onClose={() => {
						transactionConfirmationStatusOpenSet(false);
						bridgeTxStatusModalOpen = false;
					}}
					className="w-full max-w-md bg-skin-middleground"
				>
					<div className="xy p-6 gap-5">
						<div className="fy">
							<div
								className={`z-10 xy h-5 w-5 rounded-full bg-skin-middleground shadow-skin-base ${
									bridgeTransaction?.fromHash
										? 'bg-skin-highlight'
										: 'border-[3px] border-skin-lowlight'
								}`}
							>
								{bridgeTransaction?.fromHash && <Check size={16} />}
							</div>
							<div className="w-0.5 h-24 -my-2 bg-skin-lowlight" />
							<div
								className={`xy h-5 w-5 rounded-full bg-skin-middleground shadow-skin-base ${
									bridgeTransaction?.toHash
										? 'bg-skin-highlight'
										: 'border-[3px] border-skin-lowlight'
								}`}
							>
								{bridgeTransaction?.toHash && <Check size={16} />}
							</div>
						</div>
						<div className="flex-1 space-y-6">
							{(
								[
									[
										channelFrom.icon,
										channelFrom,
										fromAddress,
										bridgeTransaction?.fromHash,
										bridgeTransaction?.fromHashConfirmationNums,
									],
									[
										channelTo.icon,
										channelTo,
										destinationAddress,
										bridgeTransaction?.toHash,
										bridgeTransaction?.toHashConfirmationNums,
									],
								] as const
							).map(([imgSrc, channel, address, hash, confirmations = 0], i) => (
								<div className="fx shadow-skin-base p-4" key={i}>
									<img src={imgSrc} alt={channel.desc} className="w-8 mr-4" />
									<div className="text-sm flex-1 space-y-1">
										<div className="flex justify-between font-semibold">
											<p>
												{amount} {asset.token}
											</p>
											<button onClick={() => copyWithToast(address)}>
												<p>
													{i ? i18n.to : i18n.from} {shortenAddress(address)}
												</p>
											</button>
										</div>
										<div className="flex justify-between font-normal">
											{hash ? (
												<button onClick={() => copyWithToast(hash)}>
													<p className="text-skin-muted">{shortenHash(hash)}</p>
												</button>
											) : (
												<div className="fx gap-2">
													<p className="text-skin-pending-green">{i18n.pending}</p>
													<PendingDots />
												</div>
											)}
											<p>
												{confirmations >= channel.confirmedThreshold
													? i18n.confirmed
													: `(${confirmations} / ${channel.confirmedThreshold})`}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
};

export default connect(Home);
