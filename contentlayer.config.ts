// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import readingTime from "reading-time";
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

export const Post = defineDocumentType(() => ({
    name: 'Post',
    filePathPattern: `posts/**/*.mdx`,
    contentType: "mdx",
    fields: {
        title: { type: 'string', required: false },
        description: { type: "string", required: false },
        date: { type: 'date', required: true },
        bgImage: { type: 'string', required: false },
        style: { type: 'string', required: false }
    },
    computedFields: {
        url: { type: 'string', resolve: (post) => `/${post._raw.flattenedPath}` },
        readingTime: { type: "json", resolve: (doc) => readingTime(doc.body.raw) },
    },
}))

export const Page = defineDocumentType(() => ({
    name: 'Page',
    filePathPattern: `pages/**/*.mdx`,
    contentType: "mdx",
    fields: {
        title: { type: 'string', required: false },
        style: { type: 'string', required: false }
    },
    computedFields: {
        url: { type: 'string', resolve: (page) => `/${page._raw.flattenedPath}` },
    },
}))

export default makeSource({
    contentDirPath: 'content',
    documentTypes: [Post, Page],
    mdx: {
        remarkPlugins: [remarkGfm, remarkMath],
    }
})