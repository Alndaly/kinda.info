import remarkGfm from 'remark-gfm';
import { unified } from "unified"
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
// @ts-ignore
import remarkCalloutDirectives from '@microflash/remark-callout-directives';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from "rehype-slug";
// @ts-ignore
import rehypeFigure from "rehype-figure"
import rehypePrettyCode from "rehype-pretty-code";

export const removeHtmlTag = (e: string) => {
    // 正则匹配删除富文本的标头
    return e.replace(/<[^>]*>|<\/[^>]*>/gm, "").replace(/&.*?;/gm, "");
};

export const convertMdToHtml = async (markdown: string) => {
    const file = await unified()
        // @ts-ignore
        .use(remarkParse)
        // @ts-ignore
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkDirective)
        .use(remarkCalloutDirectives)
        // @ts-ignore
        .use(remarkRehype, { allowDangerousHtml: true })
        // 解析html
        .use(rehypeSlug)
        .use(rehypeFigure)
        .use(rehypePrettyCode)
        // @ts-ignore
        .use(rehypeStringify, { allowDangerousHtml: true })
        .process(markdown)
    return file
}
