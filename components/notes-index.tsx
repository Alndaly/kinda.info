'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Hash, X } from 'lucide-react';
import { EntryCard, type EntryCardEntry } from '@/components/entry-card';
import {
  readTranslationCache,
  translateTexts,
  writeTranslationCache,
} from '@/lib/client-translation';
import type { Locale } from '@/lib/i18n';

type Labels = {
  all: string;
  clear: string;
  filter: string;
  tagIndex: string;
  machineTranslated: string;
  translatingEntries: string;
  result: string;
  results: string;
};


const notesFilter = [
  'group/filter sticky top-[4.65rem] z-30 mb-5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4',
  'rounded-full border border-line bg-paper/90 p-[0.8rem] backdrop-blur-[18px] backdrop-saturate-[1.35]',
  'data-[pinned=true]:grid-cols-[minmax(0,1fr)_auto] data-[pinned=true]:gap-[0.65rem]',
  'data-[pinned=true]:rounded-none data-[pinned=true]:border-x-0 data-[pinned=true]:px-0 data-[pinned=true]:py-[0.55rem]',
  'data-[pinned=true]:bg-paper/[0.96] data-[pinned=true]:shadow-[0_16px_30px_-27px_hsl(var(--ink)/0.7)]',
  'to-768:top-0 to-768:grid-cols-[minmax(0,1fr)_auto]',
  'to-768:gap-[0.65rem] to-768:rounded-xl',
].join(' ');

const notesFilterSummary = [
  'flex min-w-max items-center gap-[0.45rem] pl-[0.35rem] text-[0.66rem] tracking-[0.06em]',
  'group-data-[pinned=true]/filter:hidden to-768:min-w-0',
  '[&>svg]:w-[0.85rem] [&>svg]:text-accent',
  '[&>strong]:text-[0.58rem] [&>strong]:font-semibold [&>strong]:text-muted-foreground',
  'to-520:[&>strong]:hidden',
].join(' ');

const notesFilterTrack = [
  'flex min-w-0 gap-[0.45rem] overflow-x-auto px-[0.8rem] [scrollbar-width:none]',
  '[mask-image:linear-gradient(to_right,transparent,black_0.8rem,black_calc(100%-0.8rem),transparent)]',
  '[&::-webkit-scrollbar]:hidden',
  'group-data-[pinned=true]/filter:px-0',
  'to-768:col-span-full to-768:px-0',
].join(' ');

const notesFilterChip = [
  'inline-flex min-w-max items-center gap-[0.45rem] rounded-full border border-line bg-transparent',
  'px-[0.7rem] py-2 text-[0.62rem] text-muted-foreground',
  'transition-[border-color,color,background-color] duration-[180ms] ease-[ease]',
  'hover:border-ink/55 hover:text-ink',
  'data-[active=true]:border-memo data-[active=true]:bg-memo data-[active=true]:text-memo-ink',
  '[&>span]:grid [&>span]:h-[1.15rem] [&>span]:min-w-[1.15rem] [&>span]:place-items-center',
  '[&>span]:rounded-full [&>span]:bg-muted [&>span]:text-[0.5rem]',
  'data-[active=true]:[&>span]:bg-memo-ink/[0.12]',
].join(' ');

const notesFilterClear = [
  'inline-flex min-w-max items-center gap-[0.35rem] pr-[0.35rem] text-[0.58rem] text-muted-foreground',
  'to-520:text-[0px]',
  '[&>svg]:w-[0.75rem] to-520:[&>svg]:w-[0.9rem]',
].join(' ');

