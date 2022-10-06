import { useRef, ReactNode, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useKeyPress } from '../utils/hooks';

type Props = {
	onClose: () => void;
	children: ReactNode;
	className?: string;
	header: string;
	noX?: boolean;
};

const modalParent = document.getElementById('modal')!;

const Modal = ({ header, noX, onClose = () => {}, children, className }: Props) => {
	const mouseDraggingModal = useRef(false);
	const [index, indexSet] = useState<number>();

	useEffect(() => {
		indexSet(modalParent?.children.length);
	}, []); // eslint-disable-line

	useKeyPress('Escape', () => {
		if (modalParent?.children.length === index) {
			onClose();
		}
	});

	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			if (!modalParent?.children.length) {
				document.body.style.overflow = 'visible';
			}
		};
	}, []);

	return modalParent
		? ReactDOM.createPortal(
				<div
					className="z-10 fixed inset-0 bg-black bg-opacity-30 overflow-scroll flex flex-col"
					onClick={() => {
						!mouseDraggingModal.current && onClose();
						mouseDraggingModal.current = false;
					}}
				>
					<div className="flex-1 min-h-[5rem]" />
					<div className="px-4 flex justify-center">
						<div
							className={`bg-skin-middleground rounded-bl-sm rounded-br-sm shadow-skin-base ${className}`}
							onClick={(e) => e.stopPropagation()}
							onMouseDown={() => (mouseDraggingModal.current = true)}
							onMouseUp={() => (mouseDraggingModal.current = false)}
						>
							<div className="bg-skin-modal-header text-sm px-7 h-12 xy justify-between">
								<p className="text-white font-semibold">{header}</p>
								<button className={noX ? 'invisible' : 'x'} onClick={onClose} />
							</div>
							{children}
						</div>
					</div>
					<div className="flex-1 min-h-[5rem]"></div>
				</div>,
				modalParent
		  )
		: null;
};

export default Modal;
