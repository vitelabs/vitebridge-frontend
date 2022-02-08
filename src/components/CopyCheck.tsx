import { useState } from 'react';
import Check from '../assets/Check';
import Duplicate from '../assets/Duplicate';
import { copyToClipboardAsync } from '../utils/strings';

type Props = {
	text?: string;
};

const CopyCheck = ({ text }: Props) => {
	const [showingCopiedCheck, showingCopiedCheckSet] = useState(false);
	return (
		<button
			onClick={() => {
				copyToClipboardAsync(text);
				showingCopiedCheckSet(true);
				setTimeout(() => showingCopiedCheckSet(false), 1000);
			}}
		>
			{showingCopiedCheck ? <Check size={20} /> : <Duplicate size={20} />}
		</button>
	);
};

export default CopyCheck;
