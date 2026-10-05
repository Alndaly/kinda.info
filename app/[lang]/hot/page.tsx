import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { HOT_SOURCES, getHotSnapshot } from '@/lib/hot/sources';
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

/**
 * The boards are only worth looking at if they are current, and the sources
 * are public endpoints that should not be hammered. Ten minutes is the
 * compromise; each source also caches on its own fetch.
 */
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
    twitter: {
      card: 'summary_large_image',
      title: dictionary.title,
      description: dictionary.description,
      images: ['/og.png'],
    },
  };
}

export default async function HotPage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = getDictionary(lang).hot;
  const { boards, unavailable, fetchedAt } = await getHotSnapshot();

  const updatedLabel = new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-GB', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(new Date(fetchedAt));

  return (
    <div className={cn(siteContainer, pageTop)}>
      <header className={archiveHeader}>
        <span className={sectionIndex}>{dictionary.kicker}</span>
        <h1 className={archiveHeaderTitle}>{dictionary.title}</h1>
        <p className={archiveHeaderText}>{dictionary.intro}</p>
        <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.62rem] font-bold uppercase tracking-[calc(0.14em*var(--tracking-scale))] text-muted-foreground">
          <span className="inline-flex items-center gap-[0.45rem] before:h-[0.45rem] before:w-[0.45rem] before:rounded-full before:bg-accent before:content-['']">
            {dictionary.updated} {updatedLabel}
          </span>
          <span aria-hidden="true">·</span>
          <span>{dictionary.refreshNote}</span>
        </p>
      </header>

      {boards.length === 0 ? (
        <p className="max-w-[34rem] text-[0.95rem] leading-[1.9] text-muted-foreground">
          {dictionary.empty}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-[var(--space-sm)] to-1024:grid-cols-2 to-560:grid-cols-1">
          {boards.map((board) => {
            const meta = HOT_SOURCES.find((source) => source.id === board.id)!;
            return (
              <section key={board.id} className="flex flex-col border-t border-line pt-5">
                <header className="mb-4 flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-[1.45rem] leading-tight tracking-[-0.03em]">
                      {meta.name[lang]}
                    </h2>
                    <span className="mt-[0.2rem] block text-[0.58rem] uppercase tracking-[calc(0.16em*var(--tracking-scale))] text-muted-foreground">
                      {meta.kind[lang]}
                    </span>
                  </div>
                  <a
                    className="inline-flex shrink-0 items-center gap-[0.3rem] text-[0.58rem] uppercase tracking-[0.1em] text-muted-foreground transition-colors duration-[180ms] ease-[ease] hover:text-accent-ink [&>svg]:h-[0.7rem] [&>svg]:w-[0.7rem]"
                    href={meta.site}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {dictionary.openSource}
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </header>

                <ol className="flex flex-col">
                  {board.items.map((item) => (
                    <li key={`${board.id}-${item.rank}`}>
                      <a
                        className="group grid grid-cols-[1.4rem_minmax(0,1fr)] items-baseline gap-3 border-b border-line/60 py-[0.6rem] transition-colors duration-[160ms] ease-[ease] hover:bg-accent/[0.05]"
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {/* The top three carry the accent; past that the rank
                            is reference, not emphasis. */}
                        <span
                          className={cn(
                            'font-mono text-[0.7rem] tabular-nums',
                            item.rank <= 3 ? 'font-bold text-accent-ink' : 'text-muted-foreground',
                          )}
                        >
                          {String(item.rank).padStart(2, '0')}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[0.85rem] leading-[1.6] text-foreground/90 transition-colors duration-[160ms] ease-[ease] group-hover:text-accent-ink">
                            {item.title}
                          </span>
                          {item.heat || item.tag ? (
                            <span className="mt-[0.2rem] flex flex-wrap items-center gap-2 text-[0.58rem] uppercase tracking-[0.08em] text-muted-foreground">
                              {/* A neutral tint, not an accent one: tinting the
                                  ground toward the text colour is what dropped
                                  this pair to 4.22:1 in dark and 3.11:1 in light. */}
                              {item.tag ? (
                                <span className="rounded-[0.2rem] bg-foreground/[0.08] px-[0.3rem] py-[0.05rem] text-foreground/75">
                                  {item.tag}
                                </span>
                              ) : null}
                              {item.heat ? <span>{item.heat}</span> : null}
                            </span>
                          ) : null}
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      )}

      {unavailable.length ? (
        <p className="mt-[var(--space-md)] border-t border-line pt-5 text-[0.62rem] uppercase tracking-[calc(0.14em*var(--tracking-scale))] text-muted-foreground">
          {dictionary.unavailable}:{' '}
          {unavailable
            .map((id) => HOT_SOURCES.find((source) => source.id === id)?.name[lang] ?? id)
            .join(' · ')}
        </p>
      ) : null}
    </div>
  );
}
