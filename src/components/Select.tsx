import React, { useCallback, useRef } from 'react';
import ChevronDown from '../assets/ChevronDown';

type Props = {
	value: string;
	options: string[] | [any, string][];
	onUserInput: (value: string) => void;
};

const Select = ({ value, options, onUserInput }: Props) => {
	const select = useRef<HTMLSelectElement>(null);
	const handleInput = useCallback(
		(event) => {
			onUserInput(event.target.value);
		},
		[onUserInput]
	);

	return (
		<div className="xy relative">
			<ChevronDown size={20} className="text-skin-muted absolute right-0" />
			<select
				ref={select}
				className="text-sm font-semibold cursor-pointer text-skin-muted z-10 pr-5"
				onChange={handleInput}
				value={value}
			>
				{options.map((value) => {
					if (typeof value === 'string') {
						return <option key={value}>{value}</option>;
					}
					return (
						<option key={value[0]} value={value[0]}>
							{value[1]}
						</option>
					);
				})}
			</select>
		</div>
	);
};

export default Select;
