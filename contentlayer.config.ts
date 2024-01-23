// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import readingTime from "reading-time";
import remarkGfm from 'remark-gfm'
import rehypeSlug from "rehype-slug";
import { getGitFileUpdateTimestamp, getGitFileCreateTimestamp } from './app/utils/getGitTimeStamp';
import rehypePrettyCode from "rehype-pretty-code";
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
    createTime: {
        type: 'number',
        resolve: async (doc) => {
            const createTime = await getGitFileCreateTimestamp(doc._raw.sourceFilePath);
            return createTime;
        },
    },
    updateTime: {
        type: 'number',
        resolve: async (doc) => {
            const updateTime = await getGitFileUpdateTimestamp(doc._raw.sourceFilePath);
            return updateTime;
        },
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
                (item: any) => {
                    const flag = item.groups?.flag;
                    const content = item.groups?.content;
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
        image: { type: 'string', required: false },
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
        image: { type: 'string', required: false },
        style: { type: 'string', required: false },
        description: { type: 'string', required: false }
    },
    computedFields
}))

const options: import('rehype-pretty-code').Options = {
    theme: "github-dark-dimmed",
    keepBackground: true
};

export default makeSource({
    contentDirPath: './data/content',
    documentTypes: [Post, Page],
    mdx: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [
            // @ts-ignore
            [rehypePrettyCode, options],
            rehypeSlug,
        ],
    }
})