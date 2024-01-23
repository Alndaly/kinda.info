import { Metadata } from 'next';
import ThemeProvider from './theme-provider';
import './globals.css';
import Footer from './components/footer';
import { siteMetaData } from '@/data/sitemetadata';
import Navbar from './components/navbar';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
	metadataBase: new URL(siteMetaData.siteUrl),
	generator: 'Next.js',
	applicationName: siteMetaData.siteRepo,
	referrer: 'origin-when-cross-origin',
	keywords: siteMetaData.keywords,
	authors: [{ name: siteMetaData.author, url: '/about-me' }],
	creator: siteMetaData.author,
	publisher: siteMetaData.publisher,
	title: siteMetaData.title,
	description: siteMetaData.description,
	formatDetection: {
		email: true,
		address: false,
		telephone: false,
	},
	openGraph: {
		title: siteMetaData.title,
		description: siteMetaData.description,
		url: siteMetaData.siteUrl,
		siteName: siteMetaData.siteName,
		locale: siteMetaData.language,
	},
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
					<SpeedInsights />
					<Analytics />
				</ThemeProvider>
			</body>
		</html>
	);
}
