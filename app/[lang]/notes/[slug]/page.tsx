import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TiptapContent } from '@/components/tiptap/tiptap-content';
import { allEntries, formatDate, getEntry } from '@/lib/content';
import { getDictionary, getLocaleAlternates, hasLocale, localizeHref } from '@/lib/i18n';

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
  const baseHref = `/notes/${slug}`;
  return {
    title: note.title,
    description: note.summary,
    alternates: getLocaleAlternates(lang, baseHref),
    openGraph: {
      type: 'article',
      title: note.title,
      description: note.summary,
      url: note.href,
      images: ['/og.png'],
    },
  };
}

export default async function NotePage({ params }: Props) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = getDictionary(lang).notes;
  const note = getEntry('note', slug, lang);
  if (!note) notFound();

  return (
    <article>
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
