import type { Metadata } from 'next';
import { EntryCard } from '@/components/entry-card';
import { notes } from '@/lib/content';

export const metadata: Metadata = {
  title: '笔记',
  description: '关于开发、设计与生活的长期笔记。',
};

export default function NotesPage() {
  const tags = Array.from(new Set(notes.flatMap((note) => note.tags)));

  return (
    <div className="site-container page-top">
      <header className="archive-header">
        <span className="section-index">Index / 01</span>
        <h1>笔记</h1>
        <p>写给未来的自己，也写给偶然路过的你。这里没有信息流，只有值得慢一点读的东西。</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {tags.map((tag) => <span key={tag} className="tag-chip">#{tag}</span>)}
        </div>
      </header>
      <div className="border-t border-line">
        {notes.map((note, index) => (
          <EntryCard key={note.slug} entry={note} index={index} />
        ))}
      </div>
    </div>
  );
}
