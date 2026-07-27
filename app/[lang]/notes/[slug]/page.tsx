import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock3, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/json-ld';
import { TiptapContent } from '@/components/tiptap/tiptap-content';
import { allEntries, formatDate, getEntry, getEntrySeo } from '@/lib/content';
import { getDictionary, hasLocale, localizeHref } from '@/lib/i18n';
import { getCanonicalPostSlug } from '@/lib/legacy-routes';
import {
  absoluteUrl,
  breadcrumbJsonLd,
  contentLanguage,
  jsonLdGraph,
  personId,
  socialImage,
  websiteId,
} from '@/lib/seo';
import { siteConfig } from '@/site.config';

type Props = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  return Array.from(
    new Set(allEntries.filter((entry) => entry.type === 'note').map((entry) => entry.slug)),
  ).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const note = getEntry('note', slug, lang);
  if (!note) return {};
  const seo = getEntrySeo('note', slug, lang);
  const image = socialImage(note.cover);
  return {
    title: note.title,
    description: note.summary,
    keywords: note.tags,
    authors: [{ name: siteConfig.author, url: localizeHref(lang, '/about') }],
    alternates: seo.alternates,
    robots: seo.isFallback ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'article',
      siteName: siteConfig.siteName,
      title: note.title,
      description: note.summary,
      url: seo.alternates.canonical,
      locale: note.locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: seo.availableLocales
        .filter((locale) => locale !== note.locale)
        .map((locale) => (locale === 'zh' ? 'zh_CN' : 'en_US')),
      publishedTime: note.date,
      modifiedTime: note.updated ?? note.date,
      section: getDictionary(note.locale).notes.title,
      authors: [siteConfig.author],
      tags: note.tags,
      images: [{ url: image, alt: note.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: note.title,
      description: note.summary,
      images: [image],
    },
  };
}

export default async function NotePage({ params }: Props) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = getDictionary(lang).notes;
  const note = getEntry('note', slug, lang);
  if (!note) {
    const canonicalSlug = getCanonicalPostSlug(slug);
    if (canonicalSlug !== slug) {
      permanentRedirect(localizeHref(lang, `/notes/${canonicalSlug}`));
    }
    notFound();
  }
  const seo = getEntrySeo('note', slug, lang);
  const canonicalUrl = absoluteUrl(seo.alternates.canonical);
  const articleJsonLd = jsonLdGraph(
    {
      '@type': 'BlogPosting',
      '@id': `${canonicalUrl}#article`,
      headline: note.title,
      description: note.summary,
      url: canonicalUrl,
      mainEntityOfPage: canonicalUrl,
      datePublished: note.date,
      dateModified: note.updated ?? note.date,
      inLanguage: contentLanguage(note.locale),
      image: absoluteUrl(socialImage(note.cover)),
      keywords: note.tags,
      wordCount: Math.round(note.metadata.wordCount),
      isAccessibleForFree: true,
      author: { '@id': personId },
      publisher: { '@id': personId },
      isPartOf: { '@id': websiteId },
    },
    breadcrumbJsonLd(note.locale, [
      { name: siteConfig.siteName, href: '/' },
      { name: getDictionary(note.locale).notes.title, href: '/notes' },
      { name: note.title, href: `/notes/${slug}` },
    ]),
  );

  return (
    <article>
      {!seo.isFallback && <JsonLd data={articleJsonLd} />}
      <header className="article-header site-container">
        <Link href={localizeHref(lang, '/notes')} className="back-link">
          <ArrowLeft /> {dictionary.back}
        </Link>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-7 flex flex-wrap justify-center gap-2">
            {note.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
          </div>
          <h1>{note.title}</h1>
          <p className="article-deck">{note.summary}</p>
          <div className="article-meta">
            <span><CalendarDays /> {formatDate(note.date, lang)}</span>
            <span><Clock3 /> {note.metadata.readingTime} {dictionary.minRead}</span>
            {note.source ? (
              <a href={note.source} target="_blank" rel="noreferrer">
                <ExternalLink /> {dictionary.source}
              </a>
            ) : null}
          </div>
        </div>
      </header>
      <div className="article-rule" />
      <div className="mdx-prose">
        <TiptapContent content={note.content} fallbackHtml={note.html} />
      </div>
      <footer className="article-end">
        <span>EOF</span>
        <p>{dictionary.thanks}</p>
        <Link href={localizeHref(lang, '/notes')}>{dictionary.continue}</Link>
      </footer>
    </article>
  );
}
