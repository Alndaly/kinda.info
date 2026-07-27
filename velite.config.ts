import { defineConfig, s } from 'velite';

export default defineConfig({
  collections: {
    entries: {
      name: 'Entry',
      pattern: '**/*.mdx',
      schema: s
        .object({
          slug: s.string(),
          type: s.enum(['note', 'photo', 'project']),
          title: s.string(),
          eyebrow: s.string().optional(),
          summary: s.string(),
          date: s.isodate(),
          updated: s.isodate().optional(),
          tags: s.array(s.string()).default([]),
          cover: s.string().optional(),
          featured: s.boolean().default(false),
          location: s.string().optional(),
          link: s.string().optional(),
          status: s.enum(['active', 'experiment', 'archive']).optional(),
          metadata: s.metadata(),
          excerpt: s.excerpt(),
          html: s.markdown(),
          content: s.raw(),
        })
        .transform((entry) => ({
          ...entry,
          href: `/${
            entry.type === 'note'
              ? 'notes'
              : entry.type === 'photo'
                ? 'photography'
                : 'projects'
          }/${entry.slug}`,
        })),
    },
  },
});
