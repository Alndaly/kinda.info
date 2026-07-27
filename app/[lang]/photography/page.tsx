import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PhotoCard } from '@/components/photo-card';
import { getEntries } from '@/lib/content';
import { getDictionary, getLocaleAlternates, hasLocale, localizeHref } from '@/lib/i18n';
import { siteConfig } from '@/site.config';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dictionary = getDictionary(lang).photography;
  return {
    title: dictionary.metadataTitle,
    description: dictionary.description,
    alternates: getLocaleAlternates(lang, '/photography'),
    openGraph: {
      type: 'website',
      siteName: siteConfig.siteName,
      title: dictionary.metadataTitle,
      description: dictionary.description,
      url: localizeHref(lang, '/photography'),
      locale: lang === 'zh' ? 'zh_CN' : 'en_US',
      images: [{ url: '/og.png', alt: dictionary.metadataTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: dictionary.metadataTitle,
      description: dictionary.description,
      images: ['/og.png'],
    },
  };
}

export default async function PhotographyPage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = getDictionary(lang).photography;
  const photos = getEntries(lang, 'photo');

  return (
    <div className="site-container page-top">
      <header className="archive-header archive-header-split">
        <div>
          <span className="section-index">Index / 02</span>
          <h1>{dictionary.title}</h1>
        </div>
        <div>
          <p>{dictionary.intro}</p>
          <span className="mt-6 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {dictionary.diary}
          </span>
        </div>
      </header>
      <div className="photo-archive-grid">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.slug}
            entry={photo}
            priority={index < 2}
            className={index % 3 === 0 ? 'photo-archive-wide' : ''}
          />
        ))}
      </div>
    </div>
  );
}
