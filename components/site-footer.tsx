import Link from 'next/link';
import { ArrowUpRight, Asterisk } from 'lucide-react';
import { getDictionary, localizeHref, type Locale } from '@/lib/i18n';
import { siteConfig } from '@/site.config';

export function SiteFooter({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale).footer;

  return (
    <footer className="mt-28 border-t border-line">
      <div className="site-container">
        <div className="grid gap-10 py-14 md:grid-cols-[1.3fr_.7fr] md:items-end">
          <div>
            <Asterisk className="mb-5 h-6 w-6 text-accent" />
            <p className="max-w-xl font-display text-3xl leading-[1.15] tracking-[-0.035em] sm:text-4xl">
              {dictionary.manifesto[0]}
              <br />
              {dictionary.manifesto[1]}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm md:justify-self-end">
            <Link className="footer-link" href={`https://github.com/${siteConfig.github}`} target="_blank">
              GitHub <ArrowUpRight />
            </Link>
            <Link className="footer-link" href={`mailto:${siteConfig.email}`}>
              Email <ArrowUpRight />
            </Link>
            <Link className="footer-link" href={localizeHref(locale, '/notes')}>
              {dictionary.notes} <ArrowUpRight />
            </Link>
            <Link className="footer-link" href={localizeHref(locale, '/photography')}>
              {dictionary.frames} <ArrowUpRight />
            </Link>
            <Link className="footer-link" href={siteConfig.bilibili} target="_blank" rel="noreferrer">
              Bilibili <ArrowUpRight />
            </Link>
            <Link className="footer-link" href={siteConfig.xiaohongshu} target="_blank" rel="noreferrer">
              {dictionary.xiaohongshu} <ArrowUpRight />
            </Link>
            <Link className="footer-link" href={localizeHref(locale, '/about#contact')}>
              {dictionary.wechat} <ArrowUpRight />
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-line py-5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} {siteConfig.author}</span>
          <span>{dictionary.made}</span>
        </div>
      </div>
    </footer>
  );
}
