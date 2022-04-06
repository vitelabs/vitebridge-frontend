import { useCallback, useEffect, useMemo, useState } from 'react';
import { wallet, constant } from '@vite/vitejs';
import { ethers } from 'ethers';
import Picker from '../components/Picker';
import { chainIds, combos, viteBridgeAssets } from '../utils/constants';
import { connect } from '../utils/global-context';
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
import { ChannelVite } from '../utils/abstractClient/vite';
import _erc20Abi from '../utils/abstractClient/erc20/erc20.json';
import _channelAbi from '../utils/abstractClient/erc20/channel.json';
import Check from '../assets/Check';
import PendingDots from '../components/PendingDots';
import { getBridgeTx } from '../utils/services/conversion';
import { metaMaskIsSupported } from '../utils/wallet';
import Duplicate from '../assets/Duplicate';

const sleep = (ms = 0): Promise<void> => new Promise((res) => setTimeout(() => res(), ms));
let bridgeTxStatusModalOpen = false;

type Props = State;

const Home = ({ setState, i18n, metamaskAddress, vcInstance, balances, networkType }: Props) => {
	useTitle('');
	const [assetIndex, assetIndexSet] = useState(0);
	const [confirmingBridgeTx, confirmingBridgeTxSet] = useState(false);
	const [confirmingViteConnect, confirmingViteConnectSet] = useState(false);
	const [transactionConfirmationStatusOpen, transactionConfirmationStatusOpenSet] = useState(false);
	const [fromNetworkIndex, fromNetworkIndexSet] = useState(0);
	const [toNetworkIndex, toNetworkIndexSet] = useState(0);
	const [destinationAddress, destinationAddressSet] = useState('');
	const [amount, amountSet] = useState('');
	const [agreesToTerms, agreesToTermsSet] = useState(false);
	const [bridgeTransaction, bridgeTransactionSet] = useState<BridgeTransaction | null>(null);
	const [walletPromptLoading, walletPromptLoadingSet] = useState(false);
	// @ts-ignore
	const [metaMaskChainId, metaMaskChainIdSet] = useState(metaMaskIsSupported() ? window?.ethereum?.chainId : '');
	const [metaMaskNativeAssetBalance, metaMaskNativeAssetBalanceSet] = useState<string>();

	const asset = useMemo(() => viteBridgeAssets.tokens[assetIndex], [assetIndex]);
	const networks = useMemo(() => {
		const flattenedChannels = asset.channels.flat();
		const flattenedNetworks = flattenedChannels.map((o) => o.network);
		return flattenedChannels
			.filter(({ network }, i) => !flattenedNetworks.includes(network, i + 1))
			.map(({ icon, desc }) => ({ icon, label: desc }))
			.sort((a, b) => (a.label.includes('Vite') ? -1 : a.label < b.label ? -1 : 1));
	}, [asset.channels]);
	const fromNetworkOptions = useMemo(() => {
		// Show all possible networks.
		// If it's incompatible with the toNetwork, reset it to something that is compatible.
		return networks;
	}, [networks]);
	const fromNetwork = useMemo(() => fromNetworkOptions[fromNetworkIndex], [fromNetworkOptions, fromNetworkIndex]);
	const toNetworkOptions = useMemo(() => {
		return networks.filter((network) => combos[asset.token][fromNetwork.label].includes(network.label));
	}, [asset.token, fromNetwork.label, networks]);
	const toNetwork = useMemo(() => toNetworkOptions[toNetworkIndex], [toNetworkOptions, toNetworkIndex]);
	const selectedChannel = useMemo(() => {
		return asset.channels.find(
			(channel) =>
				(channel[0].desc === fromNetwork.label || channel[1].desc === fromNetwork.label) &&
				(channel[0].desc === toNetwork.label || channel[1].desc === toNetwork.label)
		);
	}, [asset.channels, fromNetwork, toNetwork]);
	const channelFrom = useMemo(() => {
		return selectedChannel!.find((side) => side.desc === fromNetworkOptions[fromNetworkIndex].label);
	}, [selectedChannel, fromNetworkOptions, fromNetworkIndex]);
	const channelTo = useMemo(() => {
		return selectedChannel!.find((side) => side.desc === toNetworkOptions[toNetworkIndex].label);
	}, [selectedChannel, toNetworkOptions, toNetworkIndex]);
	const fromAddress = useMemo(
		() => (channelFrom!.network === 'VITE' ? vcInstance?.accounts?.[0] : metamaskAddress) || '',
		[channelFrom, vcInstance, metamaskAddress]
	);
	const channelContractAddress = useMemo(() => channelFrom!.contract, [channelFrom]);
	const showEthWallet = useMemo(
		() => channelFrom?.network === 'ETH' || channelTo?.network === 'ETH',
		[channelFrom, channelTo]
	);
	const minAmount = useMemo(() => +(channelFrom?.min || 0), [channelFrom]);
	const maxAmount = useMemo(() => +(channelFrom?.max || 0), [channelFrom]);
	const fromWallet = useMemo(() => (channelFrom!.network === 'VITE' ? 'Vite Wallet' : 'MetaMask'), [channelFrom]);
	const metaMaskNetworkMatchesFromNetwork = useMemo(
		// @ts-ignore
		() => metaMaskChainId === chainIds[channelFrom!.desc],
		[metaMaskChainId, channelFrom]
	);
	const assetBalance = useMemo(() => {
		if (!metaMaskNetworkMatchesFromNetwork && fromWallet === 'MetaMask') {
			return '0';
		}

		if (channelFrom && balances) {
			let balance;
			if (balances?.vite?.[networkType] && channelFrom.network === 'VITE') {
				// defaults to '0' cuz vite token balances are fetched all at once instead of one at a time like with eth
				balance = balances.vite[networkType][channelFrom.tokenId!] || '0';
			} else if (balances?.bsc?.[networkType] && channelFrom.network === 'BSC') {
				balance = balances.bsc[networkType][channelFrom.erc20!];
			} else if (balances?.eth?.[networkType] && channelFrom.network === 'ETH') {
				balance = balances.eth[networkType][channelFrom.erc20!];
			}
			// TODO: accommodate native asset in addition to erc20
			if (balance) {
				return roundDownTo6Decimals(balance);
			}
		}
		return '';
	}, [fromWallet, metaMaskNetworkMatchesFromNetwork, balances, networkType, channelFrom]);
	const fromWalletConnected = useMemo(() => {
		if (fromWallet === 'Vite Wallet') {
			return !!vcInstance;
		} else {
			return !!metamaskAddress;
		}
	}, [fromWallet, vcInstance, metamaskAddress]);
	const progressPercentage = useMemo(() => {
		let stepsCompleted = 0;
		if (fromWalletConnected) {
			stepsCompleted++;
		}
		if (bridgeTransaction?.fromHash) {
			stepsCompleted++;
		}
		if (
			(bridgeTransaction?.fromHashConfirmationNums || 0) >= channelFrom!.confirmedThreshold &&
			(bridgeTransaction?.toHashConfirmationNums || 0) >= channelTo!.confirmedThreshold
		) {
			stepsCompleted++;
		}
		return (stepsCompleted / 3) * 100;
	}, [fromWalletConnected, channelFrom, channelTo, bridgeTransaction]);
	const ethersProvider = useMemo(() => {
		if (metaMaskIsSupported()) {
			// @ts-ignore
			return new ethers.providers.Web3Provider(window.ethereum);
		}
	}, [metaMaskChainId]); // eslint-disable-line
	const channelFromERC20Contract = useMemo(() => {
		if (channelFrom!.erc20 && ethersProvider) {
			return new ethers.Contract(channelFrom!.erc20, _erc20Abi, ethersProvider.getSigner());
		}
	}, [channelFrom, ethersProvider]);

	const copyWithToast = useCallback(
		(text = '') => {
			copyToClipboardAsync(text);
			setState({ toast: i18n.successfullyCopied });
		},
		[setState, i18n]
	);

	const checkIfMetaMaskNeedsToChangeNetwork = useCallback(() => {
		let isWrongNetwork = false;
		if (fromWallet === 'MetaMask') {
			if (channelFrom!.network === 'BSC') {
				if (networkType === 'mainnet' && !metaMaskNetworkMatchesFromNetwork) {
					setState({ toast: i18n.switchTheNetworkInYourMetaMaskWalletToBscMainnet });
					isWrongNetwork = true;
				} else if (networkType === 'testnet' && !metaMaskNetworkMatchesFromNetwork) {
					setState({ toast: i18n.switchTheNetworkInYourMetaMaskWalletToBscTestnet });
					isWrongNetwork = true;
				}
			} else if (channelFrom!.network === 'ETH') {
				if (networkType === 'mainnet' && !metaMaskNetworkMatchesFromNetwork) {
					setState({ toast: i18n.switchTheNetworkInYourMetaMaskWalletToEthMainnet });
					isWrongNetwork = true;
				} else if (networkType === 'testnet' && !metaMaskNetworkMatchesFromNetwork) {
					setState({ toast: i18n.switchTheNetworkInYourMetaMaskWalletToRinkebyTestnet });
					isWrongNetwork = true;
				}
			}
		}
		if (isWrongNetwork) {
			metaMaskNativeAssetBalanceSet('');
		}
		return isWrongNetwork;
	}, [fromWallet, channelFrom, networkType, metaMaskNetworkMatchesFromNetwork, i18n]); // eslint-disable-line

	const openBridgeConfirmationModal = useCallback(async () => {
		if (checkIfMetaMaskNeedsToChangeNetwork()) {
			return;
		}

		const num = +amount;
		if (num < minAmount || num > maxAmount) {
			return setState({ toast: i18n.illegalAmount });
		}
		if (
			(channelTo!.network === 'BSC' && !ethers.utils.isAddress(destinationAddress)) ||
			(channelTo!.network === 'VITE' && !wallet.isValidAddress(destinationAddress))
		) {
			return setState({ toast: i18n.illegalAddress });
		}
		confirmingBridgeTxSet(true);
		agreesToTermsSet(false);
		walletPromptLoadingSet(false);
	}, [
		checkIfMetaMaskNeedsToChangeNetwork,
		amount,
		channelTo,
		destinationAddress,
		i18n,
		maxAmount,
		minAmount,
		setState,
	]);

	const startBridgeTransaction = useCallback(async () => {
		if (checkIfMetaMaskNeedsToChangeNetwork()) {
			return;
		}
		bridgeTransactionSet(null);
		walletPromptLoadingSet(true);
		try {
			let inputId = '';
			const amountInSmallestUnit = toSmallestUnit(amount, channelFrom!.decimals);
			if (channelFrom!.network === 'BSC' && channelFromERC20Contract) {
				// TODO: come up with better names for allowance and approved
				const allowance = await channelFromERC20Contract.allowance(fromAddress, channelContractAddress);
				const approved = +allowance.toString() >= +amountInSmallestUnit;
				if (!approved) {
					await channelFromERC20Contract.approve(channelContractAddress, amountInSmallestUnit);
				}
				const erc20Channel = new ethers.Contract(channelContractAddress, _channelAbi, ethersProvider!.getSigner());
				const originAddr = `0x${wallet.getOriginalAddressFromAddress(destinationAddress)}`;
				const prevId = await erc20Channel.prevInputId();
				await erc20Channel.input(originAddr, amountInSmallestUnit, {
					// https://github.com/MetaMask/metamask-extension/issues/7286#issuecomment-557838325
					gasLimit: 1000000,
				});
				confirmingBridgeTxSet(false);
				confirmingViteConnectSet(false);
				transactionConfirmationStatusOpenSet(true);
				bridgeTxStatusModalOpen = true;
				walletPromptLoadingSet(false);
				while (!inputId) {
					await sleep(5000);
					const id = await erc20Channel.prevInputId();
					if (id !== prevId) inputId = id;
				}
			} else if (channelFrom!.network === 'VITE' && vcInstance) {
				const channelClient = new ChannelVite({
					vcInstance,
					address: channelContractAddress,
					tokenId: channelFrom!.tokenId!,
				});
				const prevId = `0x${(await channelClient.prevInputId())?.[0]}`;
				confirmingViteConnectSet(true);
				await channelClient.input(destinationAddress, amountInSmallestUnit);
				confirmingBridgeTxSet(false);
				confirmingViteConnectSet(false);
				transactionConfirmationStatusOpenSet(true);
				bridgeTxStatusModalOpen = true;
				walletPromptLoadingSet(false);
				while (!inputId) {
					await sleep(5000);
					const id = `0x${(await channelClient.prevInputId())?.[0]}`;
					if (id !== prevId) inputId = id;
				}
			}
			let bridgeTx: BridgeTransaction;
			let fromConfirmed = false;
			let toConfirmed = false;
			while ((!fromConfirmed || !toConfirmed) && bridgeTxStatusModalOpen) {
				await sleep(5000);
				bridgeTx = await getBridgeTx(networkType, { id: inputId });
				if (bridgeTx) {
					bridgeTransactionSet(bridgeTx);
					fromConfirmed = bridgeTx.fromHashConfirmationNums >= channelFrom!.confirmedThreshold;
					toConfirmed = bridgeTx.toHashConfirmationNums >= channelTo!.confirmedThreshold;
				}
			}
			if (bridgeTxStatusModalOpen) {
				// QUESTION: Isn't the transaction technically completed when bridgeTx has a `toHash` with sufficient confirmations?
				// I've noticed the BSC network reaches its threshold a lot faster than Vite.
				setState({ toast: i18n.bridgingTransactionComplete });
			}
		} catch (e: any) {
			console.log('e:', e);
			walletPromptLoadingSet(false);
			confirmingViteConnectSet(false);
			if (e?.code) {
				// usually { code: 11012, message: "User Canceled" }
				// @ts-ignore
				setState({ toast: { 11012: i18n.userCanceled }[e.code] || e.message });
			}
		}
	}, [
		i18n,
		networkType,
		channelContractAddress,
		amount,
		ethersProvider,
		channelFrom,
		channelTo,
		destinationAddress,
		channelFromERC20Contract,
		fromAddress,
		setState,
		vcInstance,
		checkIfMetaMaskNeedsToChangeNetwork,
	]);

	useEffect(() => {
		if (metaMaskIsSupported()) {
			// @ts-ignore
			window.ethereum.on('chainChanged', (chainId: string) => {
				console.log('chainId:', chainId);
				metaMaskChainIdSet(chainId);
			});
		}
	}, []);

	useEffect(() => {
		if (channelTo!.network === 'VITE') {
			destinationAddressSet(vcInstance?.accounts[0] || '');
		} else {
			destinationAddressSet(metamaskAddress || '');
		}
	}, [vcInstance, channelTo, metamaskAddress]);

	useEffect(() => {
		if (channelFromERC20Contract && metamaskAddress && metaMaskNetworkMatchesFromNetwork) {
			const network = channelFrom!.network.toLowerCase() as 'bsc' | 'eth';
			channelFromERC20Contract
				.balanceOf(metamaskAddress)
				.then((data: ethers.BigNumber) => {
					if (channelFrom!.erc20 && !assetBalance) {
						setState({
							balances: {
								[network]: {
									[networkType]: {
										[channelFrom!.erc20]: ethers.utils.formatUnits(data),
									},
								},
							},
						});
					}
				})
				.catch((e: any) => console.log('e:', e));
		}
	}, [
		balances,
		channelFrom,
		assetBalance,
		metaMaskNetworkMatchesFromNetwork,
		channelFromERC20Contract,
		metamaskAddress,
		setState,
		networkType,
	]);

	useEffect(() => {
		if (ethersProvider && metamaskAddress && networkType) {
			ethersProvider
				.getBalance(metamaskAddress)
				.then((data) => {
					metaMaskNativeAssetBalanceSet(ethers.utils.formatEther(data));
				})
				.catch((e: any) => {
					setState({ toast: String(e) });
				});
		}
	}, [metaMaskChainId, ethersProvider, metamaskAddress, networkType]); // eslint-disable-line

	useEffect(() => {
		if (channelFrom?.network === 'BSC' || channelFrom?.network === 'ETH') {
			checkIfMetaMaskNeedsToChangeNetwork();
		}
	}, [channelFrom, checkIfMetaMaskNeedsToChangeNetwork]);
	console.log('assetBalance:', assetBalance);
	return (
		<div className="m-5 xy flex-col lg:flex-row lg:items-start lg:justify-center">
			<div className="flex-1 hidden lg:flex flex-col"></div>
			<div className="w-full flex flex-col min-h-[48rem] max-w-2xl py-10 rounded-sm shadow-skin-base bg-skin-middleground">
				<div className="px-10 flex-1">
					<p className="text-lg mb-5 font-semibold">{i18n.chooseAsset}</p>
					<Picker
						big
						selectedIndex={assetIndex}
						options={viteBridgeAssets.tokens.map(({ token, icon }) => ({ icon, label: token }))}
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
									if (i >= combos[asset.token][label].length) {
										toNetworkIndexSet(0);
									}
								}}
							/>
							<IconCircle src={channelFrom!.icon} alt={channelFrom!.desc} />
						</div>
						<button
							className="w-12"
							onClick={() => {
								fromNetworkIndexSet(networks.findIndex(({ label }) => label === toNetwork.label));
								toNetworkIndexSet(
									combos[asset.token][toNetwork.label].findIndex((networkLabel) => fromNetwork.label === networkLabel)
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
							<IconCircle src={channelTo!.icon} alt={channelTo!.desc} />
						</div>
					</div>
					{fromWalletConnected ? (
						<div className="space-y-5">
							<div>
								<div className="flex justify-between">
									<p className="mb-3 text-xs font-semibold">{i18n.amount}</p>
									<p className="mb-3 text-xs font-normal">
										{i18n.balance} : {assetBalance || '...'}
									</p>
								</div>
								<div className="border border-skin-muted dark:border-none bg-skin-input text-sm flex items-center rounded-sm">
									<NumericalInput
										value={amount}
										onUserInput={(a) => amountSet(a)}
										className="flex-1 pl-3 py-1"
										maxDecimals={18}
									/>
									<button className="px-3" onClick={() => assetBalance && amountSet(assetBalance)}>
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
									onUserInput={(a) => destinationAddressSet(a)}
									className="border border-skin-muted dark:border-none bg-skin-input text-sm flex-1 pl-3 py-1 rounded-sm w-full"
								/>
							</div>
							<button className="blue-rect" onClick={openBridgeConfirmationModal}>
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
						{[i18n.chooseChainAsset, i18n.connectWallet, i18n.sendTransaction, i18n.success].map((text, i) => {
							const passed = progressPercentage >= (i / 3) * 100;
							return (
								<div key={text} className="flex-1 xy flex-col z-10 overflow-clip">
									<div className="flex xy mb-4">
										<div
											className={`h-5 w-5 rounded-full bg-skin-middleground shadow-skin-base ${
												passed ? 'border-skin-highlight border-[6px]' : 'border-skin-lowlight border-[3px]'
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
						})}
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
						showEthWallet
							? {
									platform: 'ETH',
									token: 'ETH',
									desc: 'Rinkeby',
									walletType: 'MetaMask',
									// TODO: update to eth icon
									icon: 'https://static.vite.net/image-1257137467/logo/usdt-logo2.png',
							  }
							: {
									platform: 'BSC',
									token: 'BNB',
									desc: 'Testnet',
									walletType: 'MetaMask',
									icon: 'https://static.vite.net/image-1257137467/logo/bsc-logo.png',
							  },
					].map(({ icon, platform, token, desc, walletType }) => {
						const wallet = {
							'Vite Wallet': {
								address: vcInstance?.accounts[0],
								// `vcInstance?.killSession` doesn't work by itself for some reason
								logOut: vcInstance?.killSession && (() => vcInstance.killSession()),
								balance: balances?.vite?.[networkType][constant.Vite_TokenId],
								addressExplorerURL: `https://${networkType === 'testnet' ? 'test.' : ''}vitescan.io/address/${
									vcInstance?.accounts[0]
								}`,
							},
							MetaMask: {
								address: metamaskAddress,
								balance: metaMaskNativeAssetBalance,
								addressExplorerURL: showEthWallet
									? `https://${networkType === 'testnet' ? 'rinkeby.' : ''}etherscan.io/address/${metamaskAddress}`
									: `https://${networkType === 'testnet' ? 'testnet.' : ''}bscscan.com/address/${metamaskAddress}`,
							},
						}[walletType];
						const connected = !!wallet?.address;
						const roundedBalance = connected && wallet.balance ? roundDownTo6Decimals(wallet.balance) : '...';

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
									{connected ? (
										wallet.logOut && (
											<button
												className="text-white rounded-full bg-skin-highlight xy h-7 w-7"
												onClick={() => wallet.logOut()}
											>
												<Logout size={20} />
											</button>
										)
									) : (
										<ConnectWalletButton
											className="text-white rounded-full bg-skin-highlight xy h-7 w-7"
											walletType={walletType}
										>
											<Link size={20} />
										</ConnectWalletButton>
									)}
								</div>
								{connected && (
									<>
										<div className="h-[1px] my-5 bg-skin-line-divider" />
										<div className="xy justify-between text-xs font-normal">
											<p className="flex-1">
												{platform} {i18n.address} : {shortenAddress(wallet.address)}
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
											{token} {i18n.balance} : {roundedBalance}
										</p>
									</>
								)}
							</div>
						);
					})}
				</div>
			</div>
			{confirmingBridgeTx && (
				<Modal header={i18n.confirm} onClose={() => confirmingBridgeTxSet(false)} className="w-full max-w-lg">
					<div className="xy py-7 bg-skin-dropdown-hover">
						<p className="text-4xl font-normal">
							{amount} {asset.token}
						</p>
					</div>
					<div className="bg-skin-middleground p-7 space-y-4">
						<div className="shadow-skin-base flex justify-between p-5">
							<div className="space-y-2">
								<p className="text-sm font-semibold">{i18n.from.toUpperCase()}</p>
								<p className="text-sm font-normal text-skin-muted">{channelFrom!.desc}</p>
								<img src={channelFrom!.icon} alt={channelFrom!.desc} className="w-8" />
							</div>
							<div className="space-y-2">
								<p className="text-sm font-semibold">{i18n.to.toUpperCase()}</p>
								<p className="text-sm font-normal text-skin-muted">{channelTo!.desc}</p>
								<img src={channelTo!.icon} alt={channelTo!.desc} className="w-8" />
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
							<p className="text-sm font-normal">{i18n.theTransactionFeesAreSubjectToNetworkConditionsAndMayChange}</p>
						</div>
						<Checkbox checked={agreesToTerms} onUserInput={(b) => agreesToTermsSet(b)}>
							{i18n.iHaveReadAndAgreeToThe}{' '}
							<A href="TODO: get terms link" className="text-skin-highlight">
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
				<Modal noX header="ViteConnect" onClose={() => confirmingViteConnectSet(false)} className="w-full max-w-lg">
					<div className="p-6 bg-skin-viteconnect-confirm">
						<p className="font-normal">{i18n.pleaseConfirmTransactionOnViteWalletApp}</p>
					</div>
					<div className="bg-skin-middleground space-y-7 p-7">
						<div className="xy">
							<picture>
								{isDarkMode() && <source srcSet={vcConfirmDarkImageSrc} />}
								<img src={vcConfirmImageSrc} alt={i18n.pleaseConfirmTransactionOnViteWalletApp} className="h-32" />
							</picture>
						</div>
						<button className="blue-rect" disabled={!agreesToTerms} onClick={() => confirmingViteConnectSet(false)}>
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
									bridgeTransaction?.fromHash ? 'bg-skin-highlight' : 'border-[3px] border-skin-lowlight'
								}`}
							>
								{bridgeTransaction?.fromHash && <Check size={16} />}
							</div>
							<div className="w-0.5 h-24 -my-2 bg-skin-lowlight" />
							<div
								className={`xy h-5 w-5 rounded-full bg-skin-middleground shadow-skin-base ${
									bridgeTransaction?.toHash ? 'bg-skin-highlight' : 'border-[3px] border-skin-lowlight'
								}`}
							>
								{bridgeTransaction?.toHash && <Check size={16} />}
							</div>
						</div>
						<div className="flex-1 space-y-6">
							{[
								[
									channelFrom!.icon,
									channelFrom,
									fromAddress,
									bridgeTransaction?.fromHash,
									bridgeTransaction?.fromHashConfirmationNums,
								],
								[
									channelTo!.icon,
									channelTo,
									destinationAddress,
									bridgeTransaction?.toHash,
									bridgeTransaction?.toHashConfirmationNums,
								],
							].map(([imgSrc, channel, address, hash, confirmations], i) => (
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
													: `(${confirmations || 0} / ${channel.confirmedThreshold})`}
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

export default connect('i18n, metamaskAddress, vcInstance, balances, networkType')(Home);
