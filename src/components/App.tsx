import '../styles/reset.css';
import '../styles/colors.css';
import '../styles/classes.css';
import Router from './Router';
import { Provider } from '../utils/global-context';
import { getMetaMaskAccount } from '../utils/wallet';
import { useEffect, useState } from 'react';
import { getValidVCSession, initViteConnect } from '../utils/viteConnect';
import { State } from '../utils/types';

const App = () => {
	const [initialState, initialStateSet] = useState<object>();

	useEffect(() => {
		(async () => {
			const vcSession = getValidVCSession();
			const state: Partial<State> = {
				networkType: localStorage.networkType || 'testnet',
				languageType: localStorage.languageType || 'en',
				metamaskAddress: await getMetaMaskAccount(),
				vcInstance: vcSession ? initViteConnect(vcSession) : null,
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
