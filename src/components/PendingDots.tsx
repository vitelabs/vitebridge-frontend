// type Props = {};

import { useMemo } from 'react';

type Props = {
	bigWhite?: boolean;
};

const PendingDots = ({ bigWhite }: Props) => {
	const className = useMemo(
		() => `animate-pulse rounded-full ${bigWhite ? 'bg-white h-2 w-2' : 'bg-skin-pending-green h-1 w-1'}`,
		[bigWhite]
	);
	return (
		<div className="fx gap-1">
			<div className={className} />
			<div className={className} style={{ animationDelay: '500ms' }} />
			<div className={className} style={{ animationDelay: '1000ms' }} />
		</div>
	);
};

export default PendingDots;
