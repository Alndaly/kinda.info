import type { Metadata } from 'next';
import ThemeProvider from './theme-provider';
import './globals.css';
import Link from 'next/link';
import { GithubIcon } from './components/github-icon';
import { ModeToggle } from './components/mode-toggle';
import { BiliBiliIcon } from './components/bilibili-icon';
import { XiaoHongShuIcon } from './components/xiaohongshu-icon';

export const metadata: Metadata = {
	title: 'Kinda的个人博客',
	description: '记录，然后超越。',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='zh'>
			<body>
				<ThemeProvider attribute='class' defaultTheme='system' enableSystem>
					<header className='sticky w-full top-0 backdrop-blur-md z-10'>
						<div className='flex items-center justify-between py-3 px-6'>
							<nav className='flex space-x-5 items-center'>
								<Link href='/'>
									<h1 className='inline-block text-center text-2xl font-black '>
										kinda.info
									</h1>
								</Link>
								<Link href='/about-me'>关于我</Link>
							</nav>
							<div className='flex flex-row space-x-3'>
								<GithubIcon />
								<XiaoHongShuIcon />
								<BiliBiliIcon />
								<ModeToggle />
							</div>
						</div>
					</header>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
