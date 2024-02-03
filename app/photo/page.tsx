'use client';

import Image from 'next/image';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';

const images = [
	{
		title: 'love',
		url: 'https://oss.kinda.info/image/202401251909348.jpeg',
		camera: 'FUJIFILM X-T5',
		f: 'f/1.4',
		s: '1/320s',
		iso: 500,
		ev: '+2/3ev',
		time: '30 Jan 2024 3:21PM',
	},
	{
		title: 'love',
		url: 'https://oss.kinda.info/image/202401011535300.jpg',
		camera: 'FUJIFILM X-T5',
		f: 'f/1.4',
		s: '1/320s',
		iso: 500,
		ev: '+2/3ev',
		time: '30 Jan 2024 3:21PM',
	},
];

const PhotoPage = () => {
	const [pageNum, setPageNum] = useState(0);
	const [loading, setLoading] = useState<boolean>(false);
	const container = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleScroll = () => {
			const scrollThreshold = 40; // 阈值，距离底部多少像素时加载下一页
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;
			const scrollTop = window.scrollY;
			const distanceToBottom = documentHeight - (scrollTop + windowHeight);

			if (distanceToBottom < scrollThreshold) {
				setLoading(true);
			}
		};
		const debounceScroll = _.debounce(handleScroll, 200);
		// 监听滚动事件
		window.addEventListener('scroll', debounceScroll);
		// 清除事件监听器
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	return (
		<div className='space-y-1 m-3 lg:m-6' ref={container}>
			{images.map((image, index) => {
				return (
					<div
						key={index}
						className='grid grid-cols-1 md:grid-cols-12 gap-x-4 lg:gap-x-6 gap-y-4'>
						<div className='col-span-9 aspect-video relative'>
							<a href={image.url} target='_blank'>
								<Image src={image.url} alt='image' fill />
							</a>
						</div>
						<div className='col-span-3'>
							<div className='sticky top-0 font-medium font-mono'>
								<div className='mb-3 font-bold'>{image.title}</div>
								<div className='mb-3 inline-flex text-main hover:text-gray-900 dark:hover:text-gray-100'>
									{image.camera}
								</div>
								<ul className='mb-3 font-light'>
									<li>{image.f}</li>
									<li>{image.s}</li>
									<li>{image.iso}</li>
									<li>{image.ev}</li>
								</ul>
								<div className='font-light grow uppercase text-medium'>
									{image.time}
								</div>
							</div>
						</div>
					</div>
				);
			})}
			{loading && <div className='w-full text-center p-5'>加载中...</div>}
		</div>
	);
};

export default PhotoPage;
