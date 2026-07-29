import Link from 'next/link';
import { Asterisk } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ModeToggle } from '@/components/mode-toggle';
import { SiteSearch } from '@/components/site-search';
import { AudioLauncher } from '@/components/audio/audio-launcher';
import { getDictionary, localizeHref, type Locale } from '@/lib/i18n';
import { createSearchIndex } from '@/lib/search';
import { headerControl, navPill, siteContainer } from '@/lib/ui-classes';
import { cn } from '@/lib/utils';

const navigation = [
  { href: '/notes', key: 'notes', index: '01' },
  { href: '/photography', key: 'photography', index: '02' },
  { href: '/projects', key: 'projects', index: '03' },
  { href: '/about', key: 'about', index: '04' },
] as const;

export function SiteHeader({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale).header;
  const searchDictionary = getDictionary(locale).search;
  const searchIndex = createSearchIndex(locale);

  return (
    <header className="group-has-[[data-audio-app]]/shell:hidden to-768:relative sticky top-0 z-50 border-b border-line/70 bg-paper/[0.82] backdrop-blur-[18px] backdrop-saturate-[1.4]">
      <div className={`${siteContainer} flex h-[74px] items-center justify-between gap-5`}>
        <Link
          href={localizeHref(locale, '/')}
          className="group flex items-center gap-2"
          aria-label={dictionary.homeLabel}
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-paper transition-transform duration-500 group-hover:rotate-90">
            <Asterisk className="h-5 w-5" strokeWidth={1.7} />
          </span>
          <span className="font-display text-2xl font-semibold tracking-[-0.04em]">
            {dictionary.brand}
          </span>
        </Link>

        <nav
          aria-label={dictionary.navigationLabel}
          className="hidden items-center gap-1 rounded-full border border-line/80 bg-paper/75 p-1 backdrop-blur-xl md:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={localizeHref(locale, item.href)}
              className={`${navPill} group`}
            >
              <span className="mr-1.5 text-[9px] opacity-45">{item.index}</span>
              {dictionary.items[item.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-[0.45rem]">
          <AudioLauncher locale={locale} label={dictionary.audio} />
          <SiteSearch
            locale={locale}
            records={searchIndex}
            labels={searchDictionary}
          />
          <Link
            href="mailto:1142704468@qq.com"
            className={cn(
              headerControl,
              'hidden whitespace-nowrap px-[0.9rem] uppercase sm:inline-flex',
            )}
          >
            {dictionary.hello}
          </Link>
          <LanguageSwitcher locale={locale} />
          <ModeToggle locale={locale} />
        </div>
      </div>

      <nav
        aria-label={dictionary.mobileNavigationLabel}
        className={`${siteContainer} flex gap-1 overflow-x-auto border-t border-line/70 py-2 md:hidden`}
      >
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={localizeHref(locale, item.href)}
            className={`${navPill} shrink-0`}
          >
            {dictionary.items[item.key]}
          </Link>
        ))}
      </nav>
    </header>
  );
}
