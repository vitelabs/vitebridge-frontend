import { ReactNode, useEffect, useState } from 'react';
import Modal from '../components/Modal';
import QR from '../components/QR';
import { connect } from '../utils/globalContext';
import { State } from '../utils/types';
import { initViteConnect } from '../utils/viteConnect';
import { metaMaskIsSupported, promptMetaMaskAccount } from '../utils/wallet';

type Props = State & {
	children: ReactNode;
	walletType?: 'Vite Wallet' | 'MetaMask';
	className?: string;
};

const ConnectWalletButton = ({
	setState,
	i18n,
	children,
	walletType,
	className,
	vcInstance,
}: Props) => {
	const [connectURI, connectURISet] = useState('');

	useEffect(() => {
		if (vcInstance) {
			vcInstance.on('disconnect', () => setState({ vcInstance: undefined }));
		}
	}, [setState, vcInstance]);

	return (
		<>
			<button
				className={className}
				onClick={async () => {
					if (walletType === 'Vite Wallet') {
						vcInstance = initViteConnect();
						connectURISet(await vcInstance.createSession());
						vcInstance.on('connect', () => {
							connectURISet('');
							setState({ vcInstance });
						});
					} else {
						if (metaMaskIsSupported()) {
							promptMetaMaskAccount()
								.then((v) => {
									setState({ metamaskAddress: v });
								})
								.catch((e) => {
									console.log('e:', e);
									setState({ toast: e.message });
								});
						} else {
							setState({ toast: i18n.metaMaskNotDetected });
						}
					}
				}}
			>
				{children}
			</button>
			{connectURI && (
				<Modal header="ViteConnect" onClose={() => connectURISet('')}>
					<div className="p-5 text-sm font-semibold">{i18n.scanTheQrCodeViaViteWalletApp}</div>
					<div className="px-20 pt-8 pb-10 fy gap-3">
						<div className="bg-white p-2">
							<QR text={connectURI} />
						</div>
						<p className="text-lg">{i18n.or}</p>
						<button
							className="blue-rect"
							onClick={async () => {
								if (window?.vitePassport) {
									try {
										await window.vitePassport.connectWallet();
										// const activeNetwork = await window.vitePassport.getNetwork();
										setState({
											vpAddress: await window.vitePassport.getConnectedAddress(),
											// activeNetworkIndex: networkList.findIndex(
											// 	(n) => n.rpcUrl === activeNetwork.rpcUrl
											// ),
										});
									} catch (error) {
										setState({ toast: error });
									}
									connectURISet('');
								} else {
									setState({ toast: i18n.vitePassportNotDetected });
								}
							}}
						>
							{i18n.connectWithVitePassport}
						</button>
					</div>
				</Modal>
			)}
		</>
	);
};

export default connect(ConnectWalletButton);
