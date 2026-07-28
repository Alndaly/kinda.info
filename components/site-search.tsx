'use client';

import {
  ArrowUpRight,
  Box,
  Camera,
  FileText,
  Search,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  readTranslationCache,
  translateTexts,
  writeTranslationCache,
} from '@/lib/client-translation';
import type { Locale } from '@/lib/i18n';
import type { SearchRecord } from '@/lib/search';
import { headerControl } from '@/lib/ui-classes';
import { cn } from '@/lib/utils';

type SearchLabels = {
  button: string;
  dialog: string;
  placeholder: string;
  close: string;
  recent: string;
  results: string;
  preparing: string;
  empty: string;
  hint: string;
  types: Record<SearchRecord['type'], string>;
};

function normalize(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().trim();
}

function scoreRecord(record: SearchRecord, query: string) {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return 1;

  const title = normalize(record.title);
  const summary = normalize(record.summary);
  const tags = record.tags.map(normalize);
  const body = normalize(record.body);
  let score = 0;

  for (const token of tokens) {
    let tokenScore = 0;
    if (title === token) tokenScore += 120;
    else if (title.startsWith(token)) tokenScore += 72;
    else if (title.includes(token)) tokenScore += 54;
    if (tags.some((tag) => tag === token)) tokenScore += 42;
    else if (tags.some((tag) => tag.includes(token))) tokenScore += 24;
    if (summary.includes(token)) tokenScore += 16;
    if (body.includes(token)) tokenScore += 5;
    if (!tokenScore) return 0;
    score += tokenScore;
  }

  return score;
}

function ResultIcon({ type }: { type: SearchRecord['type'] }) {
  if (type === 'photo') return <Camera aria-hidden="true" />;
  if (type === 'project') return <Box aria-hidden="true" />;
  return <FileText aria-hidden="true" />;
}

