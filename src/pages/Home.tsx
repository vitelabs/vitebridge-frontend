import { useCallback, useEffect, useMemo, useState } from 'react';
import { wallet } from '@vite/vitejs';
import { ethers, Contract, BigNumber } from 'ethers';
import Picker from '../components/Picker';
import { viteBridgeAssets } from '../utils/constants';
import { connect } from '../utils/global-context';
import { useTitle } from '../utils/hooks';
import { BridgeTransaction, State } from '../utils/types';
import transImageSrc from '../assets/trans.png';
import vbConfirmImageSrc from '../assets/vb_confirm.png';
import vbConfirmDarkImageSrc from '../assets/vb_confirm.dark.png';
import ConnectWalletButton from '../containers/ConnectWalletButton';
import { copyToClipboardAsync, shortenAddress, shortenHash, toSmallestUnit } from '../utils/strings';
import NumericalInput from '../components/NumericalInput';
import TextInput from '../components/TextInput';
import IconCircle from '../components/IconCircle';
import Logout from '../assets/Logout';
import Link from '../assets/Link';
import ExternalLink from '../assets/ExternalLink';
import Duplicate from '../assets/Duplicate';
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

const sleep = (seconds = 0): Promise<void> => new Promise((res) => setTimeout(() => res(), seconds));

type Props = State;

