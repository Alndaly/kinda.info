import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Asterisk, BookOpenText, MessageCircle, Play } from 'lucide-react';
import { JsonLd } from '@/components/json-ld';
import { getDictionary, getLocaleAlternates, hasLocale } from '@/lib/i18n';
import {
  absoluteUrl,
  breadcrumbJsonLd,
  contentLanguage,
  jsonLdGraph,
  personId,
  websiteId,
} from '@/lib/seo';
import { siteConfig } from '@/site.config';
import { siteContainer, sectionIndex, textLink, pageTop,
  contactCardHeading,
  contactChannel,
  contactDestination,
  contactKicker,
  contactWechat,
} from '@/lib/ui-classes';
import { cn } from '@/lib/utils';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dictionary = getDictionary(lang).about;
  return {
    title: dictionary.metadataTitle,
    description: dictionary.metadataDescription,
    alternates: getLocaleAlternates(lang, '/about'),
    openGraph: {
      type: 'profile',
      siteName: siteConfig.siteName,
      title: dictionary.metadataTitle,
      description: dictionary.metadataDescription,
      url: lang === 'zh' ? '/about' : '/en/about',
      locale: lang === 'zh' ? 'zh_CN' : 'en_US',
      images: [
        {
          url: '/images/kinda-portrait.jpg',
          width: 1080,
          height: 1440,
          alt: dictionary.portraitAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: dictionary.metadataTitle,
      description: dictionary.metadataDescription,
      images: ['/images/kinda-portrait.jpg'],
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = getDictionary(lang).about;
  const canonicalUrl = absoluteUrl(lang === 'zh' ? '/about' : '/en/about');
  const profileJsonLd = jsonLdGraph(
    {
      '@type': 'ProfilePage',
      '@id': `${canonicalUrl}#profile`,
      url: canonicalUrl,
      name: dictionary.metadataTitle,
      description: dictionary.metadataDescription,
      inLanguage: contentLanguage(lang),
      isPartOf: { '@id': websiteId },
      mainEntity: { '@id': personId },
    },
    breadcrumbJsonLd(lang, [
      { name: siteConfig.siteName, href: '/' },
      { name: dictionary.metadataTitle, href: '/about' },
    ]),
  );

  return (
    <div className={cn(siteContainer, pageTop)}>
      <JsonLd data={profileJsonLd} />
      <header className="grid grid-cols-[1fr_0.75fr] items-center gap-[clamp(2rem,8vw,8rem)] to-768:grid-cols-[1fr]">
        <div>
          <span className={sectionIndex}>Index / 04</span>
          <h1 className="mt-8 font-display text-[clamp(4.5rem,10vw,9rem)] leading-[0.9] tracking-[-0.07em]">
            {dictionary.title[0]}<br />{dictionary.title[1]}
          </h1>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-muted rotate-[1.5deg] after:pointer-events-none after:absolute after:inset-0 after:shadow-[inset_0_0_0_0.65rem_hsl(var(--paper))] after:content-[''] to-768:ml-auto to-768:w-[85%]">
          <Image
            src="/images/kinda-portrait.jpg"
            alt={dictionary.portraitAlt}
            fill
            priority
            sizes="(max-width: 768px) 90vw, 38vw"
            className="object-cover"
          />
          <span className="absolute bottom-4 right-4 z-[2] bg-black/50 px-2 py-[0.4rem] text-[0.5rem] uppercase tracking-[0.15em] text-white">
            Portrait / Kinda
          </span>
        </div>
      </header>

      <section className="mx-auto mt-[clamp(6rem,12vw,12rem)] grid max-w-[58rem] grid-cols-[0.22fr_1fr] gap-8 to-768:grid-cols-[1fr]">
        <Asterisk className="h-7 w-7 text-accent" />
        <div>
          <p className="font-display text-[clamp(2.1rem,5vw,4.5rem)] leading-[1.15] tracking-[-0.045em]">{dictionary.lead}</p>
          <div className="mt-12 grid grid-cols-2 gap-10 text-[0.95rem] leading-loose text-muted-foreground to-768:grid-cols-1">
            <p>{dictionary.columns[0]}</p>
            <p>{dictionary.columns[1]}</p>
          </div>
          <div className="mt-10 flex flex-wrap gap-5">
            <Link className={textLink} href="https://github.com/Alndaly" target="_blank">GitHub <ArrowUpRight /></Link>
            <Link className={textLink} href="mailto:1142704468@qq.com">Email <ArrowUpRight /></Link>
          </div>
        </div>
      </section>

      {/* Numbered ledger, matching the archive ledger's rule-and-index rhythm.
          Each entry names the work it can be checked against. */}
      <section className="mx-auto mt-[clamp(6rem,12vw,10rem)] max-w-[58rem]">
        <header className="max-w-[38rem]">
          <span className={sectionIndex}>{dictionary.craftIndex}</span>
          <h2 className="mt-3 font-display text-[clamp(2.4rem,5vw,3.8rem)] leading-[1.05] tracking-[-0.05em]">
            {dictionary.craft}
          </h2>
          <p className="mt-5 text-[0.95rem] leading-[1.9] text-muted-foreground">
            {dictionary.craftDescription}
          </p>
        </header>

        <ol className="mt-12 border-t border-line">
          {dictionary.crafts.map((craft, index) => (
            <li
              key={craft.title}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-x-6 gap-y-3 border-b border-line py-8 to-768:grid-cols-[1fr]"
            >
              <span className="pt-[0.35rem] font-display text-[0.95rem] italic text-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-display text-[1.5rem] leading-[1.3] tracking-[-0.03em]">
                  {craft.title}
                </h3>
                <p className="mt-3 max-w-[38rem] text-[0.95rem] leading-[1.9] text-muted-foreground">
                  {craft.body}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-[0.58rem] uppercase tracking-[calc(0.16em*var(--tracking-scale))] text-muted-foreground before:h-px before:w-5 before:bg-accent/70 before:content-['']">
                  {craft.evidence}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-[clamp(5rem,10vw,8rem)] max-w-[58rem]">
        <header className="max-w-[38rem]">
          <span className={sectionIndex}>{dictionary.collabIndex}</span>
          <h2 className="mt-3 font-display text-[clamp(2.4rem,5vw,3.8rem)] leading-[1.05] tracking-[-0.05em]">
            {dictionary.collab}
          </h2>
          <p className="mt-5 text-[0.95rem] leading-[1.9] text-muted-foreground">
            {dictionary.collabDescription}
          </p>
        </header>

        <div className="mt-10 grid grid-cols-2 gap-4 [&>article:last-child:nth-child(odd)]:col-span-2 to-768:grid-cols-1">
          {dictionary.collabs.map((item) => (
            <article
              key={item.title}
              className="relative border border-line bg-paper p-6 before:absolute before:inset-y-6 before:left-0 before:w-px before:bg-accent/60 before:content-['']"
            >
              <h3 className="font-display text-[1.15rem] leading-[1.4] tracking-[-0.02em]">
                {item.title}
              </h3>
              <p className="mt-2 text-[0.9rem] leading-[1.8] text-muted-foreground">
                {item.body}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-8 flex items-start gap-3 text-[0.95rem] leading-[1.9] text-muted-foreground before:mt-[0.85em] before:h-px before:w-8 before:flex-none before:bg-accent/70 before:content-['']">
          {dictionary.collabNote}
          <Link className={cn(textLink, 'ml-1')} href={`mailto:${siteConfig.email}`}>
            Email <ArrowUpRight />
          </Link>
        </p>
      </section>

      <section
        id="contact"
        className="mt-[clamp(7rem,14vw,13rem)] scroll-mt-28 border-t border-line pt-[clamp(2rem,5vw,4rem)]"
      >
        <header className="mb-[clamp(3rem,7vw,6rem)] grid grid-cols-[0.45fr_1fr] items-end gap-[clamp(2rem,7vw,7rem)] to-768:grid-cols-[1fr]">
          <span className={sectionIndex}>Elsewhere / 05</span>
          <div>
            <h2 className="font-display text-[clamp(3.5rem,8vw,7.5rem)] leading-[0.95] tracking-[-0.065em]">
              {dictionary.elsewhere}
            </h2>
            <p className="mt-6 max-w-[32rem] text-[0.95rem] leading-[1.9] text-muted-foreground">
              {dictionary.elsewhereDescription}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] gap-4 to-768:grid-cols-[1fr]">
          <article className={contactWechat}>
            <div className={contactCardHeading}>
              <span className={contactKicker}>01</span>
              <MessageCircle aria-hidden="true" />
            </div>
            <div>
              <span className={contactKicker}>WeChat Official Account</span>
              <h3>{dictionary.wechat}</h3>
              <p>{dictionary.wechatDescription}</p>
            </div>
            <div className="mx-auto mt-[clamp(2rem,5vw,4rem)] w-[min(100%,28rem)] -rotate-1 bg-white p-[0.65rem] shadow-[0_24px_70px_rgba(20,19,15,0.1)] [&_img]:block [&_img]:h-auto [&_img]:w-full">
              <Image
                src={siteConfig.wechatQr}
                alt={dictionary.wechatAlt}
                width={1200}
                height={1164}
                sizes="(max-width: 768px) 82vw, 34vw"
              />
            </div>
          </article>

          <Link
            className={cn(contactChannel, '[--channel-color:195_89%_55%]')}
            href={siteConfig.bilibili}
            target="_blank"
            rel="noreferrer"
          >
            <div className={contactCardHeading}>
              <span className={contactKicker}>02</span>
              <Play aria-hidden="true" />
            </div>
            <div>
              <span className={contactKicker}>Video / Making</span>
              <h3>{dictionary.bilibili}</h3>
            </div>
            <span className={contactDestination}>
              UID 391938956 <ArrowUpRight aria-hidden="true" />
            </span>
          </Link>

          <Link
            className={cn(contactChannel, '[--channel-color:356_77%_53%]')}
            href={siteConfig.xiaohongshu}
            target="_blank"
            rel="noreferrer"
          >
            <div className={contactCardHeading}>
              <span className={contactKicker}>03</span>
              <BookOpenText aria-hidden="true" />
            </div>
            <div>
              <span className={contactKicker}>Frames / Daily Life</span>
              <h3>{dictionary.xiaohongshu}</h3>
            </div>
            <span className={contactDestination}>
              {dictionary.xiaohongshuDestination} <ArrowUpRight aria-hidden="true" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
