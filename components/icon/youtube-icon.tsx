import Link from 'next/link';

export function YoutubeIcon() {
	return (
		<Link
			href={
				'https://www.youtube.com/@kindahall666'
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
						d='M941.3 296.1c-10.3-38.6-40.7-69-79.2-79.3C792.2 198 512 198 512 198s-280.2 0-350.1 18.7C123.3 227 93 257.4 82.7 296 64 366 64 512 64 512s0 146 18.7 215.9c10.3 38.6 40.7 69 79.2 79.3C231.8 826 512 826 512 826s280.2 0 350.1-18.8c38.6-10.3 68.9-40.7 79.2-79.3C960 658 960 512 960 512s0-146-18.7-215.9zM423 646V378l232 133-232 135z'></path>
				</svg>
			</button>
		</Link>
	);
}
