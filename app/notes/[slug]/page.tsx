import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TiptapContent } from '@/components/tiptap/tiptap-content';
import { formatDate, getEntry, notes } from '@/lib/content';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return notes.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = getEntry('note', slug);
  if (!note) return {};
  return {
    title: note.title,
    description: note.summary,
    alternates: { canonical: note.href },
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
  const { slug } = await params;
  const note = getEntry('note', slug);
  if (!note) notFound();

  return (
    <article>
      <header className="article-header site-container">
        <Link href="/notes" className="back-link"><ArrowLeft /> 回到笔记</Link>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-7 flex flex-wrap justify-center gap-2">
            {note.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
          </div>
          <h1>{note.title}</h1>
          <p className="article-deck">{note.summary}</p>
          <div className="article-meta">
            <span><CalendarDays /> {formatDate(note.date)}</span>
            <span><Clock3 /> {note.metadata.readingTime} min read</span>
          </div>
        </div>
      </header>
      <div className="article-rule" />
      <div className="mdx-prose">
        <TiptapContent content={note.content} fallbackHtml={note.html} />
      </div>
      <footer className="article-end">
        <span>EOF</span>
        <p>谢谢你读到这里。</p>
        <Link href="/notes">继续漫游笔记</Link>
      </footer>
    </article>
  );
}
