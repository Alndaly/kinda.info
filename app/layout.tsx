import type { Metadata } from 'next';
import ThemeProvider from './theme-provider';
import './globals.css';
import Link from 'next/link';
import { ModeToggle } from './components/mode-toggle';

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
					<header className='sticky w-full top-0 backdrop-blur-md'>
						<div className='flex items-center justify-between py-5 px-6'>
							<nav className='space-x-5'>
								<Link href='/'>
									首页
								</Link>
								<Link href='/about-me'>
									关于我
								</Link>
							</nav>
							<ModeToggle />
						</div>
					</header>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
