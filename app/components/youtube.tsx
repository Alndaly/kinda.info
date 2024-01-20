'use client';

import { useRef, useState } from 'react';
import { useEffect } from 'react';

interface Video {
	title: string;
	src: string;
}

const Youtube = (props: Video) => {
	const { title, src } = props;

	const iframeRef = useRef<any>();

	const [height, setHeight] = useState<any>(null);

	const changeVideoIframe = () => {
		iframeRef?.current && setHeight((iframeRef.current.offsetWidth * 9) / 16);
	};

	useEffect(() => {
		window.addEventListener('resize', changeVideoIframe);
		return () => {
			window.removeEventListener('resize', changeVideoIframe);
		};
	}, []);

	useEffect(() => {
		changeVideoIframe();
	}, []);

	return (
		<iframe
			ref={iframeRef}
			src={src}
			width={'100%'}
			height={height}
			title={title}
			allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
		/>
	);
};

export default Youtube;
