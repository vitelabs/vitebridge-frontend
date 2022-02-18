module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['PingFangSC', 'arial', 'sans-serif'],
			},
			colors: {
				skin: {
					'pending-green': 'var(--pending-green-color)',
				},
			},
			textColor: {
				skin: {
					base: 'var(--text-base-color)',
					secondary: 'var(--text-secondary-color)',
					muted: 'var(--text-muted-color)',
					highlight: 'var(--highlight-color)',
				},
			},
			backgroundColor: {
				skin: {
					base: 'var(--bg-base-color)',
					middleground: 'var(--bg-middleground-color)',
					foreground: 'var(--bg-foreground-color)',
					highlight: 'var(--highlight-color)',
					lowlight: 'var(--lowlight-color)',
					input: 'var(--bg-input-color)',
					'dropdown-hover': 'var(--bg-dropdown-hover-color)',
					'modal-header': 'var(--bg-modal-header-color)',
					reminder: 'var(--bg-reminder-color)',
					'line-divider': 'var(--bg-line-divider-color)',
					toast: 'var(--bg-toast-color)',
					'disabled-rect': 'var(--bg-disabled-rect-color)',
					'viteconnect-confirm': 'var(--bg-viteconnect-confirm-color)',
					'reminder-dot': 'var(--bg-reminder-dot)',
				},
			},
			borderColor: {
				skin: {
					base: 'var(--border-base-color)',
					muted: 'var(--border-muted-color)',
					highlight: 'var(--highlight-color)',
					lowlight: 'var(--lowlight-color)',
				},
			},
			boxShadow: {
				// Can't nest keys because the default config doesn't use `({ theme }) => ({...`
				// https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/defaultConfig.stub.js
				// 'skin-base': '0px 2px 10px 1px rgba(176, 192, 237, 0.42)',
				'skin-base': '0px 3px 10px 5px rgba(0, 0, 0, 0.05)',
			},
		},
	},
	plugins: [],
};