const Home = ({ setState, i18n, metamaskAddress, vbInstance, balances, tokens, networkType }: Props) => {
	useTitle('');
	const [assetIndex, assetIndexSet] = useState(0);
	const [confirmingBridgeTx, confirmingBridgeTxSet] = useState(false);
	const [confirmingViteConnect, confirmingViteConnectSet] = useState(false);
	const [transactionConfirmationStatusOpen, transactionConfirmationStatusOpenSet] = useState(false);
	const [fromNetworkIndex, fromNetworkIndexSet] = useState(0);
	const [toNetworkIndex, toNetworkIndexSet] = useState(1);
	const [destinationAddress, destinationAddressSet] = useState('');
	const assetOptions = viteBridgeAssets.tokens.map(({ token, icon }) => ({ icon, label: token }));
	const [amount, amountSet] = useState('');
	const [agreesToTerms, agreesToTermsSet] = useState(false);
	const [fromNetworkConfirmations, fromNetworkConfirmationsSet] = useState(0);
	const [toNetworkConfirmations, toNetworkConfirmationsSet] = useState(0);
	const [fromNetworkReceiveHash, fromNetworkReceiveHashSet] = useState('');
	const [toNetworkSendHash, toNetworkSendHashSet] = useState('');
	const [walletPromptLoading, walletPromptLoadingSet] = useState(false);

	const asset = useMemo(() => viteBridgeAssets.tokens[assetIndex], [assetIndex]);
	// TODO: eventually there will be more than 1 channel so `channels[0]` will have to be replaced
	const channelOptions = useMemo(() => asset.channels[0], [asset.channels]);
	const channelPickerOptions = useMemo(
		() =>
			channelOptions.map(({ icon, desc }) => ({
				icon,
				label: desc,
			})),
		[channelOptions]
	);
	const channelFrom = useMemo(() => channelOptions[fromNetworkIndex], [channelOptions, fromNetworkIndex]);
	const fromAddress = useMemo(
		() => (channelFrom.network === 'VITE' ? vbInstance?.accounts?.[0] : metamaskAddress) || '',
		[channelFrom.network, vbInstance, metamaskAddress]
	);
	const channelContractAddress = useMemo(() => channelFrom.contract, [channelFrom]);
	const channelTo = useMemo(() => channelOptions[toNetworkIndex], [channelOptions, toNetworkIndex]);
	const minAmount = useMemo(() => +(channelFrom?.min || 0), [channelFrom]);
	const maxAmount = useMemo(() => +(channelFrom?.max || 0), [channelFrom]);
	const assetBalance = useMemo(() => {
		if (channelFrom && balances) {
			if (balances?.vite?.[networkType] && channelFrom.network === 'VITE') {
				return balances.vite[networkType][channelFrom.tokenId!];
			} else if (balances?.bsc?.[networkType] && channelFrom.network === 'BSC') {
				return balances.bsc[networkType][channelFrom.erc20!];
			}
		}
	}, [balances, networkType, channelFrom]);

	const fromWallet = useMemo(
		() => (channelFrom.network === 'VITE' ? 'Vite Wallet' : 'MetaMask'),
		[channelFrom.network]
	);

	useEffect(() => {
		if (channelTo.network === 'VITE') {
			destinationAddressSet(vbInstance?.accounts[0] || '');
		} else {
			destinationAddressSet(metamaskAddress || '');
		}
	}, [channelTo.network, vbInstance, metamaskAddress]);

	const fromWalletConnected = useMemo(() => {
		if (fromWallet === 'Vite Wallet') {
			return !!vbInstance;
		} else {
			return !!metamaskAddress;
		}
	}, [fromWallet, vbInstance, metamaskAddress]);

	const progressPercentage = useMemo(() => {
		let stepsCompleted = 0;
		if (fromWalletConnected) {
			stepsCompleted++;
		}
		if (fromNetworkReceiveHash) {
			stepsCompleted++;
		}
		if (
			fromNetworkConfirmations >= channelFrom.confirmedThreshold &&
			toNetworkConfirmations >= channelTo.confirmedThreshold
		) {
			stepsCompleted++;
		}
		return (stepsCompleted / 3) * 100;
	}, [
		fromWalletConnected,
		channelFrom.confirmedThreshold,
		channelTo.confirmedThreshold,
		fromNetworkConfirmations,
		fromNetworkReceiveHash,
		toNetworkConfirmations,
	]);

	const provider = useMemo(() => {
		if (metaMaskIsSupported()) {
			// @ts-ignore
			return new ethers.providers.Web3Provider(window.ethereum);
		}
	}, []);

	const erc20Contract = useMemo(() => {
		if (channelFrom.erc20 && provider) {
			return new Contract(channelFrom.erc20, _erc20Abi, provider.getSigner());
		}
	}, [channelFrom.erc20, provider]);

	useEffect(() => {
		if (erc20Contract && metamaskAddress) {
			erc20Contract?.balanceOf(metamaskAddress).then((data: BigNumber) => {
				if (channelFrom.erc20 && !balances?.bsc?.[networkType]?.[channelFrom.erc20]) {
					setState(
						{ balances: { bsc: { [networkType]: { [channelFrom.erc20]: ethers.utils.formatUnits(data) } } } },
						{ deepMerge: true }
					);
				}
			});
		}
	}, [erc20Contract, metamaskAddress, setState, networkType, channelFrom.erc20, balances?.bsc]);

	useEffect(() => {
		if (provider && metamaskAddress && networkType && !balances?.bsc?.[networkType]?.bnb) {
			provider.getBalance(metamaskAddress).then((data) => {
				setState(
					{ balances: { bsc: { [networkType]: { bnb: ethers.utils.formatEther(data) } } } },
					{ deepMerge: true }
				);
			});
		}
	}, [provider, metamaskAddress, setState, networkType, balances?.bsc]);

	const amountInSmallestUnit = useMemo(
		() => toSmallestUnit(amount, channelFrom.decimals),
		[amount, channelFrom.decimals]
	);
	const copyWithToast = useCallback(
		(text = '') => {
			copyToClipboardAsync(text);
			setState({ toast: i18n.successfullyCopied });
		},
		[setState, i18n]
	);

	const startBridgeTransaction = useCallback(async () => {
		fromNetworkConfirmationsSet(0);
		toNetworkConfirmationsSet(0);
		fromNetworkReceiveHashSet('');
		toNetworkSendHashSet('');
		walletPromptLoadingSet(true);

		try {
			let inputId = '';
			if (channelFrom.network === 'BSC' && erc20Contract) {
				// TODO: come up with better names for allowance and approved
				const allowance = await erc20Contract.allowance(fromAddress, channelContractAddress);
				const approved = +allowance.toString() >= +amountInSmallestUnit;
				if (!approved) {
					await erc20Contract.approve(channelContractAddress, amountInSmallestUnit);
				}
				const erc20Channel = new Contract(
					channelContractAddress,
					_channelAbi,
					// @ts-ignore
					new ethers.providers.Web3Provider(window.ethereum).getSigner()
				);
				const originAddr = `0x${wallet.getOriginalAddressFromAddress(destinationAddress)}`;
				const prevId = await erc20Channel.prevInputId();
				await erc20Channel.input(originAddr, amountInSmallestUnit, {
					// https://github.com/MetaMask/metamask-extension/issues/7286#issuecomment-557838325
					gasLimit: 1000000,
				});
				confirmingBridgeTxSet(false);
				confirmingViteConnectSet(false);
				transactionConfirmationStatusOpenSet(true);
				walletPromptLoadingSet(false);
				while (!inputId) {
					await sleep(5000);
					const id = await erc20Channel.prevInputId();
					if (id !== prevId) inputId = id;
				}
			} else if (channelFrom.network === 'VITE' && vbInstance) {
				const channelClient = new ChannelVite({
					vbInstance,
					address: channelContractAddress,
					tokenId: channelFrom.tokenId!,
				});
				const prevId = `0x${(await channelClient.prevInputId())?.[0]}`;
				confirmingViteConnectSet(true);
				await channelClient.input(destinationAddress, amountInSmallestUnit);
				confirmingBridgeTxSet(false);
				confirmingViteConnectSet(false);
				transactionConfirmationStatusOpenSet(true);
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
			while (!fromConfirmed || !toConfirmed) {
				await sleep(5000);
				bridgeTx = await getBridgeTx(networkType, { from: fromAddress, to: destinationAddress, id: inputId });
				if (bridgeTx) {
					fromNetworkReceiveHashSet(bridgeTx.fromHash);
					toNetworkSendHashSet(bridgeTx.toHash);
					fromNetworkConfirmationsSet(bridgeTx.fromHashConfirmationNums || 0);
					fromConfirmed = bridgeTx.fromHashConfirmationNums >= channelFrom.confirmedThreshold;
					toNetworkConfirmationsSet(bridgeTx.toHashConfirmationNums || 0);
					toConfirmed = bridgeTx.toHashConfirmationNums >= channelTo.confirmedThreshold;
				}
			}
			// QUESTION: Isn't the transaction technically completed when bridgeTx has a `toHash` with sufficient confirmations?
			// I've noticed the BSC network reaches its threshold a lot faster than Vite.
			setState({ toast: i18n.bridgingTransactionComplete });
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
		networkType,
		amountInSmallestUnit,
		channelContractAddress,
		channelFrom.confirmedThreshold,
		channelFrom.network,
		channelFrom.tokenId,
		channelTo.confirmedThreshold,
		destinationAddress,
		erc20Contract,
		fromAddress,
		i18n.bridgingTransactionComplete,
		i18n.userCanceled,
		setState,
		vbInstance,
	]);

	return (
		<div className="m-5 xy flex-col lg:flex-row lg:items-start lg:justify-center">
			<div className="flex-1 hidden lg:flex"></div>
			<div className="w-full flex flex-col min-h-[48rem] max-w-2xl py-10 rounded-sm shadow-skin-base bg-skin-middleground">
				<div className="px-10 flex-1">
					<p className="text-lg mb-5 font-semibold">{i18n.chooseAsset}</p>
					<Picker
						big
						selectedIndex={assetIndex}
						options={assetOptions}
						onPick={(_, i) => {
							assetIndexSet(i);
							fromNetworkIndexSet(0);
							toNetworkIndexSet(1);
						}}
					/>
					<div className="xy my-9 xy gap-3">
						<div className="p-4 space-y-3 flex-1 rounded-sm shadow-skin-base bg-skin-middleground dark:bg-skin-foreground">
							<p className="text-sm font-bold">{i18n.from}</p>
							<Picker
								selectedIndex={fromNetworkIndex}
								options={channelPickerOptions}
								onPick={(_, i) => {
									fromNetworkIndexSet(i);
									if (i === toNetworkIndex) {
										toNetworkIndexSet(i === 0 ? 1 : 0);
									}
								}}
							/>
							<IconCircle src={channelFrom.icon} alt={channelFrom.desc} />
						</div>
						<button
							className="w-12"
							onClick={() => {
								fromNetworkIndexSet(toNetworkIndex);
								toNetworkIndexSet(fromNetworkIndex);
							}}
						>
							<img src={transImageSrc} alt="Flip networks" className="w-12" />
						</button>
						<div className="p-4 space-y-3 flex-1 rounded-sm shadow-skin-base bg-skin-middleground dark:bg-skin-foreground">
							<p className="text-sm font-bold">{i18n.to}</p>
							<Picker
								selectedIndex={toNetworkIndex}
								options={channelPickerOptions}
								onPick={(_, i) => {
									toNetworkIndexSet(i);
									if (i === fromNetworkIndex) {
										fromNetworkIndexSet(i === 0 ? 1 : 0);
									}
								}}
							/>
							<IconCircle src={channelTo.icon} alt={channelTo.desc} />
						</div>
					</div>
					{fromWalletConnected ? (
						<div className="space-y-5">
							<div>
								<div className="flex justify-between">
									<p className="mb-3 text-xs font-semibold">{i18n.amount}</p>
									<p className="mb-3 text-xs font-normal">
										{i18n.balance}: {assetBalance || '...'}
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
							<button
								className="blue-rect"
								onClick={async () => {
									const num = +amount;
									if (num < minAmount || num > maxAmount) {
										return setState({ toast: i18n.illegalAmount });
									}
									if (
										(channelTo.network === 'BSC' && !ethers.utils.isAddress(destinationAddress)) ||
										(channelTo.network === 'VITE' && !wallet.isValidAddress(destinationAddress))
									) {
										return setState({ toast: i18n.illegalAddress });
									}
									confirmingBridgeTxSet(true);
									agreesToTermsSet(false);
									walletPromptLoadingSet(false);
								}}
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
						{
							platform: 'BSC',
							token: 'BNB',
							desc: 'Testnet',
							walletType: 'MetaMask',
							icon: 'https://static.vite.net/image-1257137467/logo/bsc-logo.png',
						},
					].map(({ icon, platform, token, desc, walletType }) => {
						const viteTokenId = 'tti_5649544520544f4b454e6e40';
						const wallet = {
							'Vite Wallet': {
								address: vbInstance?.accounts[0],
								// `vbInstance?.killSession` doesn't work by itself for some reason
								logOut: vbInstance?.killSession && (() => vbInstance.killSession()),
								balance: balances?.vite?.[networkType]?.[viteTokenId] || '...',
								addressExplorerURL: `https://vitescan.io/address/${vbInstance?.accounts[0]}`,
							},
							MetaMask: {
								address: metamaskAddress,
								balance: balances?.bsc?.[networkType]?.bnb || '...',
								addressExplorerURL: `https://${
									networkType === 'testnet' ? 'testnet.' : ''
								}bscscan.com/address/${metamaskAddress}`,
							},
						}[walletType];
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
													{i18n.network} {desc}
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
												<button onClick={() => copyToClipboardAsync(wallet.address)}>
													<Duplicate size={20} />
												</button>
												<A href={wallet.addressExplorerURL}>
													<ExternalLink size={20} />
												</A>
											</div>
										</div>
										<p className="mt-3 text-xs font-normal">
											{token} {i18n.balance} : {Math.floor(+wallet.balance * 10000) / 10000 || '...'}
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
								<p className="text-sm font-normal text-skin-muted">{channelFrom.desc}</p>
								<img src={channelOptions[fromNetworkIndex].icon} alt={channelFrom.desc} className="w-8" />
							</div>
							<div className="space-y-2">
								<p className="text-sm font-semibold">{i18n.to.toUpperCase()}</p>
								<p className="text-sm font-normal text-skin-muted">{channelTo.desc}</p>
								<img src={channelOptions[toNetworkIndex].icon} alt={channelTo.desc} className="w-8" />
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
							{i18n.iHaveReadAndAgreeToThe} {/* // TODO: get terms link */}
							<A href="TODO: " className="text-skin-highlight">
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
								{isDarkMode() && <source srcSet={vbConfirmDarkImageSrc} />}
								<img src={vbConfirmImageSrc} alt={i18n.pleaseConfirmTransactionOnViteWalletApp} className="h-32" />
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
					onClose={() => transactionConfirmationStatusOpenSet(false)}
					className="w-full max-w-md bg-skin-middleground"
				>
					<div className="xy p-6 gap-5">
						<div className="fy">
							<div
								className={`z-10 xy h-5 w-5 rounded-full bg-skin-middleground shadow-skin-base ${
									fromNetworkReceiveHash ? 'bg-skin-highlight' : 'border-[3px] border-skin-lowlight'
								}`}
							>
								{fromNetworkReceiveHash && <Check size={16} />}
							</div>
							<div className="w-0.5 h-24 -my-2 bg-skin-lowlight" />
							<div
								className={`xy h-5 w-5 rounded-full bg-skin-middleground shadow-skin-base ${
									toNetworkSendHash ? 'bg-skin-highlight' : 'border-[3px] border-skin-lowlight'
								}`}
							>
								{toNetworkSendHash && <Check size={16} />}
							</div>
						</div>
						<div className="flex-1 space-y-6">
							{[
								[
									channelOptions[fromNetworkIndex].icon,
									channelFrom,
									fromAddress,
									fromNetworkReceiveHash,
									fromNetworkConfirmations,
								],
								[
									channelOptions[toNetworkIndex].icon,
									channelTo,
									destinationAddress,
									toNetworkSendHash,
									toNetworkConfirmations,
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

export default connect('i18n, metamaskAddress, vbInstance, balances, tokens, networkType')(Home);
