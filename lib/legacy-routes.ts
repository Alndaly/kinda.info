import legacyPostSlugs from '@/lib/legacy-post-slugs.json';

export function getCanonicalPostSlug(slug: string) {
  return (legacyPostSlugs as Record<string, string>)[slug] ?? slug;
}
