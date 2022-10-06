import '../styles/reset.css';
import '../styles/colors.css';
import '../styles/classes.css';
import '../styles/theme.ts';
import Router from './Router';
import { Provider } from '../utils/globalContext';
import { getMetaMaskAccount } from '../utils/wallet';
import { useEffect, useState } from 'react';
import { getValidVCSession, initViteConnect } from '../utils/viteConnect';
import { State } from '../utils/types';

const App = () => {
	const [initialState, initialStateSet] = useState<object>();

	useEffect(() => {
		(async () => {
			const vcSession = getValidVCSession();
			const vcInstance = vcSession ? initViteConnect(vcSession) : undefined;
			let vpAddress: undefined | string;
			if (window?.vitePassport) {
				vpAddress = await window.vitePassport.getConnectedAddress();
			}
			const state: Partial<State> = {
				vpAddress,
				vcInstance,
				networkType: localStorage.networkType || 'testnet',
				languageType: localStorage.languageType || 'en',
				metamaskAddress: await getMetaMaskAccount(),
			};
			initialStateSet(state);
		})();
	}, []);

	return initialState ? (
		<Provider initialState={initialState}>
			<Router />
		</Provider>
	) : null;
};

export default App;
