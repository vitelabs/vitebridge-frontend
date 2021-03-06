import '../styles/reset.css';
import '../styles/colors.css';
import '../styles/classes.css';
import Router from './Router';
import { Provider } from '../utils/global-context';
import { getMetaMaskAccount } from '../utils/wallet';
import { useEffect, useState } from 'react';
import { getValidVCSession, initVC } from '../utils/vc';
import { State } from '../utils/types';

const App = () => {
	const [initialState, initialStateSet] = useState<object>();

	useEffect(() => {
		(async () => {
			const state: Partial<State> = {
				networkType: localStorage.networkType || 'testnet',
				language: localStorage.language || 'en',
				metamaskAddress: await getMetaMaskAccount(),
				vcInstance: getValidVCSession() ? initVC() : null,
				tokens: {},
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
