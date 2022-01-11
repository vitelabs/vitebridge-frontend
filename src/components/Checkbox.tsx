import { ReactNode } from 'react';

type Props = {
	checked: boolean;
	onUserInput: (checked: boolean) => void;
	children?: ReactNode;
};

const Checkbox = ({ checked, children, onUserInput }: Props) => {
	return (
		<div className="xy justify-start">
			<input type="checkbox" checked={checked} onChange={(e) => onUserInput(e.target.checked)} />
			<p className="text-sm ml-2">{children}</p>
		</div>
	);
};

export default Checkbox;
