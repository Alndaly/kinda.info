'use client';

import Link from 'next/link';
import { GithubIcon } from './github-icon';
import { ModeToggle } from './mode-toggle';
import { BiliBiliIcon } from './bilibili-icon';
import { XiaoHongShuIcon } from './xiaohongshu-icon';
import { siteMetadata } from '@/data/sitemetadata';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
	const scrollDirection = useScrollDirection();
	const pathname = usePathname();

	return (
		<header
			className={`active ${
				scrollDirection === 'down' ? '-top-24' : 'top-0'
			} sticky z-10 backdrop-filter backdrop-blur-lg bg-opacity-[78.6%] px-4 transition-all duration-600 transform`}>
			<div className='flex items-center justify-between py-3 px-6'>
				<nav className='flex flex-row space-x-5 items-center'>
					<Link href='/' aria-label={siteMetadata.publishName}>
						<h1 className='inline-block text-center text-2xl font-black'>
							{siteMetadata.publishName}
						</h1>
					</Link>
					<Link href='/about-me'>
						<div className='inline-block text-center text-lg font-black'>
							关于
						</div>
					</Link>
				</nav>
				<div className='flex flex-row space-x-3'>
					<GithubIcon />
					<XiaoHongShuIcon />
					<BiliBiliIcon />
					<ModeToggle />
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
