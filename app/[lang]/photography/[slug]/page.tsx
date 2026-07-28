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
import { siteContainer, mdxProse, mdxProsePhoto, backLink, detailTitle } from '@/lib/ui-classes';
import { cn } from '@/lib/utils';

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
    <article className="pt-[clamp(3rem,8vw,7rem)]">
      {!seo.isFallback && <JsonLd data={photoJsonLd} />}
      <div className={siteContainer}>
        <Link href={localizeHref(lang, '/photography')} className={backLink}>
          <ArrowLeft /> {dictionary.back}
        </Link>
        <header
          data-detail-header
          className="mb-12 grid grid-cols-[0.35fr_1.2fr_0.65fr] items-end gap-8 [@media(max-width:768px)]:grid-cols-[1fr]"
        >
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            FRAME {String(frameIndex + 1).padStart(2, '0')} /{' '}
            {String(photoIndex.length).padStart(2, '0')}
            <br />
            {photo.location} · {formatDate(photo.date, lang)}
          </span>
          <h1
            data-document-title
            className={cn(detailTitle, '[@media(max-width:768px)]:order-first')}
          >
            {photo.title}
          </h1>
          <div className="[&_p]:text-[0.9rem] [&_p]:leading-[1.8] [&_p]:text-muted-foreground">
            <p data-document-summary>{photo.summary}</p>
            <ArticleAudioPlayer
              className="mx-0 mt-[1.15rem]"
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
        <div className="mx-auto w-[min(100%-2rem,1440px)]" data-document-cover>
          <div className="relative h-[min(75vw,820px)] w-full overflow-hidden bg-muted [@media(max-width:768px)]:h-[78svh]">
            <Image
              src={photo.cover}
              alt={photo.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="flex justify-between gap-4 pt-3 text-[0.56rem] uppercase tracking-[0.14em] text-muted-foreground">
            <span>© {translations.footer.author}</span>
            <span>{photo.location} / {photo.date.replaceAll('-', '.')}</span>
          </div>
        </div>
      )}
      <div data-prose className={cn(mdxProse, mdxProsePhoto)}>
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
