import { connect } from '../utils/global-context';
import { useTitle } from '../utils/hooks';
import { State } from '../utils/types';

type Props = State;

// eslint-disable-next-line
const History = ({}: Props) => {
	useTitle('History');
	return (
		<div className="">
			<p>History</p>
		</div>
	);
};

export default connect()(History);
