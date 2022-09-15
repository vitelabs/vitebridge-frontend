import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from '../pages/Home';
import PageContainer from './PageContainer';
import { connect } from '../utils/globalContext';
import { useCallback, useEffect, useMemo } from 'react';
import { State, ViteBalanceInfo } from '../utils/types';
import Toast from '../containers/Toast';
import { metaMaskIsSupported } from '../utils/wallet';
import { VCSessionKey } from '../utils/viteConnect';
import provider from '@vite/vitejs-ws';
import { ViteAPI } from '@vite/vitejs';

const providerWsURLs = {
	// localnet: 'ws://localhost:23457',
	testnet: 'wss://buidl.vite.net/gvite/ws',
	mainnet: 'wss://node.vite.net/gvite/ws', // or 'wss://node-tokyo.vite.net/ws'
};

const providerTimeout = 60000;
const providerOptions = { retryTimes: 10, retryInterval: 5000 };
const testnetRPC = new provider(providerWsURLs.testnet, providerTimeout, providerOptions);
const mainnetRPC = new provider(providerWsURLs.mainnet, providerTimeout, providerOptions);

type Props = State;

const Router = ({ setState, vpAddress, vcInstance, networkType }: Props) => {
	const viteApi = useMemo(
		() => new ViteAPI(networkType === 'mainnet' ? mainnetRPC : testnetRPC, () => {}),
		[networkType]
	);

	const activeViteAddress = useMemo(() => {
		return vpAddress || vcInstance?.accounts[0];
	}, [vpAddress, vcInstance]);

	useEffect(() => setState({ viteApi }), [setState, viteApi]);

	useEffect(() => setState({ activeViteAddress }), [setState, activeViteAddress]);

	// useEffect(() => {
	// 	let unsubscribe = () => {};
	// 	if (vpAddress && vpAddress === activeViteAddress && window?.vitePassport) {
	// 		unsubscribe = window.vitePassport.on('networkChange', (payload) => {
	// 			let i = networkList.findIndex((n) => n.rpcUrl === payload.activeNetwork.rpcUrl);
	// 			if (i === -1) {
	// 				setState({ toast: i18n.viteExpressNetworkDoesNotMatchDappNetworkUrl });
	// 				i = 0;
	// 			}
	// 			setState({ activeNetworkIndex: i });
	// 		});
	// 	}
	// 	return unsubscribe;
	// }, [setState, vpAddress, activeViteAddress, i18n]);

	useEffect(() => {
		let unsubscribe = () => {};
		if (window?.vitePassport) {
			unsubscribe = window.vitePassport.on('accountChange', (payload) => {
				setState({ vpAddress: payload.activeAddress });
			});
		}
		return unsubscribe;
	}, [setState]);

	const getBalanceInfo = useCallback(
		(address: string) => {
			return viteApi.getBalanceInfo(address);
		},
		[viteApi]
	);

	const subscribe = useCallback(
		(event: string, ...args: any) => {
			return viteApi.subscribe(event, ...args);
		},
		[viteApi]
	);

	useEffect(() => {
		if (metaMaskIsSupported()) {
			// https://docs.metamask.io/guide/ethereum-provider.html#accountschanged
			window.ethereum.on('accountsChanged', (accounts: string[]) => {
				// OPTIMIZE: https://ethereum.stackexchange.com/questions/88084/how-to-clean-up-unused-meta-mask-event-listeners
				// IDEA: const connected = !!accounts.length;
				setState({ metamaskAddress: accounts[0] });
			});
		}
	}, [setState]);

	const updateViteBalanceInfo = useCallback(() => {
		if (activeViteAddress) {
			getBalanceInfo(activeViteAddress)
				// @ts-ignore
				.then((res: ViteBalanceInfo) => {
					// console.log('res:', res);
					setState({ viteBalanceInfo: res });
				})
				.catch((e) => {
					console.log(e);
					setState({ toast: e.message, vcInstance: undefined });
					localStorage.removeItem(VCSessionKey);
					// Sometimes on page load, this will catch with
					// Error: CONNECTION ERROR: Couldn't connect to node wss://buidl.vite.net/gvite/ws.
				});
		}
	}, [setState, getBalanceInfo, activeViteAddress]);

	useEffect(() => updateViteBalanceInfo(), [activeViteAddress]); // eslint-disable-line

	useEffect(() => {
		if (activeViteAddress) {
			subscribe('newAccountBlocksByAddr', activeViteAddress)
				.then((event: any) => {
					// event.on((result: NewAccountBlock) => {
					event.on(() => {
						// NOTE: seems like a hack cuz I don't even need the block info
						updateViteBalanceInfo();
					});
				})
				.catch((err: any) => console.warn(err));
		}
		return () => viteApi.unsubscribeAll();
	}, [setState, subscribe, activeViteAddress, viteApi, updateViteBalanceInfo]);

	return (
		<BrowserRouter>
			<PageContainer>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="*" element={<Navigate to="/" />} />
				</Routes>
			</PageContainer>
			<Toast />
		</BrowserRouter>
	);
};

export default connect(Router);
