import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { ArticleAudioPlayer } from '@/components/article-language-tools';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Comments } from '@/components/comments';
import { JsonLd } from '@/components/json-ld';
import { TiptapContent } from '@/components/tiptap/tiptap-content';
import { allEntries, getEntry, getEntrySeo } from '@/lib/content';
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
import { siteContainer, projectStatus } from '@/lib/ui-classes';

type Props = { params: Promise<{ lang: string; slug: string }> };
type ProjectStyle = CSSProperties & { '--project-accent': string };

export function generateStaticParams() {
  return Array.from(
    new Set(allEntries.filter((entry) => entry.type === 'project').map((entry) => entry.slug)),
  ).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const project = getEntry('project', slug, lang);
  if (!project) return {};
  const seo = getEntrySeo('project', slug, lang);
  const image = socialImage(project.cover);
  return {
    title: project.title,
    description: project.summary,
    keywords: project.tags,
    authors: [{ name: siteConfig.author, url: localizeHref(lang, '/about') }],
    alternates: seo.alternates,
    robots: seo.isFallback ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      siteName: siteConfig.siteName,
      title: project.title,
      description: project.summary,
      url: seo.alternates.canonical,
      locale: project.locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: seo.availableLocales
        .filter((locale) => locale !== project.locale)
        .map((locale) => (locale === 'zh' ? 'zh_CN' : 'en_US')),
      images: [{ url: image, alt: project.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.summary,
      images: [image],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const translations = getDictionary(lang);
  const dictionary = translations.projects;
  const speechDictionary = translations.speech;
  const commentsDictionary = translations.comments;
  const project = getEntry('project', slug, lang);
  if (!project) notFound();
  const seo = getEntrySeo('project', slug, lang);
  const status = project.status ?? 'active';
  const projectStyle: ProjectStyle = {
    '--project-accent': project.accent ?? '#e25943',
  };
  const canonicalUrl = absoluteUrl(seo.alternates.canonical);
  const projectJsonLd = jsonLdGraph(
    {
      '@type': 'CreativeWork',
      '@id': `${canonicalUrl}#project`,
      name: project.title,
      headline: project.title,
      description: project.summary,
      url: canonicalUrl,
      dateCreated: project.date,
      inLanguage: contentLanguage(project.locale),
      image: absoluteUrl(socialImage(project.cover)),
      keywords: project.tags,
      author: { '@id': personId },
      isPartOf: { '@id': websiteId },
      ...(project.link ? { sameAs: project.link } : {}),
    },
    breadcrumbJsonLd(project.locale, [
      { name: siteConfig.siteName, href: '/' },
      { name: getDictionary(project.locale).projects.title, href: '/projects' },
      { name: project.title, href: `/projects/${slug}` },
    ]),
  );

  return (
    <article className="project-detail" style={projectStyle}>
      {!seo.isFallback && <JsonLd data={projectJsonLd} />}
      <header className={`${siteContainer} project-detail-header`}>
        <Link href={localizeHref(lang, '/projects')} className="back-link">
          <ArrowLeft /> {dictionary.back}
        </Link>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <div className="project-detail-identity">
              <span>{project.mark ?? 'K'}</span>
              <p>{project.discipline ?? project.tags.join(' · ')}</p>
            </div>
            <div className="mb-6 flex gap-2">
              <Badge className={projectStatus}>{dictionary.status[status]}</Badge>
              {project.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
            </div>
            <h1 data-document-title>{project.title}</h1>
            <p data-document-summary>{project.summary}</p>
            {project.link && (
              <Button asChild className="project-visit mt-8 rounded-full">
                <Link href={project.link} target="_blank">
                  {dictionary.visit} <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            <ArticleAudioPlayer
              source={{
                id: `project:${project.slug}:${project.updated ?? project.date}`,
                title: project.title,
                summary: project.summary,
                locale: project.locale,
                accent: project.accent,
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
          {project.cover && (
            <div className="project-detail-visual" data-document-cover>
              <Image
                src={project.cover}
                alt={project.title}
                fill
                priority
                sizes="50vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </header>
      <div className="mdx-prose">
        <TiptapContent content={project.content} fallbackHtml={project.html} />
      </div>
      <Comments
        locale={lang}
        type="project"
        slug={slug}
        repo={siteConfig.commentsRepo}
        labels={commentsDictionary}
      />
    </article>
  );
}
