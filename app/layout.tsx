import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/theme-provider';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { siteConfig } from '@/site.config';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.shortTitle}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.siteName,
  authors: [{ name: siteConfig.author, url: '/about' }],
  creator: siteConfig.author,
  keywords: [...siteConfig.keywords],
  openGraph: {
    type: 'website',
    locale: siteConfig.language,
    url: siteConfig.siteUrl,
    siteName: siteConfig.siteName,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: '/og.png',
        width: 1729,
        height: 910,
        alt: 'Kinda — Notes, Frames & Things',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: ['/og.png'],
  },
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2efe6' },
    { media: '(prefers-color-scheme: dark)', color: '#171713' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="page-noise" aria-hidden="true" />
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
