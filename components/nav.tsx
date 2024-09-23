'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ModeToggle } from './mode-toggle';
import { useAppStore } from '@/store/app';
import { usePathname } from 'next/navigation';

const Nav = () => {
	const pathname = usePathname();
	const navDom = useRef<HTMLDivElement>(null);
	const { setNavBar } = useAppStore();
	useEffect(() => {
		setNavBar(navDom);
	}, []);
	return (
		<div
			ref={navDom}
			className={`${
				!pathname.startsWith('/home') ? 'backdrop-blur-md' : ''
			} flex flex-row gap-5 p-5 justify-center items-center h-[64px] transition-all w-full bg-transparent border-b dark:border-zinc-800 border-zinc-500/20`}>
			<Link
				className={`${pathname === '/home' ? 'font-bold' : ''}`}
				href={'/home'}>
				Home
			</Link>
			<div>|</div>
			<Link
				className={`${pathname === '/posts' ? 'font-bold' : ''}`}
				href={'/posts'}>
				Posts
			</Link>
			<div>|</div>
			<Link
				className={`${pathname === '/projects' ? 'font-bold' : ''}`}
				href={'/projects'}>
				Projects
			</Link>
			<div className='fixed right-5'>
				<ModeToggle />
			</div>
		</div>
	);
};

export default Nav;
