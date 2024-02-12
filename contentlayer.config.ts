// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import readingTime from "reading-time";
import GithubSlugger from 'github-slugger'
import { getGitFileUpdateTimestamp, getGitFileCreateTimestamp } from './app/utils/getGitTimeStamp';
import { siteConfig } from './site.config';

const slugger = new GithubSlugger()

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
                        id: slugger.slug(content),
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
        image: { type: 'string', required: false },
        order: { type: 'number', required: false },
        tags: {
            type: "list",
            default: [],
            of: { type: "string" },
        },
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
        description: { type: 'string', required: false }
    },
    computedFields
}))

export default makeSource({
    contentDirPath: siteConfig.docPath,
    documentTypes: [Post, Page],
})