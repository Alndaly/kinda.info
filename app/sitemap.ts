import type { MetadataRoute } from 'next';
import { allEntries, getEntrySeo } from '@/lib/content';
import { localizeHref, type Locale } from '@/lib/i18n';
import { absoluteUrl } from '@/lib/seo';

/**
 * absoluteUrl('/') keeps its trailing slash while the canonical tag does not,
 * and Google reads the two spellings as separate URLs. Match the tag.
 */
function sitemapUrl(href: string) {
  const url = absoluteUrl(href);
  return url.replace(/(?<!\/)\/$/, '');
}

/** Newest entry of a type, so a section's lastmod follows its content. */
function lastModifiedFor(types: readonly string[]) {
  const times = allEntries
    .filter((entry) => types.includes(entry.type))
    .map((entry) => new Date(entry.updated ?? entry.date).getTime());
  return times.length ? new Date(Math.max(...times)) : undefined;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { href: '/', changeFrequency: 'weekly', priority: 1, lastModified: lastModifiedFor(['note', 'photo', 'project']) },
    { href: '/notes', changeFrequency: 'weekly', priority: 0.9, lastModified: lastModifiedFor(['note']) },
    { href: '/photography', changeFrequency: 'monthly', priority: 0.8, lastModified: lastModifiedFor(['photo']) },
    { href: '/projects', changeFrequency: 'monthly', priority: 0.8, lastModified: lastModifiedFor(['project']) },
    { href: '/about', changeFrequency: 'yearly', priority: 0.6, lastModified: undefined },
    // a player, not a page anyone should land on from a search result
    { href: '/player', changeFrequency: 'yearly', priority: 0.3, lastModified: undefined },
  ] as const;

  const staticEntries = staticRoutes.flatMap(
    ({ href, changeFrequency, priority, lastModified }) => {
      const languages = {
        'zh-CN': sitemapUrl(href),
        en: sitemapUrl(localizeHref('en', href)),
        'x-default': sitemapUrl(href),
      };

      return (['zh', 'en'] as const).map((locale) => ({
        url: sitemapUrl(localizeHref(locale, href)),
        changeFrequency,
        priority,
        ...(lastModified ? { lastModified } : {}),
        alternates: { languages },
      }));
    },
  );

  return [
    ...staticEntries,
    ...allEntries.map((entry) => {
      const seo = getEntrySeo(entry.type, entry.slug, entry.locale as Locale);
      return {
        url: sitemapUrl(entry.href),
        lastModified: new Date(entry.updated ?? entry.date),
        changeFrequency: entry.type === 'note' ? ('monthly' as const) : ('yearly' as const),
        priority: entry.featured ? 0.8 : 0.7,
        // photo essays live or die by image search
        ...(entry.cover ? { images: [absoluteUrl(entry.cover)] } : {}),
        alternates: {
          languages: Object.fromEntries(
            Object.entries(seo.alternates.languages).map(([locale, href]) => [
              locale,
              sitemapUrl(href),
            ]),
          ),
        },
      };
    }),
  ];
}
