'use client';

import SearchBar from './search-bar';
import { useState } from 'react';

export function SearchIcon() {
	const [showSearchBar, setShowSearchBar] = useState(false);

	return (
		<>
			<button
				className='border rounded-full w-8 h-8 flex items-center justify-center border-black dark:border-white'
				onClick={() => setShowSearchBar(true)}>
				<svg
					className='w-4 h-4 text-black dark:text-white'
					viewBox='0 0 1024 1024'
					version='1.1'
					xmlns='http://www.w3.org/2000/svg'>
					<path
						fill='currentColor'
						d='M474.666667 106.666667a368 368 0 1 0 368 368 368 368 0 0 0-368-368z m0 661.333333a293.333333 293.333333 0 1 1 293.333333-293.333333 293.653333 293.653333 0 0 1-293.333333 293.333333z'></path>
					<path
						fill='currentColor'
						d='M736.741464 789.544104m3.771236-3.771236l45.254834-45.254834q3.771236-3.771236 7.542473 0l122.452038 122.452038q3.771236 3.771236 0 7.542472l-45.254834 45.254834q-3.771236 3.771236-7.542472 0l-122.452039-122.452038q-3.771236-3.771236 0-7.542472Z'></path>
				</svg>
			</button>
			{showSearchBar && <SearchBar onClose={() => setShowSearchBar(false)} />}
		</>
	);
}
