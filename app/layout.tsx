import { Metadata } from 'next';
import ThemeProvider from './components/theme-provider';
import './globals.css';
import Footer from './components/footer';
import { siteConfig } from '@/site.config';
import Navbar from './components/navbar';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
	metadataBase: new URL(siteConfig.siteUrl),
	generator: 'Next.js',
	applicationName: siteConfig.siteRepo,
	referrer: 'origin-when-cross-origin',
	keywords: siteConfig.keywords,
	authors: [{ name: siteConfig.author, url: '/about' }],
	creator: siteConfig.author,
	publisher: siteConfig.author,
	title: siteConfig.title,
	description: siteConfig.description,
	formatDetection: {
		email: true,
		address: false,
		telephone: false,
	},
	openGraph: {
		title: siteConfig.title,
		description: siteConfig.description,
		url: siteConfig.siteUrl,
		siteName: siteConfig.siteName,
		locale: siteConfig.language,
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