export function SiteSearch({
  locale,
  records,
  labels,
}: {
  locale: Locale;
  records: SearchRecord[];
  labels: SearchLabels;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [localizedRecords, setLocalizedRecords] = useState(records);
  const [translatedQuery, setTranslatedQuery] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);
  const recordsById = useMemo(
    () => new Map(records.map((record) => [record.id, record])),
    [records],
  );
  const hasFallbackRecords = useMemo(
    () => records.some((record) => record.sourceLocale !== locale),
    [locale, records],
  );

  const results = useMemo(() => {
    if (!query.trim()) return localizedRecords.slice(0, 7);
    return localizedRecords
      .map((record) => {
        const directScore = scoreRecord(record, query);
        const sourceRecord = recordsById.get(record.id);
        const sourceScore = translatedQuery && sourceRecord?.sourceLocale === 'zh'
          ? scoreRecord(sourceRecord, translatedQuery)
          : 0;
        return { record, score: Math.max(directScore, sourceScore) };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item) => item.record);
  }, [localizedRecords, query, recordsById, translatedQuery]);

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (locale !== 'en' || !hasFallbackRecords) {
      setLocalizedRecords(records);
      setIsPreparing(false);
      return;
    }
    if (!open) return;

    const fallbackRecords = records.filter((record) => record.sourceLocale !== locale);
    let active = true;
    let nextRecord = 0;
    setIsPreparing(true);

    const translateRecord = async (record: SearchRecord) => {
      const source = [
        record.title,
        record.summary,
        ...record.tags,
        record.body,
      ];
      const cacheKey = `site-search-record:${record.id}`;
      const cached = readTranslationCache(cacheKey, source);
      const translated = cached ?? await translateTexts(source, 'zh', 'en');
      if (!cached) writeTranslationCache(cacheKey, source, translated);
      if (!active) return;
      let cursor = 0;
      const localizedRecord = {
        ...record,
        title: translated[cursor++] || record.title,
        summary: translated[cursor++] || record.summary,
        tags: record.tags.map((tag) => translated[cursor++] || tag),
        body: translated[cursor++] || record.body,
      };
      setLocalizedRecords((current) => (
        current.map((item) => (
          item.id === localizedRecord.id ? localizedRecord : item
        ))
      ));
    };

    const worker = async () => {
      while (nextRecord < fallbackRecords.length) {
        const record = fallbackRecords[nextRecord++];
        try {
          await translateRecord(record);
        } catch {
          // One unavailable translation must not discard the rest of the index.
        }
      }
    };

    void Promise.all(
      Array.from(
        { length: Math.min(4, fallbackRecords.length) },
        () => worker(),
      ),
    ).then(() => {
      if (active) setIsPreparing(false);
    });

    return () => {
      active = false;
    };
  }, [hasFallbackRecords, locale, open, records]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (
      locale !== 'en' ||
      !hasFallbackRecords ||
      !normalizedQuery
    ) {
      setTranslatedQuery('');
      return;
    }

    let active = true;
    setTranslatedQuery('');
    const timeout = window.setTimeout(() => {
      const source = [normalizedQuery];
      const cacheKey = `site-search-query:en-zh:${normalize(normalizedQuery)}`;
      const cached = readTranslationCache(cacheKey, source);
      if (cached) {
        setTranslatedQuery(cached[0] ?? '');
        return;
      }
      void translateTexts(source, 'en', 'zh')
        .then((translated) => {
          if (!active) return;
          writeTranslationCache(cacheKey, source, translated);
          setTranslatedQuery(translated[0] ?? '');
        })
        .catch(() => {
          if (active) setTranslatedQuery('');
        });
    }, 280);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [hasFallbackRecords, locale, query]);

  const openSearch = () => {
    setQuery('');
    setActiveIndex(0);
    setOpen(true);
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, results.length - 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }
    if (event.key === 'Enter' && results[activeIndex]) {
      event.preventDefault();
      setOpen(false);
      router.push(results[activeIndex].href);
    }
  };

  const dialog = open ? (
    <div className="site-search-backdrop" onMouseDown={() => setOpen(false)}>
      <section
        className="site-search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={labels.dialog}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="site-search-input">
          <Search aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            placeholder={labels.placeholder}
            aria-label={labels.placeholder}
            aria-controls="site-search-results"
            aria-activedescendant={results[activeIndex]
              ? `site-search-${results[activeIndex].id.replace(':', '-')}`
              : undefined}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
          />
          <button type="button" onClick={() => setOpen(false)} aria-label={labels.close}>
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="site-search-meta">
          <span>
            {isPreparing
              ? labels.preparing
              : query.trim()
                ? labels.results
                : labels.recent}
          </span>
          <span>{String(results.length).padStart(2, '0')}</span>
        </div>

        <div className="site-search-results" id="site-search-results">
          {results.length ? results.map((record, index) => (
            <Link
              id={`site-search-${record.id.replace(':', '-')}`}
              key={record.id}
              href={record.href}
              data-active={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => setOpen(false)}
            >
              <span className="site-search-result-icon">
                <ResultIcon type={record.type} />
              </span>
              <span className="site-search-result-copy">
                <span>
                  {labels.types[record.type]}
                  {record.tags[0] ? ` / ${record.tags[0]}` : ''}
                </span>
                <strong>{record.title}</strong>
                <small>{record.summary}</small>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          )) : (
            <div className="site-search-empty">
              <Search aria-hidden="true" />
              <p>{labels.empty}</p>
            </div>
          )}
        </div>

        <footer className="site-search-footer">
          <span>{labels.hint}</span>
          <span><kbd>↑</kbd><kbd>↓</kbd><kbd>↵</kbd></span>
        </footer>
      </section>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        className={cn(headerControl, 'site-search-trigger')}
        onClick={openSearch}
        aria-label={labels.button}
        title={labels.button}
      >
        <Search aria-hidden="true" />
        <span>{labels.button}</span>
        <kbd>⌘K</kbd>
      </button>
      {mounted && dialog ? createPortal(dialog, document.body) : null}
    </>
  );
}
