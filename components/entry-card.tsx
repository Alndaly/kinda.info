import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Entry } from '@/.velite';
import { Badge } from '@/components/ui/badge';
import { formatShortDate } from '@/lib/content';
import { getDictionary, type Locale } from '@/lib/i18n';

export type EntryCardEntry = Pick<
  Entry,
  'date' | 'href' | 'locale' | 'slug' | 'summary' | 'tags' | 'title'
>;

export function EntryCard({
  entry,
  index,
  locale = 'zh',
  languageLabel,
}: {
  entry: EntryCardEntry;
  index: number;
  locale?: Locale;
  languageLabel?: string;
}) {
  const readLabel = getDictionary(locale).notes.readAria;

  return (
    <article className="group grid grid-cols-[3.5rem_minmax(0,1fr)_3rem] items-start gap-[clamp(1rem,4vw,3rem)] border-t border-line py-[clamp(2.25rem,4.5vw,3.5rem)] last:border-b to-768:grid-cols-[2rem_minmax(0,1fr)] to-520:gap-[0.7rem]">
      <div className="pt-[0.35rem] font-display text-base italic text-muted-foreground">{String(index + 1).padStart(2, '0')}</div>
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
          {languageLabel ? <span className="rounded-full bg-memo px-[0.55rem] py-[0.3rem] text-[0.52rem] font-extrabold uppercase tracking-[0.08em] text-memo-ink">{languageLabel}</span> : null}
        </div>
        <Link href={entry.href} className="block">
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.02] tracking-[-0.04em] transition-colors group-hover:text-accent">
            {entry.title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {entry.summary}
          </p>
        </Link>
      </div>
      <Link
        className="grid h-11 w-11 place-items-center rounded-full border border-line transition-[transform,translate,scale,rotate,background,color] duration-[240ms] ease-[ease] group-hover:translate-x-[3px] group-hover:-translate-y-[3px] group-hover:border-accent group-hover:bg-accent group-hover:text-white [&>svg]:w-4 to-768:hidden"
        href={entry.href} aria-label={`${readLabel} ${entry.title}`}>
        <ArrowUpRight />
      </Link>
    </article>
  );
}
