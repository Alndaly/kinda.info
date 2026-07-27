import type { Locale } from '@/lib/i18n';
import { localizeHref } from '@/lib/i18n';
import { siteConfig } from '@/site.config';

export const websiteId = `${siteConfig.siteUrl}/#website`;
export const personId = `${siteConfig.siteUrl}/about/#person`;

export function absoluteUrl(pathOrUrl: string) {
  return new URL(pathOrUrl, siteConfig.siteUrl).toString();
}

export function contentLanguage(locale: Locale) {
  return locale === 'zh' ? 'zh-CN' : 'en';
}

export function socialImage(cover?: string) {
  return cover && !cover.toLowerCase().endsWith('.svg') ? cover : '/og.png';
}

export function jsonLdGraph(...nodes: Array<Record<string, unknown>>) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}

export function breadcrumbJsonLd(
  locale: Locale,
  items: Array<{ name: string; href: string }>,
) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(localizeHref(locale, item.href)),
    })),
  };
}