export function NotesIndex({
  entries,
  labels,
  locale,
}: {
  entries: EntryCardEntry[];
  labels: Labels;
  locale: Locale;
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [localizedEntries, setLocalizedEntries] = useState(entries);
  const [isTranslating, setIsTranslating] = useState(false);
  const stickySentinel = useRef<HTMLSpanElement>(null);
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of localizedEntries) {
      for (const tag of entry.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()].sort(
      ([tagA, countA], [tagB, countB]) =>
        countB - countA || tagA.localeCompare(tagB, locale === 'zh' ? 'zh-CN' : 'en'),
    );
  }, [localizedEntries, locale]);
  const filteredEntries = activeTag
    ? localizedEntries.filter((entry) => entry.tags.includes(activeTag))
    : localizedEntries;

  useEffect(() => {
    const fallbackEntries = entries.filter((entry) => entry.locale !== locale);
    if (locale !== 'en' || !fallbackEntries.length) {
      setLocalizedEntries(entries);
      setIsTranslating(false);
      return;
    }

    let active = true;
    const source = fallbackEntries.flatMap((entry) => [
      entry.title,
      entry.summary,
      ...entry.tags,
    ]);
    const cacheKey = `notes-index:${fallbackEntries.map((entry) => entry.slug).join(':')}`;
    const applyTranslations = (translated: string[]) => {
      if (!active) return;
      let cursor = 0;
      const translatedBySlug = new Map<string, EntryCardEntry>();
      fallbackEntries.forEach((entry) => {
        translatedBySlug.set(entry.slug, {
          ...entry,
          title: translated[cursor++] || entry.title,
          summary: translated[cursor++] || entry.summary,
          tags: entry.tags.map((tag) => translated[cursor++] || tag),
        });
      });
      setLocalizedEntries(
        entries.map((entry) => translatedBySlug.get(entry.slug) ?? entry),
      );
      setActiveTag(null);
      setIsTranslating(false);
    };
    const cached = readTranslationCache(cacheKey, source);
    if (cached) {
      applyTranslations(cached);
      return () => {
        active = false;
      };
    }

    setIsTranslating(true);
    void translateTexts(source, 'zh', 'en')
      .then((translated) => {
        writeTranslationCache(cacheKey, source, translated);
        applyTranslations(translated);
      })
      .catch(() => {
        if (!active) return;
        setLocalizedEntries(entries);
        setIsTranslating(false);
      });

    return () => {
      active = false;
    };
  }, [entries, locale]);

  useEffect(() => {
    const sentinel = stickySentinel.current;
    if (!sentinel) return;

    const stickyTop = window.matchMedia('(max-width: 768px)').matches ? 0 : 75;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPinned(!entry.isIntersecting && entry.boundingClientRect.top < stickyTop);
      },
      { rootMargin: `-${stickyTop}px 0px 0px` },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative" aria-label={labels.filter}>
      <span
        ref={stickySentinel}
        className="-mb-px block h-px w-full"
        aria-hidden="true"
      />
      <div className={notesFilter} data-pinned={isPinned}>
        <div className={notesFilterSummary} aria-live="polite">
          <Hash aria-hidden="true" />
          <span>{activeTag ?? labels.tagIndex}</span>
          <strong>
            {filteredEntries.length}{' '}
            {filteredEntries.length === 1 ? labels.result : labels.results}
          </strong>
        </div>
        <div className={notesFilterTrack} role="group" aria-label={labels.filter}>
          <button
            type="button"
            className={notesFilterChip}
            data-active={!activeTag}
            aria-pressed={!activeTag}
            onClick={() => setActiveTag(null)}
          >
            {labels.all}
            <span>{localizedEntries.length}</span>
          </button>
          {tags.map(([tag, count]) => (
            <button
              key={tag}
              type="button"
              className={notesFilterChip}
              data-active={activeTag === tag}
              aria-pressed={activeTag === tag}
              onClick={() => setActiveTag(tag)}
            >
              #{tag}
              <span>{count}</span>
            </button>
          ))}
        </div>
        {activeTag ? (
          <button
            type="button"
            className={notesFilterClear}
            onClick={() => setActiveTag(null)}
          >
            <X aria-hidden="true" />
            {labels.clear}
          </button>
        ) : null}
      </div>

      <div className="border-t border-line">
        {filteredEntries.map((entry, index) => (
          <EntryCard
            key={`${entry.locale}:${entry.slug}`}
            entry={entry}
            index={index}
            locale={locale}
            languageLabel={entry.locale === locale
              ? undefined
              : isTranslating
                ? labels.translatingEntries
                : labels.machineTranslated}
          />
        ))}
      </div>
    </section>
  );
}
