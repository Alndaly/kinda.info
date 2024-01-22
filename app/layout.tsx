import { Metadata } from 'next';
import ThemeProvider from './theme-provider';
import './globals.css';
import Footer from './components/footer';
import { siteMetadata } from '@/data/sitemetadata';
import Navbar from './components/navbar';

export const metadata: Metadata = {
	metadataBase: new URL(siteMetadata.siteUrl),
	generator: 'Next.js',
	applicationName: siteMetadata.siteRepo,
	referrer: 'origin-when-cross-origin',
	keywords: siteMetadata.keywords,
	authors: [{ name: siteMetadata.author, url: '/about' }],
	creator: siteMetadata.author,
	publisher: siteMetadata.publishName,
	title: siteMetadata.title,
	description: siteMetadata.description,
	formatDetection: {
		email: true,
		address: false,
		telephone: false,
	},
	openGraph: {
		title: siteMetadata.title,
		description: siteMetadata.description,
		url: siteMetadata.siteUrl,
		siteName: siteMetadata.siteName,
		locale: siteMetadata.language,
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
				</ThemeProvider>
			</body>
		</html>
	);
}
