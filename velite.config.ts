import { defineConfig, s } from 'velite';

export default defineConfig({
  collections: {
    entries: {
      name: 'Entry',
      pattern: '**/*.mdx',
      schema: s
        .object({
          slug: s.string(),
          locale: s.enum(['zh', 'en']).default('zh'),
          type: s.enum(['note', 'photo', 'project']),
          title: s.string(),
          summary: s.string(),
          date: s.isodate(),
          updated: s.isodate().optional(),
          tags: s.array(s.string()).default([]),
          cover: s.string().optional(),
          featured: s.boolean().default(false),
          /**
           * Unfinished work. Drafts are visible while running the dev server and
           * absent from production builds — no page, no listing, no sitemap
           * entry, no feed item, no search record.
           */
          draft: s.boolean().default(false),
          location: s.string().optional(),
          link: s.string().optional(),
          status: s.enum(['active', 'experiment', 'archive']).optional(),
          accent: s.string().optional(),
          mark: s.string().optional(),
          discipline: s.string().optional(),
          // only used for the check below; dropped from the output
          filePath: s.path(),
          metadata: s.metadata(),
          html: s.markdown(),
          content: s.raw(),
        })
        .transform(({ filePath, ...entry }) => {
          // The slug decides the URL, so a file whose name disagrees with it is
          // served at an address nobody can guess from the tree — and a typo is
          // a silent 404 rather than an error. Keep the two in step.
          const fileName = filePath.split('/').pop() ?? '';
          if (fileName !== entry.slug) {
            throw new Error(
              `content/${filePath}.mdx declares slug "${entry.slug}" but the file is named `
                + `"${fileName}.mdx". Rename the file to "${entry.slug}.mdx", or set `
                + `slug: "${fileName}" — otherwise the entry is served at `
                + `"${entry.slug}" and the file is impossible to find.`,
            );
          }

          const href = `/${
            entry.type === 'note'
              ? 'notes'
              : entry.type === 'photo'
                ? 'photography'
                : 'projects'
          }/${entry.slug}`;

          return {
            ...entry,
            href: entry.locale === 'en' ? `/en${href}` : href,
          };
        }),
    },
  },
});
