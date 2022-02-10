import '../styles/reset.css';
import '../styles/colors.css';
import '../styles/classes.css';
import Router from './Router';
import { Provider } from '../utils/global-context';
import { getMetaMaskAccount } from '../utils/wallet';
import { useEffect, useState } from 'react';
import { getValidVBSession, initVB } from '../utils/vb';
import { State } from '../utils/types';

const App = () => {
	const [initialState, initialStateSet] = useState<object>();

	useEffect(() => {
		(async () => {
			const state: Partial<State> = {
				networkType: localStorage.network || 'testnet',
				language: localStorage.language || 'en',
				metamaskAddress: await getMetaMaskAccount(),
				vcInstance: getValidVBSession() ? initVB() : null,
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
