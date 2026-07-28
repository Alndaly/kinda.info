import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Entry } from '@/.velite';
import { Badge } from '@/components/ui/badge';
import { getDictionary, type Locale } from '@/lib/i18n';
import { projectStatus } from '@/lib/ui-classes';

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
    <article className="group relative" style={style}>
      <Link href={entry.href} className="block">
        <div className="mb-[0.8rem] grid grid-cols-[auto_auto_minmax(2rem,1fr)] items-center gap-[0.7rem] text-[0.56rem] uppercase tracking-[0.15em] text-muted-foreground">
          <span className="grid h-8 min-w-8 place-items-center rounded-full bg-[var(--project-accent)] font-display text-[0.8rem] font-bold tracking-[-0.02em] text-white">{entry.mark ?? String(index + 1).padStart(2, '0')}</span>
          <span>{entry.discipline ?? entry.tags.join(' · ')}</span>
          <i
            aria-hidden="true"
            className="h-px bg-[linear-gradient(to_right,var(--project-accent),hsl(var(--line)))] opacity-70"
          />
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[0.25rem] border border-[color-mix(in_srgb,var(--project-accent)_38%,hsl(var(--line)))] bg-muted after:absolute after:inset-0 after:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] after:content-['']">
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
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--project-accent)_22%,transparent),transparent_45%),linear-gradient(to_top,rgba(0,0,0,0.15),transparent_35%)] mix-blend-screen transition-opacity duration-[400ms] ease-[ease] group-hover:opacity-[0.72]"
          />
          <span className="absolute -bottom-[0.2rem] right-[0.8rem] z-[2] font-display text-[clamp(4rem,10vw,7rem)] leading-none tracking-[-0.08em] text-white/[0.72]">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <div className="flex items-start justify-between gap-5 pt-5">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge className={projectStatus}>{dictionary.status[status]}</Badge>
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
