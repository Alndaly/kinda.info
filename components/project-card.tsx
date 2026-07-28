import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Entry } from '@/.velite';
import { Badge } from '@/components/ui/badge';
import { getDictionary, type Locale } from '@/lib/i18n';

type ProjectStyle = CSSProperties & {
  '--project-accent': string;
};

export function ProjectCard({
  entry,
  index,
  locale = 'zh',
}: {
  entry: Entry;
  index: number;
  locale?: Locale;
}) {
  const dictionary = getDictionary(locale).projects;
  const status = entry.status ?? 'active';
  const style: ProjectStyle = {
    '--project-accent': entry.accent ?? '#e25943',
  };

  return (
    <article className="project-card group" style={style}>
      <Link href={entry.href} className="block">
        <div className="project-identity">
          <span className="project-mark">{entry.mark ?? String(index + 1).padStart(2, '0')}</span>
          <span>{entry.discipline ?? entry.tags.join(' · ')}</span>
          <i aria-hidden="true" />
        </div>
        <div className="project-visual">
          {entry.cover ? (
            <Image
              src={entry.cover}
              alt={entry.title}
              fill
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover opacity-90 transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-accent/15" />
          )}
          <span className="project-color-wash" aria-hidden="true" />
          <span className="project-watermark">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <div className="flex items-start justify-between gap-5 pt-5">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge className="project-status">{dictionary.status[status]}</Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {new Date(entry.date).getFullYear()}
              </span>
            </div>
            <h2 className="font-display text-3xl tracking-[-0.04em] sm:text-4xl">{entry.title}</h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
              {entry.summary}
            </p>
          </div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line transition group-hover:-translate-y-1 group-hover:bg-ink group-hover:text-paper dark:group-hover:bg-paper dark:group-hover:text-ink">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </article>
  );
}
