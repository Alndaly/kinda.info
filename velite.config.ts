import { exec } from 'child_process'
import { promisify } from 'util'
import { defineSchema, defineConfig, s } from 'velite'

const execAsync = promisify(exec)

const timestamp = defineSchema(() =>
  s
    .custom<string | undefined>(i => i === undefined || typeof i === 'string')
    .transform<string>(async (value, { meta, addIssue }) => {
      if (value != null) {
        addIssue({ fatal: false, code: 'custom', message: '`s.timestamp()` schema will resolve the value from `git log -1 --format=%cd`' })
      }
      const { stdout } = await execAsync(`git log -1 --format=%cd ${meta.path}`)
      return new Date(stdout || Date.now()).toISOString()
    })
)

// `s` is extended from Zod with some custom schemas,
// you can also import re-exported `z` from `velite` if you don't need these extension schemas.

export default defineConfig({
  collections: {
    posts: {
      name: 'Post', // collection type name
      pattern: 'post/**/*.mdx', // content files glob pattern
      schema: s
        .object({
          slug: s.path(), // auto generate slug from file path
          lastModified: timestamp(),
          metadata: s.metadata(), // extract markdown reading-time, word-count, etc.
          excerpt: s.excerpt(), // excerpt of markdown content
          content: s.markdown(), // transform markdown to html
          code: s.mdx()
        })
        // more additional fields (computed fields)
        .transform(data => ({ ...data, permalink: `/${data.slug}` }))
    },
  }
})