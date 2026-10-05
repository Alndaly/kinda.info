import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { HOT_SOURCE_META, getHotState, trendOf, type HotEvent } from '@/lib/hot/state';
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

/** The snapshot job runs every half hour; reading it more often finds nothing new. */
export const revalidate = 600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dictionary = getDictionary(lang).hot;
  return {
    title: dictionary.title,
    description: dictionary.description,
    alternates: getLocaleAlternates(lang, '/hot'),
    openGraph: {
      type: 'website',
      siteName: siteConfig.siteName,
      title: dictionary.title,
      description: dictionary.description,
      url: localizeHref(lang, '/hot'),
      locale: lang === 'zh' ? 'zh_CN' : 'en_US',
      images: [{ url: '/og.png', alt: dictionary.title }],
    },
    twitter: { card: 'summary_large_image', title: dictionary.title, description: dictionary.description, images: ['/og.png'] },
  };
}

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus, gone: Minus } as const;
const TREND_TONE = {
  up: 'text-accent-ink',
  down: 'text-muted-foreground',
  flat: 'text-muted-foreground/70',
  gone: 'text-muted-foreground/50',
} as const;

function SourceTrail({ event }: { event: HotEvent }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.58rem] uppercase tracking-[0.08em] text-muted-foreground">
      {event.sources.map((source) => (
        <span key={source.id} className="inline-flex items-center gap-[0.3rem]">
          <span className="font-bold text-foreground/70">{HOT_SOURCE_META[source.id]?.name ?? source.id}</span>
          <span className="font-mono tabular-nums">#{source.rank}</span>
        </span>
      ))}
    </span>
  );
}

