import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { TiptapContent } from '@/components/tiptap/tiptap-content';
import { allEntries, formatDate, getEntry } from '@/lib/content';
import { getDictionary, getLocaleAlternates, hasLocale, localizeHref } from '@/lib/i18n';

type Props = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  return Array.from(
    new Set(allEntries.filter((entry) => entry.type === 'photo').map((entry) => entry.slug)),
  ).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const photo = getEntry('photo', slug, lang);
  if (!photo) return {};
  const baseHref = `/photography/${slug}`;
  return {
    title: photo.title,
    description: photo.summary,
    alternates: getLocaleAlternates(lang, baseHref),
    openGraph: {
      title: photo.title,
      description: photo.summary,
      url: photo.href,
      images: photo.cover ? [photo.cover] : ['/og.png'],
    },
  };
}

export default async function PhotoPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = getDictionary(lang).photography;
  const photo = getEntry('photo', slug, lang);
  if (!photo) notFound();

  return (
    <article className="photo-detail">
      <div className="site-container">
        <Link href={localizeHref(lang, '/photography')} className="back-link">
          <ArrowLeft /> {dictionary.back}
        </Link>
        <header>
          <span>{photo.location} · {formatDate(photo.date, lang)}</span>
          <h1>{photo.title}</h1>
          <p>{photo.summary}</p>
        </header>
      </div>
      {photo.cover && (
        <div className="photo-detail-hero">
          <Image
            src={photo.cover}
            alt={photo.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="mdx-prose mdx-prose-photo">
        <TiptapContent content={photo.content} fallbackHtml={photo.html} />
      </div>
    </article>
  );
}
