import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from '../pages/Home';
import HistoryPage from '../pages/History';
import HelpPage from '../pages/Help';
import PageContainer from './PageContainer';
import { connect } from '../utils/global-context';
import { useCallback, useEffect } from 'react';
import { NewAccountBlock, State, TokenInfo } from '../utils/types';
import { getBalanceInfo, subscribe } from '../utils/vitescripts';
import Toast from '../containers/Toast';
import { toBiggestUnit } from '../utils/strings';
import { metaMaskIsSupported } from '../utils/wallet';

type Props = State;

const Router = ({ setState, vbInstance, networkType }: Props) => {
	useEffect(() => {
		if (vbInstance) {
			vbInstance.on('disconnect', () => {
				setState({ vbInstance: undefined });
			});
		}

		if (metaMaskIsSupported()) {
			// https://docs.metamask.io/guide/ethereum-provider.html#accountschanged
			// @ts-ignore
			window.ethereum.on('accountsChanged', (accounts: string[]) => {
				setState({ metamaskAddress: accounts[0] });
			});
		}
	}, [setState, vbInstance]);

	const updateViteBalanceAndTokens = useCallback(() => {
		if (vbInstance?.accounts[0]) {
			getBalanceInfo(vbInstance.accounts[0])
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
						setState({ balances: balanceUpdates, tokens: tokenUpdates }, { deepMerge: true });
					}
				})
				.catch((e) => {
					console.log(e);
					setState({ toast: e.toString() });
					// Sometimes on page load, this will catch with
					// Error: CONNECTION ERROR: Couldn't connect to node wss://buidl.vite.net/gvite/ws.
					// TODO: What's the appropriate response?
					setTimeout(() => updateViteBalanceAndTokens(), 1000);
				});
		}
	}, [setState, vbInstance, networkType]);

	useEffect(() => {
		updateViteBalanceAndTokens();
	}, [vbInstance]); // eslint-disable-line

	useEffect(() => {
		if (vbInstance) {
			// updateViteBalanceAndTokens();
			subscribe('newAccountBlocksByAddr', vbInstance.accounts[0])
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
	}, [setState, vbInstance, updateViteBalanceAndTokens]);

	return (
		<BrowserRouter>
			<PageContainer>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/history" element={<HistoryPage />} />
					<Route path="/help" element={<HelpPage />} />
					<Route path="*" element={<Navigate to="/" />} />
				</Routes>
			</PageContainer>
			<Toast />
		</BrowserRouter>
	);
};

export default connect('vbInstance, balances, tokens, networkType')(Router);
