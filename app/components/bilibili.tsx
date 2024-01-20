'use client';

import { useRef, useState } from 'react';
import { useEffect } from 'react';
import { useSize } from 'ahooks';

interface Video {
	title: string;
	src: string;
}

const BiliBili = (props: Video) => {
	const { title, src } = props;
	const iframeRef = useRef<HTMLIFrameElement | null>(null);

	const [height, setHeight] = useState<any>();

	const changeVideoIframe = () => {
		if (iframeRef?.current) {
			setHeight((iframeRef.current.offsetWidth * 9) / 16);
		}
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
			title={title}
			src={src}
			width={'100%'}
			height={height}
		/>
	);
};

export default BiliBili;
