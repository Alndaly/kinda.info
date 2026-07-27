import { entries, type Entry } from '@/.velite';
import { locales, localizeHref, type Locale } from '@/lib/i18n';

export type EntryType = Entry['type'];

export const allEntries = [...entries].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

export const notes = allEntries.filter((entry) => entry.type === 'note');
export const photos = allEntries.filter((entry) => entry.type === 'photo');
export const projects = allEntries.filter((entry) => entry.type === 'project');

function withLocalizedHref(entry: Entry, locale: Locale): Entry {
  if (entry.locale === locale) return entry;
  const baseHref = entry.href.replace(/^\/en(?=\/|$)/, '') || '/';
  return { ...entry, href: localizeHref(locale, baseHref) };
}

export function getEntries(locale: Locale, type?: EntryType) {
  const localized = allEntries.filter(
    (entry) => entry.locale === locale && (!type || entry.type === type),
  );

  if (locale === 'zh') return localized;

  const translatedKeys = new Set(localized.map((entry) => `${entry.type}:${entry.slug}`));
  const fallbacks = allEntries
    .filter(
      (entry) =>
        entry.locale === 'zh' &&
        (!type || entry.type === type) &&
        !translatedKeys.has(`${entry.type}:${entry.slug}`),
    )
    .map((entry) => withLocalizedHref(entry, locale));

  return [...localized, ...fallbacks].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getEntry(type: EntryType, slug: string, locale: Locale = 'zh') {
  const localized = allEntries.find(
    (entry) => entry.locale === locale && entry.type === type && entry.slug === slug,
  );
  if (localized) return localized;

  const fallback = allEntries.find(
    (entry) => entry.locale === 'zh' && entry.type === type && entry.slug === slug,
  );
  return fallback ? withLocalizedHref(fallback, locale) : undefined;
}

export function getEntrySeo(type: EntryType, slug: string, requestedLocale: Locale) {
  const baseHref = `/${
    type === 'note' ? 'notes' : type === 'photo' ? 'photography' : 'projects'
  }/${slug}`;
  const availableLocales = locales.filter((locale) =>
    allEntries.some(
      (entry) => entry.type === type && entry.slug === slug && entry.locale === locale,
    ),
  );
  const canonicalLocale = availableLocales.includes(requestedLocale)
    ? requestedLocale
    : availableLocales.includes('zh')
      ? 'zh'
      : availableLocales[0];

  const languages: Record<string, string> = {};
  if (availableLocales.includes('zh')) languages['zh-CN'] = baseHref;
  if (availableLocales.includes('en')) languages.en = localizeHref('en', baseHref);
  if (canonicalLocale) languages['x-default'] = localizeHref(canonicalLocale, baseHref);

  return {
    availableLocales,
    canonicalLocale,
    isFallback: canonicalLocale !== requestedLocale,
    alternates: {
      canonical: canonicalLocale ? localizeHref(canonicalLocale, baseHref) : baseHref,
      languages,
    },
  };
}

export function formatDate(
  date: string,
  locale: Locale = 'zh',
  options?: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(date));
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date(date))
    .replaceAll('/', '.');
}
