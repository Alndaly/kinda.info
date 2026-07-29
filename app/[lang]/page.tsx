import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EntryCard } from '@/components/entry-card';
import { PhotoCard } from '@/components/photo-card';
import { ProjectCard } from '@/components/project-card';
import { getEntries } from '@/lib/content';
import { getDictionary, hasLocale, localizeHref } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import {
  sectionHeading,
  sectionHeadingTitle,
  sectionIndex,
  sectionSpace,
  siteContainer,
  textLink,
} from '@/lib/ui-classes';
import { cn } from '@/lib/utils';

/** Shrinks to just its arrow on the narrowest screens. */
const sectionHeadingLink = cn(
  textLink,
  'to-520:border-0 to-520:text-[0px]',
  'to-520:[&>svg]:h-[1.2rem] to-520:[&>svg]:w-[1.2rem]',
);

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = getDictionary(lang).home;
  const notes = getEntries(lang, 'note');
  const photos = getEntries(lang, 'photo');
  const projects = getEntries(lang, 'project');
  const featuredNote = notes.find((entry) => entry.featured) ?? notes[0];

  return (
    <>
      <section
        className={cn(
          siteContainer,
          'relative flex min-h-[calc(100svh-74px)] flex-col justify-center py-[clamp(3rem,8vw,7rem)]',
          'to-768:min-h-[auto]',
        )}
      >
        <div className="grid grid-cols-[minmax(0,1.03fr)_minmax(360px,0.97fr)] gap-[clamp(2rem,6vw,7rem)] to-1024:grid-cols-[1fr]">
          <div className="relative z-[1] flex flex-col justify-between py-4 lg:py-10">
            <div>
              <Badge className="mb-8 border-accent/25 text-accent">
                <Sparkles className="mr-1.5 h-3 w-3" />
                {dictionary.archive}
              </Badge>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {dictionary.eyebrow}
              </p>
              <h1 className="mt-[clamp(1.25rem,2.4vw,2.25rem)] flex items-end gap-[0.08em] font-display text-[clamp(6.5rem,15vw,13rem)] font-semibold leading-[0.72] tracking-[-0.095em] to-768:text-[clamp(5rem,29vw,8.5rem)] to-520:text-[25vw]">
                Kinda
                <span className="-mb-[0.2rem] font-display text-[clamp(1rem,2vw,1.55rem)] leading-none tracking-[0.35em] text-accent [writing-mode:vertical-rl]">
                  {dictionary.displayName}
                </span>
              </h1>
              <p className="mt-8 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                {dictionary.intro[0]}
                <br className="hidden sm:block" />
                {dictionary.intro[1]}
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-ink px-6 text-paper hover:bg-accent hover:text-white">
                <Link href={localizeHref(lang, '/notes')}>
                  {dictionary.read} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-line bg-transparent px-6 shadow-none">
                <Link href={localizeHref(lang, '/photography')}>{dictionary.seeWorld}</Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[600px] to-1024:mx-auto to-1024:min-h-[590px] to-1024:w-[min(100%,680px)] to-768:min-h-[460px]">
            <div className="absolute inset-[2%_5%_8%_10%] overflow-hidden rounded-[50%_50%_3%_3%/38%_38%_3%_3%] bg-muted shadow-[0_30px_80px_rgba(41,37,25,0.16)] rotate-[1.5deg] after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_top,rgba(15,14,11,0.42),transparent_45%)] after:content-[''] to-768:inset-[1.5rem_1rem_2.5rem_0]">
              <Image
                src="/images/july-portrait.jpg"
                alt={dictionary.photoAlt}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 42vw"
                className="object-cover"
              />
              <span className="absolute bottom-[1.2rem] left-[1.2rem] z-[1] text-[0.58rem] tracking-[0.2em] text-white">
                ON THE ROAD / JULY
              </span>
            </div>
            <div
              className="absolute right-[clamp(1.5rem,3vw,2.25rem)] top-0 z-[2] grid h-32 w-32 animate-slow-spin place-items-center rounded-full border border-accent/45 text-accent after:absolute after:text-[1.1rem] after:content-['✦'] [&>svg]:h-full [&>svg]:w-full [&>svg]:overflow-visible to-768:right-6 to-768:h-24 to-768:w-24"
              aria-hidden="true"
            >
              <svg viewBox="0 0 120 120" role="presentation">
                <defs>
                  <path
                    id="hero-stamp-orbit"
                    d="M 60 8 A 52 52 0 1 1 59.99 8"
                  />
                </defs>
                <text className="fill-current font-sans text-[7px] font-[750] tracking-[1.35px]">
                  <textPath href="#hero-stamp-orbit" startOffset="1%">
                    KEEP CURIOUS · STAY SOFT · KEEP CURIOUS · STAY SOFT ·
                  </textPath>
                </text>
              </svg>
            </div>
            <div className="absolute bottom-[2%] right-[clamp(0.75rem,1.5vw,1rem)] z-[3] w-52 -rotate-[3.5deg] bg-memo p-[1.2rem] text-memo-ink shadow-[0_16px_35px_rgba(28,27,20,0.18)] to-768:right-4 to-768:w-[10.5rem] to-768:p-[0.9rem]">
              <span className="text-[0.58rem] font-bold uppercase tracking-[0.18em]">
                {dictionary.noteLabel}
              </span>
              <p className="mt-4 font-display text-[1.25rem] leading-[1.55] to-768:text-[1rem]">
                {dictionary.note[0]}<br />{dictionary.note[1]}
              </p>
              <i className="mt-4 block text-right font-display">— J.</i>
            </div>
          </div>
        </div>
        <a
          href="#latest"
          className="absolute bottom-6 left-0 flex items-center gap-[0.55rem] text-[0.58rem] font-bold uppercase tracking-[0.2em] text-muted-foreground [&>svg]:animate-nudge-down to-1024:hidden"
        >
          <ArrowDown className="h-4 w-4" />
          {dictionary.scroll}
        </a>
      </section>

      <section id="latest" className={cn(siteContainer, sectionSpace)}>
        <div className={sectionHeading}>
          <div>
            <span className={sectionIndex}>01 / Notes</span>
            <h2 className={sectionHeadingTitle}>{dictionary.recentThoughts}</h2>
          </div>
          <Link href={localizeHref(lang, '/notes')} className={sectionHeadingLink}>
            {dictionary.allNotes} <ArrowUpRight />
          </Link>
        </div>
        {featuredNote && <EntryCard entry={featuredNote} index={0} locale={lang} />}
        {notes.slice(0, 3).filter((note) => note.slug !== featuredNote?.slug).map((note, index) => (
          <EntryCard key={note.slug} entry={note} index={index + 1} locale={lang} />
        ))}
      </section>

      <section
        className={cn(
          sectionSpace,
          'overflow-hidden border-y border-inverse-line bg-inverse-background text-inverse-foreground',
        )}
      >
        <div className={siteContainer}>
          <div className={sectionHeading}>
            <div>
              <span className={cn(sectionIndex, 'text-inverse-muted')}>02 / Frames</span>
              <h2 className={sectionHeadingTitle}>{dictionary.recentFrames}</h2>
            </div>
            <Link
              href={localizeHref(lang, '/photography')}
              className={cn(sectionHeadingLink, 'text-inverse-foreground hover:text-white')}
            >
              {dictionary.allFrames} <ArrowUpRight />
            </Link>
          </div>
          <div
            className="grid grid-cols-[1.2fr_0.8fr] gap-[1.1rem_2rem] data-[count=1]:grid-cols-[1fr] to-768:grid-cols-[1fr]"
            data-count={Math.min(photos.length, 3)}
          >
            {photos.slice(0, 3).map((photo, index) => (
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
        </div>
      </section>

      <section className={cn(siteContainer, sectionSpace)}>
        <div className={sectionHeading}>
          <div>
            <span className={sectionIndex}>03 / Things</span>
            <h2 className={sectionHeadingTitle}>{dictionary.recentProjects}</h2>
          </div>
          <Link href={localizeHref(lang, '/projects')} className={sectionHeadingLink}>
            {dictionary.allProjects} <ArrowUpRight />
          </Link>
        </div>
        <div className="grid gap-12 md:grid-cols-2">
          {projects.slice(0, 2).map((project, index) => (
            <ProjectCard key={project.slug} entry={project} index={index} locale={lang} />
          ))}
        </div>
      </section>

      <section className={cn(siteContainer, 'pb-8 pt-12')}>
        <div className="relative flex min-h-[430px] flex-col items-center justify-center overflow-hidden bg-accent px-6 py-16 text-center text-paper before:absolute before:-left-12 before:-top-20 before:h-48 before:w-48 before:rounded-full before:border before:border-current before:opacity-20 before:content-[''] after:absolute after:-bottom-24 after:-right-8 after:h-48 after:w-48 after:rounded-full after:border after:border-current after:opacity-20 after:content-['']">
          <span className="font-display text-[5rem] leading-[0.5] opacity-65">“</span>
          <p className="max-w-[52rem] font-display text-[clamp(1.65rem,4vw,3.4rem)] leading-[1.35] tracking-[-0.035em]">
            {dictionary.manifesto[0]}
            <br />
            {dictionary.manifesto[1]}
            <br className="hidden sm:block" />
            {dictionary.manifesto[2]}
          </p>
          <Link
            href={localizeHref(lang, '/about')}
            className="mt-[2.2rem] inline-flex items-center gap-2 border-b border-current pb-[0.3rem] text-[0.66rem] font-bold uppercase tracking-[0.16em] [&>svg]:w-[0.9rem]"
          >
            {dictionary.meet} <ArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
}
