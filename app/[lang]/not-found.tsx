'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Asterisk } from 'lucide-react';
import { getDictionary, localizeHref, type Locale } from '@/lib/i18n';
import { siteContainer, sectionIndex } from '@/lib/ui-classes';

export default function NotFound() {
  const pathname = usePathname();
  const locale: Locale = pathname.startsWith('/en') ? 'en' : 'zh';
  const dictionary = getDictionary(locale).notFound;

  return (
    <div className={`${siteContainer} grid min-h-[65svh] place-items-center py-20 text-center`}>
      <div>
        <Asterisk className="mx-auto mb-7 h-8 w-8 text-accent" />
        <p className={sectionIndex}>Error / 404</p>
        <h1 className="mt-4 font-display text-[clamp(5rem,18vw,12rem)] leading-none tracking-[-0.08em]">
          {dictionary.title}
        </h1>
        <p className="mx-auto mt-5 max-w-md leading-7 text-muted-foreground">
          {dictionary.description}
        </p>
        <Link href={localizeHref(locale, '/')} className="back-link mb-0 mt-9">
          <ArrowLeft /> {dictionary.back}
        </Link>
      </div>
    </div>
  );
}
