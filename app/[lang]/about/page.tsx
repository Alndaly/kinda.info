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
import { siteContainer } from '@/lib/ui-classes';

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
          url: '/images/july-portrait.jpg',
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
      images: ['/images/july-portrait.jpg'],
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
    <div className={`${siteContainer} page-top`}>
      <JsonLd data={profileJsonLd} />
      <header className="about-hero">
        <div>
          <span className="section-index">Index / 04</span>
          <h1>{dictionary.title[0]}<br />{dictionary.title[1]}</h1>
        </div>
        <div className="about-portrait">
          <Image
            src="/images/july-portrait.jpg"
            alt={dictionary.portraitAlt}
            fill
            priority
            sizes="(max-width: 768px) 90vw, 38vw"
            className="object-cover"
          />
          <span>Portrait / July</span>
        </div>
      </header>

      <section className="about-copy">
        <Asterisk className="h-7 w-7 text-accent" />
        <div>
          <p className="about-lead">{dictionary.lead}</p>
          <div className="about-columns">
            <p>{dictionary.columns[0]}</p>
            <p>{dictionary.columns[1]}</p>
          </div>
          <div className="mt-10 flex flex-wrap gap-5">
            <Link className="text-link" href="https://github.com/Alndaly" target="_blank">GitHub <ArrowUpRight /></Link>
            <Link className="text-link" href="mailto:1142704468@qq.com">Email <ArrowUpRight /></Link>
          </div>
        </div>
      </section>

      <section id="contact" className="about-contact">
        <header className="about-contact-heading">
          <span className="section-index">Elsewhere / 05</span>
          <div>
            <h2>{dictionary.elsewhere}</h2>
            <p>{dictionary.elsewhereDescription}</p>
          </div>
        </header>

        <div className="contact-grid">
          <article className="contact-wechat">
            <div className="contact-card-heading">
              <span className="contact-index">01</span>
              <MessageCircle aria-hidden="true" />
            </div>
            <div>
              <span className="contact-kicker">WeChat Official Account</span>
              <h3>{dictionary.wechat}</h3>
              <p>{dictionary.wechatDescription}</p>
            </div>
            <div className="contact-qr">
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
            className="contact-channel contact-bilibili"
            href={siteConfig.bilibili}
            target="_blank"
            rel="noreferrer"
          >
            <div className="contact-card-heading">
              <span className="contact-index">02</span>
              <Play aria-hidden="true" />
            </div>
            <div>
              <span className="contact-kicker">Video / Making</span>
              <h3>{dictionary.bilibili}</h3>
            </div>
            <span className="contact-destination">
              UID 391938956 <ArrowUpRight aria-hidden="true" />
            </span>
          </Link>

          <Link
            className="contact-channel contact-xiaohongshu"
            href={siteConfig.xiaohongshu}
            target="_blank"
            rel="noreferrer"
          >
            <div className="contact-card-heading">
              <span className="contact-index">03</span>
              <BookOpenText aria-hidden="true" />
            </div>
            <div>
              <span className="contact-kicker">Frames / Daily Life</span>
              <h3>{dictionary.xiaohongshu}</h3>
            </div>
            <span className="contact-destination">
              {dictionary.xiaohongshuDestination} <ArrowUpRight aria-hidden="true" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
