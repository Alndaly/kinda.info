import type { MetadataRoute } from 'next';
import { allEntries } from '@/lib/content';
import { siteConfig } from '@/site.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/notes', '/photography', '/projects', '/about'];
  return [
    ...staticRoutes.map((route) => ({
      url: `${siteConfig.siteUrl}${route}`,
      lastModified: new Date(),
    })),
    ...allEntries.map((entry) => ({
      url: `${siteConfig.siteUrl}${entry.href}`,
      lastModified: new Date(entry.updated ?? entry.date),
    })),
  ];
}
