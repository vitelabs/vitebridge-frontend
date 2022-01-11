const Moon = ({ size = 24, ...rest }) => {
	return (
		<svg viewBox="0 0 20 20" fill="currentColor" width={size} height={size} {...rest}>
			<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
			<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
		</svg>
	);
};

export default Moon;
