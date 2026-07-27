import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/theme-provider';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getDictionary, getLocaleAlternates, hasLocale, locales } from '@/lib/i18n';
import { siteConfig } from '@/site.config';
import { notFound } from 'next/navigation';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import '../globals.css';

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dictionary = getDictionary(lang).metadata;
  const canonical = lang === 'zh' ? '/' : `/${lang}`;

  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title: {
      default: dictionary.title,
      template: `%s — ${siteConfig.shortTitle}`,
    },
    description: dictionary.description,
    applicationName: siteConfig.siteName,
    authors: [{ name: siteConfig.author, url: lang === 'zh' ? '/about' : '/en/about' }],
    creator: siteConfig.author,
    keywords: [...dictionary.keywords],
    alternates: getLocaleAlternates(lang, '/'),
    openGraph: {
      type: 'website',
      locale: lang === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: lang === 'zh' ? ['en_US'] : ['zh_CN'],
      url: canonical,
      siteName: siteConfig.siteName,
      title: dictionary.title,
      description: dictionary.description,
      images: [
        {
          url: '/og.png',
          width: 1729,
          height: 910,
          alt: dictionary.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: dictionary.title,
      description: dictionary.description,
      images: ['/og.png'],
    },
  };
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2efe6' },
    { media: '(prefers-color-scheme: dark)', color: '#171713' },
  ],
};

export default async function RootLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html
      lang={lang === 'zh' ? 'zh-CN' : 'en'}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="page-noise" aria-hidden="true" />
          <SiteHeader locale={lang} />
          <main>{children}</main>
          <SiteFooter locale={lang} />
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
