import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ArticleAudioPlayer } from '@/components/article-language-tools';
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
    new Set(allEntries.filter((entry) => entry.type === 'photo').map((entry) => entry.slug)),
  ).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const photo = getEntry('photo', slug, lang);
  if (!photo) return {};
  const seo = getEntrySeo('photo', slug, lang);
  const image = socialImage(photo.cover);
  return {
    title: photo.title,
    description: photo.summary,
    keywords: photo.tags,
    authors: [{ name: siteConfig.author, url: localizeHref(lang, '/about') }],
    alternates: seo.alternates,
    robots: seo.isFallback ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      siteName: siteConfig.siteName,
      title: photo.title,
      description: photo.summary,
      url: seo.alternates.canonical,
      locale: photo.locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: seo.availableLocales
        .filter((locale) => locale !== photo.locale)
        .map((locale) => (locale === 'zh' ? 'zh_CN' : 'en_US')),
      images: [{ url: image, alt: photo.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: photo.title,
      description: photo.summary,
      images: [image],
    },
  };
}

export default async function PhotoPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const translations = getDictionary(lang);
  const dictionary = translations.photography;
  const speechDictionary = translations.speech;
  const commentsDictionary = translations.comments;
  const photo = getEntry('photo', slug, lang);
  if (!photo) notFound();
  const seo = getEntrySeo('photo', slug, lang);
  const photoIndex = getEntries(lang, 'photo');
  const frameIndex = photoIndex.findIndex((entry) => entry.slug === slug);
  const canonicalUrl = absoluteUrl(seo.alternates.canonical);
  const photoJsonLd = jsonLdGraph(
    {
      '@type': 'ImageObject',
      '@id': `${canonicalUrl}#photo`,
      name: photo.title,
      caption: photo.summary,
      description: photo.summary,
      url: canonicalUrl,
      contentUrl: absoluteUrl(socialImage(photo.cover)),
      dateCreated: photo.date,
      inLanguage: contentLanguage(photo.locale),
      keywords: photo.tags,
      creator: { '@id': personId },
      creditText: siteConfig.author,
      copyrightNotice: `© ${siteConfig.author}`,
      isPartOf: { '@id': websiteId },
      ...(photo.location
        ? { contentLocation: { '@type': 'Place', name: photo.location } }
        : {}),
    },
    breadcrumbJsonLd(photo.locale, [
      { name: siteConfig.siteName, href: '/' },
      { name: getDictionary(photo.locale).photography.metadataTitle, href: '/photography' },
      { name: photo.title, href: `/photography/${slug}` },
    ]),
  );

  return (
    <article className="photo-detail">
      {!seo.isFallback && <JsonLd data={photoJsonLd} />}
      <div className="site-container">
        <Link href={localizeHref(lang, '/photography')} className="back-link">
          <ArrowLeft /> {dictionary.back}
        </Link>
        <header>
          <span>
            FRAME {String(frameIndex + 1).padStart(2, '0')} /{' '}
            {String(photoIndex.length).padStart(2, '0')}
            <br />
            {photo.location} · {formatDate(photo.date, lang)}
          </span>
          <h1 data-document-title>{photo.title}</h1>
          <div className="photo-detail-summary">
            <p data-document-summary>{photo.summary}</p>
            <ArticleAudioPlayer
              source={{
                id: `photo:${photo.slug}:${photo.updated ?? photo.date}`,
                title: photo.title,
                summary: photo.summary,
                locale: photo.locale,
              }}
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
      </div>
      {photo.cover && (
        <div className="photo-detail-stage" data-document-cover>
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
          <div className="photo-detail-caption">
            <span>© {translations.footer.author}</span>
            <span>{photo.location} / {photo.date.replaceAll('-', '.')}</span>
          </div>
        </div>
      )}
      <div className="mdx-prose mdx-prose-photo">
        <TiptapContent content={photo.content} fallbackHtml={photo.html} />
      </div>
      <Comments
        locale={lang}
        type="photo"
        slug={slug}
        repo={siteConfig.commentsRepo}
        labels={commentsDictionary}
      />
    </article>
  );
}
