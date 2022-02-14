// @ts-nocheck

import Connector from '@vite/connector';

export const VCSessionKey = 'vcSession';

export class VB extends Connector {
	constructor(opts, meta) {
		super(opts, meta);
		this.on('connect', (err, payload) => {
			const { accounts } = payload.params[0];
			this.setAccState(accounts);
		});
		this.on('disconnect', () => {
			localStorage.removeItem(VCSessionKey);
		});
		this.on('session_update', () => {
			const { session } = arguments[0];
			if (session && session.accounts) {
				this.setAccState(session.accounts);
			}
		});
	}

	setAccState(accounts = []) {
		if (!accounts || !accounts[0]) throw new Error('addresolves is null');
		this.saveSession();
	}

	saveSession() {
		const sessionData = {
			session: this.session,
			timestamp: new Date().getTime(),
		};
		localStorage.setItem(VCSessionKey, JSON.stringify(sessionData));
	}

	async createSession() {
		await super.createSession();
		return this.uri;
	}

	async sendVbTx(...args) {
		return new Promise((resolve, reject) => {
			this.on('disconnect', () => {
				// reject({ code: 11020, message: '链接断开' });
				reject({ code: 11020, message: 'broken link' }); // I used Google Translate
			});

			this.sendCustomRequest({ method: 'vite_signAndSendTx', params: args })
				.then((r) => {
					this.saveSession();
					resolve(r);
				})
				.catch((e) => {
					reject(e);
				});
		});
	}
}

export function getValidVBSession() {
	let sessionData = null;
	let session = null;
	try {
		const tm = localStorage.getItem(VCSessionKey);
		if (tm) {
			sessionData = JSON.parse(tm);
		}
	} catch (err) {
		console.warn(err);
	}
	if (sessionData && sessionData.timestamp) {
		// 60 minutes
		if (new Date().getTime() - sessionData.timestamp < 1000 * 60 * 10) {
			// console.log('Found session on localStorage.');
			session = sessionData.session;
		} else {
			// console.log('Found session on localStorage, but it has expired.');
			localStorage.removeItem(VCSessionKey);
		}
	}
	return session;
}

export function initVB(meta = null) {
	const session = getValidVBSession();
	return new VB(
		{
			session,
			bridge: 'wss://biforst.vite.net',
		},
		meta
	);
}
