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
      <section className="site-container hero-section">
        <div className="hero-grid">
          <div className="relative z-[1] flex flex-col justify-between py-4 lg:py-10">
            <div>
              <Badge className="mb-8 border-accent/25 text-accent">
                <Sparkles className="mr-1.5 h-3 w-3" />
                {dictionary.archive}
              </Badge>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {dictionary.eyebrow}
              </p>
              <h1 className="hero-title">
                Kinda
                <span>{dictionary.displayName}</span>
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

          <div className="hero-collage">
            <div className="hero-photo">
              <Image
                src="/images/july-portrait.jpg"
                alt={dictionary.photoAlt}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 42vw"
                className="object-cover"
              />
              <span>ON THE ROAD / JULY</span>
            </div>
            <div className="hero-stamp" aria-hidden="true">
              <span>KEEP CURIOUS · STAY SOFT · </span>
            </div>
            <div className="hero-note">
              <span>{dictionary.noteLabel}</span>
              <p>{dictionary.note[0]}<br />{dictionary.note[1]}</p>
              <i>— J.</i>
            </div>
          </div>
        </div>
        <a href="#latest" className="scroll-cue">
          <ArrowDown className="h-4 w-4" />
          {dictionary.scroll}
        </a>
      </section>

      <section id="latest" className="site-container section-space">
        <div className="section-heading">
          <div>
            <span className="section-index">01 / Notes</span>
            <h2>{dictionary.recentThoughts}</h2>
          </div>
          <Link href={localizeHref(lang, '/notes')} className="text-link">
            {dictionary.allNotes} <ArrowUpRight />
          </Link>
        </div>
        {featuredNote && <EntryCard entry={featuredNote} index={0} locale={lang} />}
        {notes.slice(0, 3).filter((note) => note.slug !== featuredNote?.slug).map((note, index) => (
          <EntryCard key={note.slug} entry={note} index={index + 1} locale={lang} />
        ))}
      </section>

      <section className="inverse-section section-space overflow-hidden border-y py-20">
        <div className="site-container">
          <div className="section-heading">
            <div>
              <span className="section-index">02 / Frames</span>
              <h2>{dictionary.recentFrames}</h2>
            </div>
            <Link href={localizeHref(lang, '/photography')} className="text-link">
              {dictionary.allFrames} <ArrowUpRight />
            </Link>
          </div>
          <div className="photo-home-grid">
            {photos.slice(0, 3).map((photo, index) => (
              <PhotoCard
                key={photo.slug}
                entry={photo}
                priority={index === 0}
                className={index === 0 ? 'photo-home-featured' : ''}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="site-container section-space">
        <div className="section-heading">
          <div>
            <span className="section-index">03 / Things</span>
            <h2>{dictionary.recentProjects}</h2>
          </div>
          <Link href={localizeHref(lang, '/projects')} className="text-link">
            {dictionary.allProjects} <ArrowUpRight />
          </Link>
        </div>
        <div className="grid gap-12 md:grid-cols-2">
          {projects.slice(0, 2).map((project, index) => (
            <ProjectCard key={project.slug} entry={project} index={index} />
          ))}
        </div>
      </section>

      <section className="site-container pb-8 pt-12">
        <div className="manifesto">
          <span className="manifesto-mark">“</span>
          <p>
            {dictionary.manifesto[0]}
            <br />
            {dictionary.manifesto[1]}
            <br className="hidden sm:block" />
            {dictionary.manifesto[2]}
          </p>
          <Link href={localizeHref(lang, '/about')}>{dictionary.meet} <ArrowRight /></Link>
        </div>
      </section>
    </>
  );
}
