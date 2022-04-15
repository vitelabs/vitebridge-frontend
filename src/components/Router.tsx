import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from '../pages/Home';
import PageContainer from './PageContainer';
import { connect } from '../utils/global-context';
import { useCallback, useEffect, useMemo } from 'react';
import { NewAccountBlock, State, ViteBalanceInfo } from '../utils/types';
import Toast from '../containers/Toast';
import { metaMaskIsSupported } from '../utils/wallet';
import { VCSessionKey } from '../utils/vc';
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

const Router = ({ setState, vcInstance, networkType }: Props) => {
	const viteApi = useMemo(() => {
		const viteApi = new ViteAPI(networkType === 'mainnet' ? mainnetRPC : testnetRPC, () => {
			// console.log('client connected');
		});
		return viteApi;
	}, [networkType]); // eslint-disable-line

	useEffect(() => setState({ viteApi }), [viteApi]); // eslint-disable-line

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
			// @ts-ignore
			window.ethereum.on('accountsChanged', (accounts: string[]) => {
				// IDEA: const connected = !!accounts.length;
				setState({ metamaskAddress: accounts[0] });
			});
		}
	}, [setState]);

	const updateViteBalanceInfo = useCallback(() => {
		if (vcInstance?.accounts[0]) {
			getBalanceInfo(vcInstance.accounts[0])
				// @ts-ignore
				.then((res: ViteBalanceInfo) => {
					// console.log('res:', res);
					setState({ viteBalanceInfo: res }, { deepMerge: true });
				})
				.catch((e) => {
					console.log(e);
					setState({ toast: JSON.stringify(e), vcInstance: null });
					localStorage.removeItem(VCSessionKey);
					// Sometimes on page load, this will catch with
					// Error: CONNECTION ERROR: Couldn't connect to node wss://buidl.vite.net/gvite/ws.
				});
		}
	}, [setState, getBalanceInfo, vcInstance]);

	useEffect(updateViteBalanceInfo, [vcInstance]); // eslint-disable-line

	useEffect(() => {
		if (vcInstance) {
			subscribe('newAccountBlocksByAddr', vcInstance.accounts[0])
				.then((event: any) => {
					event.on((result: NewAccountBlock) => {
						// NOTE: seems like a hack cuz I don't even need the block info
						updateViteBalanceInfo();
					});
				})
				.catch((err: any) => console.warn(err));
		}
		return () => viteApi.unsubscribeAll();
	}, [setState, subscribe, vcInstance, viteApi, updateViteBalanceInfo]);

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
