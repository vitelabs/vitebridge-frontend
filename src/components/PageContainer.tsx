import { ReactNode, useEffect } from 'react';
import A from './A';
import { useLocation } from 'react-router-dom';
import Select from './Select';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';
import LightBulb from '../assets/LightBulb';
import Moon from '../assets/Moon';

type Props = State & {
	title?: string;
	children: ReactNode;
};

const PageContainer = ({ setState, language, networkType, i18n, children }: Props) => {
	const { pathname } = useLocation();

	useEffect(() => {
		if (!i18n) {
			import(`../i18n/${language}.json`).then((translation) => {
				setState({ i18n: translation });
			});
		}
	}, [setState, i18n, language]);

	return !i18n ? null : (
		<div className="min-h-screen">
			<header className="flex px-2.5 h-12 border-skin-muted border-b justify-between">
				<div className="flex gap-7">
					<A
						to="/"
						className={`relative text-sm font-semibold xy ${pathname === '/' ? 'active-tab' : 'text-skin-muted'}`}
					>
						{i18n.bridge}
					</A>
					<A
						href="https://test.vitescan.io/bridges"
						className={`relative text-sm font-semibold xy ${
							pathname === '/transactions' ? 'active-tab' : 'text-skin-muted'
						}`}
					>
						{i18n.transactions}
					</A>
					<A
						href="https://medium.com/vitelabs/vitebridge-0-1-bug-bounty-program-109ce87bda2e"
						className={`relative text-sm font-semibold xy text-skin-muted`}
					>
						{i18n.bugBounty}
					</A>
					<A
						href="https://medium.com/vitelabs/vitebridge-0-1-testnet-tutorial-1f3382f389f7"
						className={`relative text-sm font-semibold xy text-skin-muted`}
					>
						{i18n.tutorial}
					</A>
					<A href="https://t.me/vite_en" className={`relative text-sm font-semibold xy text-skin-muted`}>
						{i18n.help}
					</A>
				</div>
				<div className="flex gap-7">
					<Select
						value={language!}
						options={[
							['en', 'English'],
							// ['tr', 'Türkçe'],
						]}
						onUserInput={(v) => {
							setState({ language: v });
							localStorage.language = v;
							import(`../i18n/${v}.json`).then((translation) => {
								setState({ i18n: translation });
							});
						}}
					/>
					<Select
						value={networkType!}
						options={[
							// ['mainnet', 'Mainnet'],
							['testnet', 'Testnet'],
						]}
						onUserInput={(v) => {
							if (v === 'mainnet' || v === 'testnet') {
								setState({ networkType: v });
								localStorage.networkType = v;
							}
						}}
					/>
					<button
						className="w-7 xy text-skin-muted"
						onClick={() => {
							if (localStorage.theme === 'light') {
								localStorage.theme = 'dark';
								document.documentElement.classList.add('dark');
							} else {
								localStorage.theme = 'light';
								document.documentElement.classList.remove('dark');
							}
							// IDEA: theme based on OS preference
							// localStorage.removeItem('theme');
						}}
					>
						<LightBulb size={36} className="hidden dark:block" />
						<Moon size={36} className="block dark:hidden" />
					</button>
				</div>
			</header>
			<main>{children}</main>
		</div>
	);
};

export default connect(PageContainer);
