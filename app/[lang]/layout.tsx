import type { Metadata, Viewport } from 'next';
import { GlobalMiniPlayer } from '@/components/audio/global-mini-player';
import { DocumentLanguage } from '@/components/document-language';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { JsonLd } from '@/components/json-ld';
import { getDictionary, getLocaleAlternates, hasLocale, locales } from '@/lib/i18n';
import { absoluteUrl, personId, websiteId } from '@/lib/seo';
import { siteConfig } from '@/site.config';
import { notFound } from 'next/navigation';

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
    publisher: siteConfig.author,
    keywords: [...dictionary.keywords],
    category: lang === 'zh' ? '个人博客、摄影与独立开发' : 'Personal blog, photography and indie development',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
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
          type: 'image/png',
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
  const dictionary = getDictionary(lang);
  const globalJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: siteConfig.siteUrl,
        name: siteConfig.siteName,
        alternateName: siteConfig.title,
        description: dictionary.metadata.description,
        inLanguage: ['zh-CN', 'en'],
        publisher: { '@id': personId },
      },
      {
        '@type': 'Person',
        '@id': personId,
        name: siteConfig.author,
        alternateName: siteConfig.authorAlternateNames,
        url: absoluteUrl('/about'),
        image: absoluteUrl('/images/july-portrait.jpg'),
        sameAs: [
          `https://github.com/${siteConfig.github}`,
          siteConfig.bilibili,
          siteConfig.xiaohongshu,
        ],
      },
    ],
  };

  return (
    <div
      className="group/shell has-[[data-audio-app]]:h-[100dvh] has-[[data-audio-app]]:overflow-hidden"
      lang={lang === 'zh' ? 'zh-CN' : 'en'}
    >
      <DocumentLanguage locale={lang} />
      <JsonLd data={globalJsonLd} />
      <SiteHeader locale={lang} />
      <main className="group-has-[[data-audio-app]]/shell:h-[100dvh] group-has-[[data-audio-app]]/shell:overflow-hidden">
        {children}
      </main>
      <SiteFooter locale={lang} />
      <GlobalMiniPlayer locale={lang} labels={dictionary.player} />
    </div>
  );
}
