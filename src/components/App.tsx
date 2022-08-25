import '../styles/reset.css';
import '../styles/colors.css';
import '../styles/classes.css';
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
			console.log('!!window?.vitePassport:', !!window?.vitePassport);
			try {
				if (window?.vitePassport?.getConnectedAddress) {
					vpAddress = await window.vitePassport.getConnectedAddress();
					console.log('vpAddress:', vpAddress);
				}
			} catch (error) {
				console.log('error:', error);
			}

			const state: Partial<State> = {
				vpAddress,
				vcInstance,
				networkType: localStorage.networkType || 'testnet',
				languageType: localStorage.languageType || 'en',
				metamaskAddress: await getMetaMaskAccount(),
				activeViteAddress: vpAddress || vcInstance?.accounts?.[0],
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
