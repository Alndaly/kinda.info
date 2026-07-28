import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectCard } from '@/components/project-card';
import { getEntries } from '@/lib/content';
import { getDictionary, getLocaleAlternates, hasLocale, localizeHref } from '@/lib/i18n';
import { siteConfig } from '@/site.config';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dictionary = getDictionary(lang).projects;
  return {
    title: dictionary.title,
    description: dictionary.description,
    alternates: getLocaleAlternates(lang, '/projects'),
    openGraph: {
      type: 'website',
      siteName: siteConfig.siteName,
      title: dictionary.title,
      description: dictionary.description,
      url: localizeHref(lang, '/projects'),
      locale: lang === 'zh' ? 'zh_CN' : 'en_US',
      images: [{ url: '/og.png', alt: dictionary.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: dictionary.title,
      description: dictionary.description,
      images: ['/og.png'],
    },
  };
}

export default async function ProjectsPage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = getDictionary(lang).projects;
  const projects = getEntries(lang, 'project');

  return (
    <div className="site-container page-top">
      <header className="archive-header archive-header-split">
        <div>
          <span className="section-index">Index / 03</span>
          <h1>{dictionary.title}</h1>
        </div>
        <p>{dictionary.intro}</p>
      </header>
      <div className="grid gap-x-10 gap-y-20 md:grid-cols-2">
        {projects.map((project, index) => (
          <ProjectCard key={project.slug} entry={project} index={index} locale={lang} />
        ))}
      </div>
    </div>
  );
}
