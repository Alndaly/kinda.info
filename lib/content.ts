import { entries, type Entry } from '@/.velite';

export type EntryType = Entry['type'];

export const allEntries = [...entries].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

export const notes = allEntries.filter((entry) => entry.type === 'note');
export const photos = allEntries.filter((entry) => entry.type === 'photo');
export const projects = allEntries.filter((entry) => entry.type === 'project');

export function getEntry(type: EntryType, slug: string) {
  return allEntries.find((entry) => entry.type === type && entry.slug === slug);
}

export function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('zh-CN', {
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
