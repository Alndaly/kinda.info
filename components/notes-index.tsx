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
    <section className="notes-index" aria-label={labels.filter}>
      <span ref={stickySentinel} className="notes-filter-sentinel" aria-hidden="true" />
      <div className="notes-filter" data-pinned={isPinned}>
        <div className="notes-filter-summary" aria-live="polite">
          <Hash aria-hidden="true" />
          <span>{activeTag ?? labels.tagIndex}</span>
          <strong>
            {filteredEntries.length}{' '}
            {filteredEntries.length === 1 ? labels.result : labels.results}
          </strong>
        </div>
        <div className="notes-filter-track" role="group" aria-label={labels.filter}>
          <button
            type="button"
            className="notes-filter-chip"
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
              className="notes-filter-chip"
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
            className="notes-filter-clear"
            onClick={() => setActiveTag(null)}
          >
            <X aria-hidden="true" />
            {labels.clear}
          </button>
        ) : null}
      </div>

      <div className="notes-results">
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
