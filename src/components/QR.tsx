import React from 'react';
import { qrcode, modes, ecLevel } from 'qrcode.es';
import logo from '../assets/start_qrcode_icon.svg';

const defaultOptions = {
	size: 240, //300
	ecLevel: ecLevel.HIGH,
	minVersion: 12, // 4, // has to be at least 12 or else I get `code length overflow`
	background: '#fff',
	mode: modes.DRAW_WITH_IMAGE_BOX,
	radius: 0,
	image: logo,
	mSize: 0.3, //0.24,
};

const QR = React.memo(
	({
		text,
		options,
	}: React.HTMLProps<HTMLDivElement> & {
		text: string;
		options?: object;
	}) => {
		return (
			<div
				ref={async (e) => {
					// Will double render if e.innerHTML is truthy
					if (e !== null && !e.innerHTML) {
						const qrCode = new qrcode(e);
						qrCode.generate(text, { ...defaultOptions, ...options });
					}
				}}
			/>
		);
	}
);

export default QR;
