import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NotesIndex } from '@/components/notes-index';
import { getEntries } from '@/lib/content';
import { getDictionary, getLocaleAlternates, hasLocale, localizeHref } from '@/lib/i18n';
import { siteConfig } from '@/site.config';
import {
  archiveHeader,
  archiveHeaderText,
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
  const dictionary = getDictionary(lang).notes;
  return {
    title: dictionary.title,
    description: dictionary.description,
    alternates: getLocaleAlternates(lang, '/notes'),
    openGraph: {
      type: 'website',
      siteName: siteConfig.siteName,
      title: dictionary.title,
      description: dictionary.description,
      url: localizeHref(lang, '/notes'),
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

export default async function NotesPage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = getDictionary(lang).notes;
  const notes = getEntries(lang, 'note');
  const previews = notes.map(({ date, href, locale, slug, summary, tags, title }) => ({
    date,
    href,
    locale,
    slug,
    summary,
    tags,
    title,
  }));

  return (
    <div className={cn(siteContainer, pageTop)}>
      <header className={archiveHeader}>
        <span className={sectionIndex}>Index / 01</span>
        <h1 className={archiveHeaderTitle}>{dictionary.title}</h1>
        <p className={archiveHeaderText}>{dictionary.intro}</p>
      </header>
      <NotesIndex
        entries={previews}
        locale={lang}
        labels={{
          all: dictionary.all,
          clear: dictionary.clearFilter,
          filter: dictionary.filterByTag,
          tagIndex: dictionary.tagIndex,
          machineTranslated: dictionary.machineTranslated,
          translatingEntries: dictionary.translatingEntries,
          result: dictionary.result,
          results: dictionary.results,
        }}
      />
    </div>
  );
}
