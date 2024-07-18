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
				pathname.startsWith('/post') ? 'backdrop-blur-sm' : ''
			} flex flex-row gap-5 p-5 justify-center items-center h-[64px] transition-all w-full`}>
			<Link href={'/'}>Home</Link>
			<div>|</div>
			<Link href={'/posts/efe5db924ac24e8da24ba07c3dc8e441'}>Posts</Link>
			<div className='fixed right-5'>
				<ModeToggle />
			</div>
		</div>
	);
};

export default Nav;
