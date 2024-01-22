import type { Metadata } from 'next';
import ThemeProvider from './theme-provider';
import './globals.css';
import Footer from './components/footer';
import Link from 'next/link';
import Navbar from './components/navbar';

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
					<Navbar />
					{children}
					<Footer></Footer>
				</ThemeProvider>
			</body>
		</html>
	);
}
