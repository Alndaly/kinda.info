'use client';

import Link from 'next/link';

export function XiaoHongShuIcon() {
	return (
		<Link
			href={
				'https://www.xiaohongshu.com/search_result?keyword=304433374&source=web_explore_feed'
			}
			target='_black'>
			<button className='border rounded-full w-8 h-8 flex items-center justify-center border-black dark:border-white'>
				<svg
					className='w-4 h-4 text-black dark:text-white'
					viewBox='0 0 1024 1024'
					version='1.1'
					xmlns='http://www.w3.org/2000/svg'>
					<path
						fill='currentColor'
						d='M448 256H320L213.44 475.456h128L256.064 640h170.624l42.688-73.152h-76.8L480 384H362.688l85.376-128z m-10.688 426.688H244.992L192 778.688h192l53.312-96z m394.752-405.376H533.376v96h85.12v309.376H511.744l-54.016 96h374.016v-96h-117.248V373.312h117.568v-96z'></path>
				</svg>
			</button>
		</Link>
	);
}
