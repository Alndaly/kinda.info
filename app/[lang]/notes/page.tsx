import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EntryCard } from '@/components/entry-card';
import { getEntries } from '@/lib/content';
import { getDictionary, getLocaleAlternates, hasLocale, localizeHref } from '@/lib/i18n';
import { siteConfig } from '@/site.config';

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
  const tags = Array.from(new Set(notes.flatMap((note) => note.tags)));

  return (
    <div className="site-container page-top">
      <header className="archive-header">
        <span className="section-index">Index / 01</span>
        <h1>{dictionary.title}</h1>
        <p>{dictionary.intro}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {tags.map((tag) => <span key={tag} className="tag-chip">#{tag}</span>)}
        </div>
      </header>
      <div className="border-t border-line">
        {notes.map((note, index) => (
          <EntryCard key={note.slug} entry={note} index={index} locale={lang} />
        ))}
      </div>
    </div>
  );
}
