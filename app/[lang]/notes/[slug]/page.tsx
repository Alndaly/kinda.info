import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarDays, Clock3 } from 'lucide-react';
import {
  ArticleAudioPlayer,
  ArticleLanguageProvider,
  ArticleTranslatedHeading,
  ArticleTranslatedTags,
  ArticleTranslatedText,
  AutomaticTranslationNotice,
} from '@/components/article-language-tools';
import { ArticleReadingTools } from '@/components/article-reading-tools';
import { Comments } from '@/components/comments';
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
  const translations = getDictionary(lang);
  const dictionary = translations.notes;
  const speechDictionary = translations.speech;
  const commentsDictionary = translations.comments;
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
    <ArticleLanguageProvider
      automatic={seo.isFallback}
      cacheKey={`${note.slug}:${note.updated ?? note.date}`}
      sourceLanguage={note.locale}
      targetLanguage={lang}
      title={note.title}
      summary={note.summary}
      tags={note.tags}
      additionalTexts={[
        previousNote?.title ?? '',
        nextNote?.title ?? '',
      ]}
    >
      <article>
        {!seo.isFallback && <JsonLd data={articleJsonLd} />}
        <header className="article-header site-container">
          <Link href={localizeHref(lang, '/notes')} className="back-link">
            <ArrowLeft /> {dictionary.back}
          </Link>
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-7 flex flex-wrap justify-center gap-2">
              <ArticleTranslatedTags />
            </div>
            <ArticleTranslatedHeading />
            <div className="article-meta">
              <span><CalendarDays /> {formatDate(note.date, lang)}</span>
              <span><Clock3 /> {note.metadata.readingTime} {dictionary.minRead}</span>
            </div>
            <ArticleAudioPlayer
              labels={{
                listen: speechDictionary.listen,
                preparing: speechDictionary.preparing,
                pause: speechDictionary.pause,
                resume: speechDictionary.resume,
                error: speechDictionary.error,
                provider: speechDictionary.provider,
              }}
            />
          </div>
        </header>
        <div className="article-rule" />
        <AutomaticTranslationNotice
          labels={{
            title: dictionary.machineTranslationTitle,
            description: dictionary.machineTranslationDescription,
            translating: dictionary.translating,
            error: dictionary.translationError,
          }}
        />
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
                <strong>
                  <ArticleTranslatedText index={0} fallback={previousNote.title} />
                </strong>
                <ArrowLeft aria-hidden="true" />
              </Link>
            ) : <span />}
            {nextNote ? (
              <Link href={nextNote.href}>
                <small>{dictionary.next}</small>
                <strong>
                  <ArticleTranslatedText index={1} fallback={nextNote.title} />
                </strong>
                <ArrowRight aria-hidden="true" />
              </Link>
            ) : <span />}
          </nav>
        </footer>
        <Comments
          locale={lang}
          type="note"
          slug={slug}
          repo={siteConfig.commentsRepo}
          labels={commentsDictionary}
        />
      </article>
    </ArticleLanguageProvider>
  );
}
