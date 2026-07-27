'use client';

import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/i18n';

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const isEnglish = locale === 'en';
  const href = isEnglish
    ? pathname.replace(/^\/en(?=\/|$)/, '') || '/'
    : `/en${pathname === '/' ? '' : pathname}`;

  return (
    <a
      href={href}
      className="language-switch"
      aria-label={isEnglish ? '切换到中文' : 'Switch to English'}
      title={isEnglish ? '切换到中文' : 'Switch to English'}
    >
      {isEnglish ? '中' : 'EN'}
    </a>
  );
}
