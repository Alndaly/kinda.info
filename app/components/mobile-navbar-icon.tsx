'use client';

import MobileNavBar from './mobile-navbar';
import { useState } from 'react';

export function MobileNavBarIcon() {
	const [showMobileNavBar, setShowMobileNavBar] = useState(false);

	return (
		<>
			<button
				className='w-8 h-8 flex items-center justify-center border-black dark:border-white'
				onClick={() => setShowMobileNavBar(true)}>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 24 24'
					strokeWidth={1.5}
					stroke='currentColor'
					className='w-6 h-6 text-zinc-500 dark:text-zinc-200'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M3.75 9h16.5m-16.5 6.75h16.5'
					/>
				</svg>
			</button>
			{showMobileNavBar && (
				<MobileNavBar onClose={() => setShowMobileNavBar(false)} />
			)}
		</>
	);
}
