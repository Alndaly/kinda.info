import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Entry } from '@/.velite';
import { Badge } from '@/components/ui/badge';
import { formatShortDate } from '@/lib/content';

export function EntryCard({
  entry,
  index,
}: {
  entry: Entry;
  index: number;
}) {
  return (
    <article className="entry-row group">
      <div className="entry-index">{String(index + 1).padStart(2, '0')}</div>
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {formatShortDate(entry.date)}
          </span>
          {entry.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} className="text-muted-foreground">
              {tag}
            </Badge>
          ))}
        </div>
        <Link href={entry.href} className="block">
          <h2 className="font-display text-[clamp(1.75rem,4vw,3.5rem)] leading-[1.02] tracking-[-0.04em] transition-colors group-hover:text-accent">
            {entry.title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {entry.summary}
          </p>
        </Link>
      </div>
      <Link className="entry-arrow" href={entry.href} aria-label={`阅读 ${entry.title}`}>
        <ArrowUpRight />
      </Link>
    </article>
  );
}
