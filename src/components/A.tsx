import React from 'react';
import { Link } from 'react-router-dom';

type Props = React.HTMLProps<HTMLAnchorElement> & {
	to?: string;
};

const A = ({ to, href, children, className }: Props) => {
	return to ? (
		<Link to={to} className={className}>
			{children}
		</Link>
	) : (
		<a href={href} target="_blank" rel="noopener noreferrer" className={className}>
			{children}
		</a>
	);
};

export default A;
