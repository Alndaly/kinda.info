import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PhotoCard } from '@/components/photo-card';
import { getEntries } from '@/lib/content';
import { getDictionary, getLocaleAlternates, hasLocale, localizeHref } from '@/lib/i18n';
import { siteConfig } from '@/site.config';
import {
  archiveHeaderSplit,
  archiveHeaderSplitText,
  archiveHeaderTitle,
  pageTop,
  sectionIndex,
  siteContainer,
} from '@/lib/ui-classes';
import { cn } from '@/lib/utils';

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
    <div className={cn(siteContainer, pageTop)}>
      <header className={archiveHeaderSplit}>
        <div>
          <span className={sectionIndex}>Index / 02</span>
          <h1 className={archiveHeaderTitle}>{dictionary.title}</h1>
        </div>
        <div>
          <p className={archiveHeaderSplitText}>{dictionary.intro}</p>
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
      <div className="grid grid-cols-2 items-start gap-[clamp(3rem,7vw,7rem)_clamp(1.2rem,4vw,3.5rem)] [&>*:nth-child(3n+2)]:mt-28 [@media(max-width:768px)]:grid-cols-[1fr] [@media(max-width:768px)]:[&>*:nth-child(3n+2)]:mt-0">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.slug}
            entry={photo}
            priority={index < 2}
            frameIndex={index}
            viewLabel={dictionary.viewFrame}
            className={index === 0 ? 'col-span-full' : ''}
            frameClassName={
              index === 0
                ? 'aspect-video min-h-0 [@media(max-width:768px)]:aspect-[4/3]'
                : 'aspect-[4/5] [@media(max-width:768px)]:aspect-[4/3] [@media(max-width:768px)]:min-h-0'
            }
          />
        ))}
      </div>
    </div>
  );
}