export default async function HotPage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = getDictionary(lang).hot;
  const state = await getHotState();

  if (!state) {
    return (
      <div className={cn(siteContainer, pageTop)}>
        <header className={archiveHeader}>
          <span className={sectionIndex}>{dictionary.kicker}</span>
          <h1 className={archiveHeaderTitle}>{dictionary.title}</h1>
          <p className={archiveHeaderText}>{dictionary.intro}</p>
        </header>
        <p className="max-w-[34rem] text-[0.95rem] leading-[1.9] text-muted-foreground">{dictionary.empty}</p>
      </div>
    );
  }

  const zh = lang === 'zh';
  const locale = zh ? 'zh-CN' : 'en-GB';
  const clock = new Intl.DateTimeFormat(locale, { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit' });
  const day = new Intl.DateTimeFormat(locale, { timeZone: 'Asia/Shanghai', month: 'long', day: 'numeric' });
  const weekday = new Intl.DateTimeFormat(locale, { timeZone: 'Asia/Shanghai', weekday: 'long' });

  const live = state.events.filter((event) => event.heat > 0);
  // Not by the heat score. Six boards means six #1s with identical scores, so
  // ranking on it produces a six-way tie that reads as a bug. These three are
  // quantities the data actually supports: how many outlets carry it, how long
  // it has held, and how high it has climbed. (heat stays for the trend arrow,
  // which compares an event to itself — valid where cross-event ranking is not.)
  const bestRank = (event: HotEvent) => Math.min(...event.sources.map((s) => s.rank));
  const leaders = live
    .slice()
    .sort(
      (a, b) =>
        b.sources.length - a.sources.length ||
        b.polls - a.polls ||
        bestRank(a) - bestRank(b),
    )
    .slice(0, 8);

  // The timeline is the point: events in the order they first appeared, not
  // in the order a board happens to rank them right now.
  const byDay = new Map<string, HotEvent[]>();
  for (const event of state.events) {
    const key = day.format(new Date(event.firstSeen));
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(event);
  }

  return (
    <div className={cn(siteContainer, pageTop)}>
      <header className={archiveHeader}>
        <span className={sectionIndex}>{dictionary.kicker}</span>
        <h1 className={archiveHeaderTitle}>{dictionary.title}</h1>
        <p className={archiveHeaderText}>{dictionary.intro}</p>
        <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.62rem] font-bold uppercase tracking-[calc(0.14em*var(--tracking-scale))] text-muted-foreground">
          <span className="inline-flex items-center gap-[0.45rem] before:h-[0.45rem] before:w-[0.45rem] before:rounded-full before:bg-accent before:content-['']">
            {dictionary.updated} {clock.format(new Date(state.updatedAt))}
          </span>
          <span aria-hidden="true">·</span>
          <span>{dictionary.tracking.replace('{n}', String(state.events.length))}</span>
          {state.unavailable.length ? (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {dictionary.unavailable}:{' '}
                {state.unavailable.map((id) => HOT_SOURCE_META[id]?.name ?? id).join(' · ')}
              </span>
            </>
          ) : null}
        </p>
      </header>

      {leaders.length ? (
        <section className="mb-[var(--space-xl)] border-t border-line pt-6">
          <h2 className="mb-5 text-[0.62rem] font-bold uppercase tracking-[calc(0.18em*var(--tracking-scale))] text-muted-foreground">
            {dictionary.leaders}
          </h2>
          <ol className="flex flex-col">
            {leaders.map((event, index) => {
              const trend = trendOf(event);
              const Icon = TREND_ICON[trend];
              return (
                <li key={event.id}>
                  <a
                    className="group grid grid-cols-[1.6rem_minmax(0,1fr)_auto] items-baseline gap-4 border-b border-line/60 py-[0.7rem] transition-colors duration-[160ms] ease-[ease] hover:bg-accent/[0.05]"
                    href={event.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className={cn('font-mono text-[0.8rem] tabular-nums', index < 3 ? 'font-bold text-accent-ink' : 'text-muted-foreground')}>
                      #{bestRank(event)}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.95rem] leading-[1.55] text-foreground/90 transition-colors duration-[160ms] ease-[ease] group-hover:text-accent-ink">
                        {event.title}
                      </span>
                      <span className="mt-[0.3rem] flex flex-wrap items-center gap-x-3 gap-y-1">
                        <SourceTrail event={event} />
                        {event.sources.length > 1 ? (
                          <span className="rounded-[0.2rem] bg-foreground/[0.08] px-[0.3rem] py-[0.05rem] text-[0.58rem] font-bold text-foreground/75">
                            +{event.sources.length}
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-[0.58rem] uppercase tracking-[0.08em] text-muted-foreground">
                      {dictionary.held.replace('{n}', String(event.polls))}
                      <Icon aria-hidden="true" className={cn('h-[0.85rem] w-[0.85rem]', TREND_TONE[trend])} />
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      <section>
        <h2 className="mb-5 text-[0.62rem] font-bold uppercase tracking-[calc(0.18em*var(--tracking-scale))] text-muted-foreground">
          {dictionary.timeline}
        </h2>
        {[...byDay.entries()].map(([label, events]) => (
          <div key={label} className="mb-[var(--space-lg)]">
            <div className="mb-4 flex items-baseline gap-3 border-t border-line pt-4">
              <h3 className="font-display text-[1.5rem] leading-none tracking-[-0.03em]">{label}</h3>
              <span className="text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
                {weekday.format(new Date(events[0].firstSeen))} · {dictionary.count.replace('{n}', String(events.length))}
              </span>
            </div>
            <ol className="flex flex-col">
              {events.map((event) => {
                const trend = trendOf(event);
                const Icon = TREND_ICON[trend];
                return (
                  <li key={event.id}>
                    <a
                      className="group grid grid-cols-[3.2rem_minmax(0,1fr)] gap-4 border-b border-line/50 py-[0.85rem] transition-colors duration-[160ms] ease-[ease] hover:bg-accent/[0.05] to-520:grid-cols-[1fr]"
                      href={event.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <time
                        className="pt-[0.1rem] font-mono text-[0.68rem] tabular-nums text-muted-foreground"
                        dateTime={event.firstSeen}
                      >
                        {clock.format(new Date(event.firstSeen))}
                      </time>
                      <span className="min-w-0">
                        <span className="flex items-start gap-2">
                          <span className={cn('block text-[0.95rem] leading-[1.55] transition-colors duration-[160ms] ease-[ease] group-hover:text-accent-ink', event.heat === 0 ? 'text-muted-foreground' : 'text-foreground/90')}>
                            {event.title}
                          </span>
                          <Icon aria-hidden="true" className={cn('mt-[0.3rem] h-[0.8rem] w-[0.8rem] shrink-0', TREND_TONE[trend])} />
                        </span>
                        {event.blurb ? (
                          <span className="mt-[0.25rem] block text-[0.8rem] leading-[1.7] text-muted-foreground">{event.blurb}</span>
                        ) : null}
                        <span className="mt-[0.35rem] flex flex-wrap items-center gap-x-3 gap-y-1">
                          <SourceTrail event={event} />
                          {event.polls > 1 ? (
                            <span className="text-[0.58rem] uppercase tracking-[0.08em] text-muted-foreground">
                              {dictionary.held.replace('{n}', String(event.polls))}
                            </span>
                          ) : null}
                          {event.heat === 0 ? (
                            <span className="text-[0.58rem] uppercase tracking-[0.08em] text-muted-foreground/70">
                              {dictionary.dropped}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </section>

      <p className="mt-[var(--space-md)] border-t border-line pt-5 text-[0.62rem] leading-[1.9] text-muted-foreground">
        {dictionary.method}{' '}
        <a className="text-accent-ink underline underline-offset-[0.2em]" href={`https://github.com/${siteConfig.commentsRepo}/blob/master/scripts/hot-snapshot.mjs`} target="_blank" rel="noreferrer">
          {dictionary.methodLink} <ArrowUpRight aria-hidden="true" className="inline h-[0.7rem] w-[0.7rem]" />
        </a>
      </p>
    </div>
  );
}
