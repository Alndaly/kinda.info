import type { MetadataRoute } from 'next';
import { allEntries } from '@/lib/content';
import { siteConfig } from '@/site.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/notes', '/photography', '/projects', '/about'];
  const staticEntries = staticRoutes.flatMap((route) => [
    {
      url: `${siteConfig.siteUrl}${route}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          'zh-CN': `${siteConfig.siteUrl}${route}`,
          en: `${siteConfig.siteUrl}/en${route}`,
        },
      },
    },
    {
      url: `${siteConfig.siteUrl}/en${route}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          'zh-CN': `${siteConfig.siteUrl}${route}`,
          en: `${siteConfig.siteUrl}/en${route}`,
        },
      },
    },
  ]);

  return [
    ...staticEntries,
    ...allEntries.map((entry) => ({
      url: `${siteConfig.siteUrl}${entry.href}`,
      lastModified: new Date(entry.updated ?? entry.date),
      alternates: {
        languages: {
          'zh-CN': `${siteConfig.siteUrl}${entry.href.replace(/^\/en(?=\/|$)/, '')}`,
          en: `${siteConfig.siteUrl}/en${entry.href.replace(/^\/en(?=\/|$)/, '')}`,
        },
      },
    })),
  ];
}
