import { HTMLProps, useCallback } from 'react';

type Props = HTMLProps<HTMLInputElement> & {
	value: string;
	onUserInput: (value: string) => void;
	onMetaEnter?: () => void;
};

const TextInput = ({ value, onUserInput, onMetaEnter, ...rest }: Props) => {
	const handleInput: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			onUserInput(event.target.value);
		},
		[onUserInput]
	);

	return (
		<input
			{...rest}
			type="text"
			autoComplete="off"
			autoCorrect="off"
			autoCapitalize="off"
			spellCheck="false"
			onChange={handleInput}
			value={value}
			onKeyDown={(e) => {
				if (onMetaEnter && e.metaKey && e.code === 'Enter') {
					e.preventDefault();
					onMetaEnter();
				}
			}}
		/>
	);
};

export default TextInput;
