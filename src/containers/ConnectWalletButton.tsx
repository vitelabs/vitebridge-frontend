import { ReactNode, useState } from 'react';
import Modal from '../components/Modal';
import QR from '../components/QR';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';
import { initVB } from '../utils/vb';
import { metaMaskIsSupported, promptMetaMaskAccount } from '../utils/wallet';

type Props = State & {
	children: ReactNode;
	walletType?: 'Vite Wallet' | 'MetaMask';
	className?: string;
};

const ConnectWalletButton = ({ setState, i18n, children, walletType, className, vcInstance }: Props) => {
	const [connectURI, connectURISet] = useState('');

	return (
		<>
			<button
				className={className}
				onClick={async () => {
					if (walletType === 'Vite Wallet') {
						vcInstance = initVB();
						connectURISet(await vcInstance.createSession());
						vcInstance.on('connect', () => {
							setState({ vcInstance });
						});
					} else {
						if (metaMaskIsSupported()) {
							setState({ metamaskAddress: await promptMetaMaskAccount() });
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

export default connect('i18n, vcInstance')(ConnectWalletButton);
