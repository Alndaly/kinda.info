'use client';
import { allPosts } from 'contentlayer/generated';
import readingTime from 'reading-time';
import { useEffect, useState } from 'react';

const MyInfo = () => {
	const [words, setWords] = useState<number>(0);
	useEffect(() => {
		setWords(
			allPosts
				.map((item) => readingTime(item.body.raw).words)
				.reduce((prev, current) => {
					return prev + current;
				})
		);
	}, []);
	return (
		<div className='w-full p-5 flex justify-center items-center flex-col gap-3'>
			<div
				className='rounded-full bg-center no-repeat bg-cover w-24 h-24'
				style={{
					backgroundImage: `url(https://oss.kinda.info/image/202402122029799.jpeg)`,
				}}></div>
			<div>阡陌</div>
			<div className='flex flex-row gap-5'>
				<div className='flex flex-col items-center justify-center'>
					<div>Posts</div>
					<div className='text-slate-400 dark:text-slate-500'>
						{allPosts.length}
					</div>
				</div>
				<div className='w-px dark:bg-white/20 bg-black/20'></div>
				<div className='flex flex-col items-center justify-center'>
					<div>Words</div>
					<div className='text-slate-400 dark:text-slate-500'>{words}</div>
				</div>
			</div>
		</div>
	);
};

export default MyInfo;
