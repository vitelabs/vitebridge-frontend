import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from '../pages/Home';
import PageContainer from './PageContainer';
import { connect } from '../utils/global-context';
import { useCallback, useEffect } from 'react';
import { NewAccountBlock, State, TokenInfo } from '../utils/types';
import { getBalanceInfo, subscribe } from '../utils/vitescripts';
import Toast from '../containers/Toast';
import { toBiggestUnit } from '../utils/strings';
import { metaMaskIsSupported } from '../utils/wallet';
import { VCSessionKey } from '../utils/vc';

type Props = State;

const Router = ({ setState, vcInstance, networkType }: Props) => {
	useEffect(() => {
		if (vcInstance) {
			vcInstance.on('disconnect', () => {
				setState({ vcInstance: undefined });
			});
		}

		if (metaMaskIsSupported()) {
			// https://docs.metamask.io/guide/ethereum-provider.html#accountschanged
			// @ts-ignore
			window.ethereum.on('accountsChanged', (accounts: string[]) => {
				// IDEA: const connected = !!accounts.length;
				setState({ metamaskAddress: accounts[0] });
			});
		}
	}, [setState, vcInstance]);

	const updateViteBalanceAndTokens = useCallback(() => {
		if (vcInstance?.accounts[0]) {
			console.log('vcInstance.accounts[0]:', vcInstance.accounts[0]);
			getBalanceInfo(vcInstance.accounts[0])
				// @ts-ignore
				.then((res: { balance: { balanceInfoMap: object } }) => {
					if (res.balance.balanceInfoMap) {
						const balanceUpdates = { vite: { [networkType]: {} } };
						const tokenUpdates: { [key: string]: TokenInfo } = {};
						Object.entries(res.balance.balanceInfoMap).forEach(([tti, { balance, tokenInfo }]) => {
							// @ts-ignore
							balanceUpdates.vite[networkType][tti] = toBiggestUnit(balance, tokenInfo.decimals);
							tokenUpdates[tti] = tokenInfo;
						});
						setState({ balances: balanceUpdates }, { deepMerge: true });
					}
				})
				.catch((e) => {
					console.log(e);
					setState({ toast: e.toString(), vcInstance: null });
					localStorage.removeItem(VCSessionKey);
					// Sometimes on page load, this will catch with
					// Error: CONNECTION ERROR: Couldn't connect to node wss://buidl.vite.net/gvite/ws.
				});
		}
	}, [setState, vcInstance, networkType]);

	useEffect(() => {
		updateViteBalanceAndTokens();
	}, [vcInstance]); // eslint-disable-line

	useEffect(() => {
		if (vcInstance) {
			// updateViteBalanceAndTokens();
			subscribe('newAccountBlocksByAddr', vcInstance.accounts[0])
				.then((event: any) => {
					event.on((result: NewAccountBlock) => {
						// NOTE: seems like a hack, I don't even need the block info
						updateViteBalanceAndTokens();
					});
				})
				.catch((err: any) => {
					console.warn(err);
				});
		}
	}, [setState, vcInstance, updateViteBalanceAndTokens]);

	return (
		<BrowserRouter>
			<PageContainer>
				<Routes>
					<Route path="/" element={<HomePage />} />
					{/* <Route path="/history" element={<HistoryPage />} /> */}
					<Route path="*" element={<Navigate to="/" />} />
				</Routes>
			</PageContainer>
			<Toast />
		</BrowserRouter>
	);
};

export default connect('vcInstance, balances, networkType')(Router);
