'use client';

import Link from 'next/link';
import { ModeToggle } from './mode-toggle';
import { MobileNavBarIcon } from './mobile-navbar-icon';
import headerNavLinks from '@/data/headerNavLinks';
import { SearchIcon } from './search-icon';
import { siteConfig } from '@/site.config';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
	const scrollDirection = useScrollDirection();
	const pathname = usePathname();

	return (
		<header
			className={`active ${
				scrollDirection === 'down' ? '-top-24' : 'top-0'
			} py-3 sticky z-10 bg-white dark:bg-[#1E1E1E] backdrop-filter backdrop-blur-lg bg-opacity-[78.6%] border-b border-zinc-50 dark:border-zinc-800 px-4 transition-all duration-600 transform`}>
			<div className='max-w-7xl mx-auto items-center flex justify-between'>
				<div>
					<Link href='/' aria-label={siteConfig.author} passHref>
						<div className='flex items-center justify-between'>
							<div className='text-xl whitespace-nowrap font-semibold text-zinc-800 dark:text-zinc-200 select-none'>
								{siteConfig.author}
							</div>
						</div>
					</Link>
				</div>
				<nav className='flex items-center text-base leading-6'>
					<div className='hidden sm:block'>
						{headerNavLinks.map((link: any) => (
							<Link
								key={link.title}
								href={link.href}
								className={`rounded-lg px-3 py-2 font-normal  hover:bg-zinc-50 hover:text-cyan-500 dark:hover:bg-slate-800 transition trasnform duration-400 select-none ${
									pathname == link.href
										? 'text-cyan-500 font-semibold'
										: 'text-zinc-500 dark:text-zinc-300'
								}`}>
								{link.title}
							</Link>
						))}
					</div>
				</nav>
				<div className='flex items-center text-base leading-5 gap-5'>
					<ModeToggle />
					<SearchIcon />
					<div className='md:hidden'>
						<MobileNavBarIcon />
					</div>
				</div>
			</div>
		</header>
	);
}

function useScrollDirection() {
	const [scrollDirection, setScrollDirection] = useState<string | null>(null);

	useEffect(() => {
		let lastScrollY = window.scrollY;

		const updateScrollDirection = () => {
			const scrollY = window.scrollY;
			const direction = scrollY > lastScrollY ? 'down' : 'up';
			if (
				direction !== scrollDirection &&
				(scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)
			) {
				setScrollDirection(direction);
			}
			lastScrollY = scrollY > 0 ? scrollY : 0;
		};
		window.addEventListener('scroll', updateScrollDirection); // add event listener
		return () => {
			window.removeEventListener('scroll', updateScrollDirection); // clean up
		};
	}, [scrollDirection]);

	return scrollDirection;
}
