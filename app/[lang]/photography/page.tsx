import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PhotoCard } from '@/components/photo-card';
import { getEntries } from '@/lib/content';
import { getDictionary, getLocaleAlternates, hasLocale, localizeHref } from '@/lib/i18n';
import { siteConfig } from '@/site.config';
import { siteContainer } from '@/lib/ui-classes';

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
  const years = [...new Set(photos.map((photo) => photo.date.slice(0, 4)))].sort();
  const locations = new Set(photos.map((photo) => photo.location).filter(Boolean));
  const yearSpan =
    years.length > 1 ? `${years[0]}—${years[years.length - 1]}` : (years[0] ?? '—');

  return (
    <div className={`${siteContainer} page-top`}>
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
      <aside className="photo-ledger" aria-label={dictionary.archive}>
        <div>
          <span>{dictionary.archive}</span>
          <strong>{String(photos.length).padStart(2, '0')}</strong>
        </div>
        <dl>
          <div>
            <dt>{dictionary.frames}</dt>
            <dd>{photos.length}</dd>
          </div>
          <div>
            <dt>{dictionary.span}</dt>
            <dd>{yearSpan}</dd>
          </div>
          <div>
            <dt>{dictionary.places}</dt>
            <dd>{String(locations.size).padStart(2, '0')}</dd>
          </div>
        </dl>
      </aside>
      <div className="photo-archive-grid">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.slug}
            entry={photo}
            priority={index < 2}
            frameIndex={index}
            viewLabel={dictionary.viewFrame}
            className={index === 0 ? 'photo-archive-lead' : ''}
          />
        ))}
      </div>
    </div>
  );
}
