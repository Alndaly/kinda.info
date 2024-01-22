// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import readingTime from "reading-time";
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'


const computedFields: import('contentlayer/source-files').ComputedFields = {
    urlslug: {
        type: "string",
        resolve: (doc) => `/${doc._raw.flattenedPath}`,
    },
    slug: {
        type: "string",
        resolve: (doc) => `/${doc._raw.flattenedPath}`.toLowerCase(),
    },
    slugAsParams: {
        type: "string",
        resolve: (doc) =>
            doc._raw.flattenedPath.split("/").slice(1).join("/").toLowerCase(),
    },
    readingTime: {
        type: "json",
        resolve: (doc) => readingTime(doc.body.raw, { wordsPerMinute: 500 }),
    },
    headings: {
        type: "json",
        resolve: async (doc) => {
            const regXHeader = /\n(?<flag>#{2,6})\s+(?<content>.+)/g;
            const headings = Array.from(doc.body.raw.matchAll(regXHeader)).map(
                ({ groups }) => {
                    const flag = groups?.flag;
                    const content = groups?.content;
                    return {
                        level:
                            flag?.length == 1 ? "one" : flag?.length == 2 ? "two" : "three",
                        text: content,
                        id: content.split(" ").join("-").toLowerCase(),
                    };
                }
            );
            return headings;
        },
    },
};


export const Post = defineDocumentType(() => ({
    name: 'Post',
    filePathPattern: `post/**/*.mdx`,
    contentType: "mdx",
    fields: {
        title: { type: 'string', required: false },
        description: { type: "string", required: false },
        date: { type: 'date', required: true },
        bgImage: { type: 'string', required: false },
        style: { type: 'string', required: false }
    },
    computedFields
}))

export const Page = defineDocumentType(() => ({
    name: 'Page',
    filePathPattern: `page/**/*.mdx`,
    contentType: "mdx",
    fields: {
        title: { type: 'string', required: false },
        bgImage: { type: 'string', required: false },
        style: { type: 'string', required: false },
        description: { type: 'string', required: false }
    },
    computedFields
}))

export default makeSource({
    contentDirPath: './data/content',
    documentTypes: [Post, Page],
    mdx: {
        remarkPlugins: [remarkGfm, remarkMath],
    }
})