'use client';

import { useEffect, useState } from 'react';
import {
  readTranslationCache,
  translateTexts,
  writeTranslationCache,
} from '@/lib/client-translation';
import type { Locale } from '@/lib/i18n';

/** The text fields worth translating on a card. */
type TranslatableEntry = {
  slug: string;
  locale: string;
  title: string;
  summary: string;
  tags: string[];
  location?: string;
  discipline?: string;
};

/**
 * Entries that have no version in the current locale fall back to the Chinese
 * original, so on the English site their cards would read in Chinese. This
 * translates those cards in the browser and caches the result, which is what
 * the notes index has always done — the home page and the archives use it too.
 *
 * Returns the list unchanged for the Chinese site, and while a translation is
 * still in flight.
 */
export function useTranslatedEntries<T extends TranslatableEntry>(
  entries: T[],
  locale: Locale,
  cacheNamespace: string,
) {
  const [localized, setLocalized] = useState(entries);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const fallbacks = entries.filter((entry) => entry.locale !== locale);
    if (locale !== 'en' || !fallbacks.length) {
      setLocalized(entries);
      setIsTranslating(false);
      return;
    }

    let active = true;
    // one flat list of strings, so the whole page costs a single request
    const source = fallbacks.flatMap((entry) => [
      entry.title,
      entry.summary,
      entry.location ?? '',
      entry.discipline ?? '',
      ...entry.tags,
    ]);
    const cacheKey = `${cacheNamespace}:${fallbacks.map((entry) => entry.slug).join(':')}`;

    const apply = (translated: string[]) => {
      if (!active) return;
      let cursor = 0;
      const bySlug = new Map<string, T>();
      fallbacks.forEach((entry) => {
        bySlug.set(entry.slug, {
          ...entry,
          title: translated[cursor++] || entry.title,
          summary: translated[cursor++] || entry.summary,
          location: translated[cursor++] || entry.location,
          discipline: translated[cursor++] || entry.discipline,
          tags: entry.tags.map((tag) => translated[cursor++] || tag),
        });
      });
      setLocalized(entries.map((entry) => bySlug.get(entry.slug) ?? entry));
      setIsTranslating(false);
    };

    const cached = readTranslationCache(cacheKey, source);
    if (cached) {
      apply(cached);
      return () => {
        active = false;
      };
    }

    setIsTranslating(true);
    void translateTexts(source, 'zh', 'en')
      .then((translated) => {
        writeTranslationCache(cacheKey, source, translated);
        apply(translated);
      })
      .catch(() => {
        if (!active) return;
        setLocalized(entries);
        setIsTranslating(false);
      });

    return () => {
      active = false;
    };
  }, [cacheNamespace, entries, locale]);

  return { entries: localized, isTranslating };
}
