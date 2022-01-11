type Props = {
	src: string;
	alt: string;
};

const IconCircle = ({ src, alt }: Props) => {
	return (
		<div className="rounded-full relative xy h-9 w-9 mr-4 border bg-white overflow-hidden border-[##EDEDEE] dark:border-none">
			<div className="inset-0 absolute bg-image bg-cover blur-2xl" style={{ backgroundImage: `url("${src}")` }} />
			<img src={src} alt={alt} className="w-6" />
		</div>
	);
};

export default IconCircle;
