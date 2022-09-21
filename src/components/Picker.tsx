import { useRef, useState } from 'react';
import { useKeyPress } from '../utils/hooks';
import ChevronDown from '../assets/ChevronDown';

export type PickerOption = { value?: string; label: string; icon?: string };

type Props = {
	big?: boolean;
	selectedIndex: number;
	options: PickerOption[];
	onPick: (value: PickerOption, index: number) => void;
};

type IconRowProps = {
	big?: boolean;
	className?: string;
	icon: string;
	label: string;
	onClick?: () => void;
};
const IconRow = ({ big, className, icon, label, onClick }: IconRowProps) => (
	<div
		className={`px-4 flex items-center gap-2 ${big ? 'py-2' : 'py-1'} ${className}`}
		onClick={onClick}
	>
		{big && <img src={icon} alt={label} className="h-8" />}
		<p className={`text-sm ${big ? '' : 'text-skin-secondary font-normal dark:text-skin-base'}`}>
			{label}
		</p>
	</div>
);

const Picker = ({ big, selectedIndex, options, onPick }: Props) => {
	const ref = useRef<HTMLDivElement>(null);
	useKeyPress('Escape', () => {
		if (ref.current) {
			ref.current.blur();
			openSet(false);
		}
	});
	const [open, openSet] = useState(false);

	return (
		<div
			ref={ref}
			className={`relative cursor-pointer ${
				big ? 'h-12 bg-skin-input border border-skin-muted dark:border-none rounded-sm' : ''
			}`}
			onClick={() => openSet(!open)}
			tabIndex={0}
			onBlur={() => openSet(false)}
		>
			<div className="h-full flex items-center justify-between">
				{big ? (
					<IconRow
						big
						icon={options[selectedIndex].icon!}
						label={options[selectedIndex].label}
						className={open ? 'opacity-50' : ''}
					/>
				) : (
					<p className="text-sm text-skin-secondary font-normal dark:text-skin-base">
						{options[selectedIndex].label}
					</p>
				)}
				<div
					className={`h-4 w-4 rounded-full border-skin-highlight border xy transition ${
						big ? 'mr-4' : ''
					} ${open ? 'rotate-180' : ''}`}
				>
					<ChevronDown className="mt-0.5 text-skin-highlight w-10" />
				</div>
			</div>
			{open && (
				<div className="absolute max-h-32 overflow-scroll top-[100%] bg-skin-base w-full py-1 rounded-sm z-50 shadow-skin-base">
					{options.map((option, i) => {
						return option.icon ? (
							<IconRow
								big={big}
								key={option.label}
								icon={option.icon}
								label={option.label}
								onClick={() => onPick(option, i)}
								className="bg-skin-base hover:bg-skin-dropdown-hover"
							/>
						) : null;
					})}
				</div>
			)}
		</div>
	);
};

export default Picker;
