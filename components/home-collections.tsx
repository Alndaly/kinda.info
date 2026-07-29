'use client';

import { EntryCard, type EntryCardEntry } from '@/components/entry-card';
import { PhotoCard } from '@/components/photo-card';
import { ProjectCard } from '@/components/project-card';
import { useTranslatedEntries } from '@/components/use-translated-entries';
import type { Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * The home page lists entries that may have no version in the current locale.
 * These three wrappers run the same browser-side translation the notes index
 * uses, so an English visitor does not land on Chinese cards.
 */

type TranslationLabels = {
  machineTranslated: string;
  translatingEntries: string;
};

export function HomeNotes({
  entries,
  locale,
  labels,
}: {
  entries: EntryCardEntry[];
  locale: Locale;
  labels: TranslationLabels;
}) {
  const { entries: notes, isTranslating } = useTranslatedEntries(
    entries,
    locale,
    'home-notes',
  );

  return (
    <>
      {notes.map((note, index) => (
        <EntryCard
          key={`${note.locale}:${note.slug}`}
          entry={note}
          index={index}
          locale={locale}
          languageLabel={note.locale === locale
            ? undefined
            : isTranslating
              ? labels.translatingEntries
              : labels.machineTranslated}
        />
      ))}
    </>
  );
}

/** Photo entries carry a location, which the hook translates alongside the title. */
export function HomePhotos({
  entries,
  locale,
}: {
  entries: Parameters<typeof PhotoCard>[0]['entry'][];
  locale: Locale;
}) {
  const { entries: photos } = useTranslatedEntries(entries, locale, 'home-photos');

  return (
    <div
      className="grid grid-cols-[1.2fr_0.8fr] gap-[1.1rem_2rem] data-[count=1]:grid-cols-[1fr] to-768:grid-cols-[1fr]"
      data-count={Math.min(photos.length, 3)}
    >
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.slug}
          entry={photo}
          priority={index === 0}
          tone="inverse"
          className={index === 0 ? 'row-span-2 to-768:row-auto' : ''}
          frameClassName={cn(
            index === 0 ? 'h-full min-h-[650px]' : 'aspect-video',
            'to-768:aspect-[4/3] to-768:min-h-0',
          )}
        />
      ))}
    </div>
  );
}

export function HomeProjects({
  entries,
  locale,
}: {
  entries: Parameters<typeof ProjectCard>[0]['entry'][];
  locale: Locale;
}) {
  const { entries: projects } = useTranslatedEntries(entries, locale, 'home-projects');

  return (
    <div className="grid gap-12 md:grid-cols-2">
      {projects.map((project, index) => (
        <ProjectCard key={project.slug} entry={project} index={index} locale={locale} />
      ))}
    </div>
  );
}
