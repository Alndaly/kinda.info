import { getEntries, type EntryType } from '@/lib/content';
import type { Locale } from '@/lib/i18n';

export type SearchRecord = {
  id: string;
  type: EntryType;
  sourceLocale: Locale;
  title: string;
  summary: string;
  tags: string[];
  href: string;
  date: string;
  body: string;
};

function markdownToSearchText(markdown: string) {
  return markdown
    .replace(/```[\w-]*\n?/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>#~|[\]()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createSearchIndex(locale: Locale): SearchRecord[] {
  return getEntries(locale).map((entry) => ({
    id: `${entry.type}:${entry.slug}`,
    type: entry.type,
    sourceLocale: entry.locale,
    title: entry.title,
    summary: entry.summary,
    tags: entry.tags,
    href: entry.href,
    date: entry.date,
    body: markdownToSearchText(entry.content),
  }));
}
