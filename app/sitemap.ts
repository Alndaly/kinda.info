import type { MetadataRoute } from 'next';
import { allEntries, getEntrySeo } from '@/lib/content';
import { localizeHref, type Locale } from '@/lib/i18n';
import { absoluteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { href: '/', changeFrequency: 'weekly', priority: 1 },
    { href: '/notes', changeFrequency: 'weekly', priority: 0.9 },
    { href: '/photography', changeFrequency: 'monthly', priority: 0.8 },
    { href: '/projects', changeFrequency: 'monthly', priority: 0.8 },
    { href: '/player', changeFrequency: 'monthly', priority: 0.7 },
    { href: '/about', changeFrequency: 'yearly', priority: 0.7 },
  ] as const;
  const staticEntries = staticRoutes.flatMap(({ href, changeFrequency, priority }) => {
    const languages = {
      'zh-CN': absoluteUrl(href),
      en: absoluteUrl(localizeHref('en', href)),
      'x-default': absoluteUrl(href),
    };

    return (['zh', 'en'] as const).map((locale) => ({
      url: absoluteUrl(localizeHref(locale, href)),
      changeFrequency,
      priority,
      alternates: { languages },
    }));
  });

  return [
    ...staticEntries,
    ...allEntries.map((entry) => {
      const seo = getEntrySeo(entry.type, entry.slug, entry.locale as Locale);
      return {
        url: absoluteUrl(entry.href),
        lastModified: new Date(entry.updated ?? entry.date),
        changeFrequency: entry.type === 'note' ? ('monthly' as const) : ('yearly' as const),
        priority: entry.featured ? 0.8 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            Object.entries(seo.alternates.languages).map(([locale, href]) => [
              locale,
              absoluteUrl(href),
            ]),
          ),
        },
      };
    }),
  ];
}
