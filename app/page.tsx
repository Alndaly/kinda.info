import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EntryCard } from '@/components/entry-card';
import { PhotoCard } from '@/components/photo-card';
import { ProjectCard } from '@/components/project-card';
import { notes, photos, projects } from '@/lib/content';

export default function HomePage() {
  const featuredNote = notes.find((entry) => entry.featured) ?? notes[0];

  return (
    <>
      <section className="site-container hero-section">
        <div className="hero-grid">
          <div className="relative z-[1] flex flex-col justify-between py-4 lg:py-10">
            <div>
              <Badge className="mb-8 border-accent/25 text-accent">
                <Sparkles className="mr-1.5 h-3 w-3" />
                Personal archive · No. 07
              </Badge>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Notes, frames & things I make
              </p>
              <h1 className="hero-title">
                Kinda
                <span>阡陌</span>
              </h1>
              <p className="mt-8 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                一个关于代码、影像和生活感受的个人档案。
                <br className="hidden sm:block" />
                我把认真想过、看见过、做出来的东西，安静地留在这里。
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-ink px-6 text-paper hover:bg-accent dark:bg-paper dark:text-ink dark:hover:bg-accent dark:hover:text-white">
                <Link href="/notes">
                  开始阅读 <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-line bg-transparent px-6 shadow-none">
                <Link href="/photography">看看我眼中的世界</Link>
              </Button>
            </div>
          </div>

          <div className="hero-collage">
            <div className="hero-photo">
              <Image
                src="https://oss.kinda.info/image/202409222153357.png"
                alt="Kinda 的一帧生活影像"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 42vw"
                className="object-cover"
              />
              <span>35° N / 121° E</span>
            </div>
            <div className="hero-stamp" aria-hidden="true">
              <span>KEEP CURIOUS · STAY SOFT · </span>
            </div>
            <div className="hero-note">
              <span>今日小记</span>
              <p>把生活调到<br />适合自己的焦距。</p>
              <i>— K.</i>
            </div>
          </div>
        </div>
        <a href="#latest" className="scroll-cue">
          <ArrowDown className="h-4 w-4" />
          Scroll to wander
        </a>
      </section>

      <section id="latest" className="site-container section-space">
        <div className="section-heading">
          <div>
            <span className="section-index">01 / Notes</span>
            <h2>最近在想</h2>
          </div>
          <Link href="/notes" className="text-link">
            全部笔记 <ArrowUpRight />
          </Link>
        </div>
        {featuredNote && <EntryCard entry={featuredNote} index={0} />}
        {notes.slice(0, 3).filter((note) => note.slug !== featuredNote?.slug).map((note, index) => (
          <EntryCard key={note.slug} entry={note} index={index + 1} />
        ))}
      </section>

      <section className="section-space overflow-hidden border-y border-line bg-ink py-20 text-paper dark:bg-[#0d0d0b]">
        <div className="site-container">
          <div className="section-heading section-heading-dark">
            <div>
              <span className="section-index text-paper/45">02 / Frames</span>
              <h2>最近看见</h2>
            </div>
            <Link href="/photography" className="text-link text-paper">
              完整暗房 <ArrowUpRight />
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
            <h2>最近在做</h2>
          </div>
          <Link href="/projects" className="text-link">
            所有作品 <ArrowUpRight />
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
            我不想让这里变成另一条需要追赶的时间线。
            <br />
            它更像一张桌子：放着翻到一半的书、冲洗好的照片，
            <br className="hidden sm:block" />
            还有几个仍在长大的小产品。
          </p>
          <Link href="/about">认识 Kinda <ArrowRight /></Link>
        </div>
      </section>
    </>
  );
}
