import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Languages } from 'lucide-react';
import { ArticleReadingTools } from '@/components/article-reading-tools';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/json-ld';
import { TiptapContent } from '@/components/tiptap/tiptap-content';
import { allEntries, formatDate, getEntries, getEntry, getEntrySeo } from '@/lib/content';
import { getDictionary, hasLocale, localizeHref } from '@/lib/i18n';
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
  if (!note) notFound();
  const seo = getEntrySeo('note', slug, lang);
  const noteIndex = getEntries(lang, 'note');
  const currentIndex = noteIndex.findIndex((entry) => entry.slug === slug);
  const previousNote = currentIndex >= 0 ? noteIndex[currentIndex + 1] : undefined;
  const nextNote = currentIndex > 0 ? noteIndex[currentIndex - 1] : undefined;
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
          </div>
        </div>
      </header>
      <div className="article-rule" />
      {seo.isFallback ? (
        <aside className="translation-notice site-container">
          <Languages aria-hidden="true" />
          <div>
            <strong>{dictionary.fallbackTitle}</strong>
            <p>{dictionary.fallbackDescription}</p>
          </div>
          <Link href={`/notes/${slug}`}>{dictionary.viewOriginal}</Link>
        </aside>
      ) : null}
      <ArticleReadingTools
        contentsLabel={dictionary.contents}
        progressLabel={dictionary.readingProgress}
      />
      <div className="mdx-prose">
        <TiptapContent content={note.content} fallbackHtml={note.html} />
      </div>
      <footer className="article-end">
        <div className="article-end-message">
          <span>EOF</span>
          <p>{dictionary.thanks}</p>
          <Link href={localizeHref(lang, '/notes')}>{dictionary.continue}</Link>
        </div>
        <nav className="article-pagination" aria-label={dictionary.continue}>
          {previousNote ? (
            <Link href={previousNote.href}>
              <small>{dictionary.previous}</small>
              <strong>{previousNote.title}</strong>
              <ArrowLeft aria-hidden="true" />
            </Link>
          ) : <span />}
          {nextNote ? (
            <Link href={nextNote.href}>
              <small>{dictionary.next}</small>
              <strong>{nextNote.title}</strong>
              <ArrowRight aria-hidden="true" />
            </Link>
          ) : <span />}
        </nav>
      </footer>
    </article>
  );
}
