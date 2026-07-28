'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/i18n';
import { headerControlSquare } from '@/lib/ui-classes';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const pathname = usePathname();
  const isEnglish = locale === 'en';
  const visiblePath = pathname.replace(/^\/zh(?=\/|$)/, '') || '/';
  const href = isEnglish
    ? visiblePath.replace(/^\/en(?=\/|$)/, '') || '/'
    : `/en${visiblePath === '/' ? '' : visiblePath}`;

  return (
    <Link
      href={href}
      className={cn(headerControlSquare, className)}
      aria-label={isEnglish ? 'Switch to Chinese' : '切换到英文'}
      title={isEnglish ? 'Switch to Chinese' : '切换到英文'}
    >
      {isEnglish ? '中' : 'EN'}
    </Link>
  );
}
