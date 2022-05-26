import { ReactNode, useEffect, useState } from 'react';
import Modal from '../components/Modal';
import QR from '../components/QR';
import { connect } from '../utils/global-context';
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
			vcInstance.on('disconnect', () => setState({ vcInstance: null }));
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
					<div className="p-5 text-sm font-semibold">
						{i18n.scanTheQrCodeViaViteWalletApp}
					</div>
					<div className="px-20 pt-8 pb-10 xy">
						<div className="h-64 w-64 bg-white p-2">
							<QR text={connectURI} />
						</div>
					</div>
				</Modal>
			)}
		</>
	);
};

export default connect(ConnectWalletButton);
