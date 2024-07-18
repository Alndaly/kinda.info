import { Client } from '@notionhq/client'
import { cache } from 'react'

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export const getArticles = cache(async () => {
    const response = await notion.databases.query({
        database_id: 'efe5db924ac24e8da24ba07c3dc8e441',
        // database_id: '22d0ed9dda914633b674edbb90b488b9',
        sorts: [
            {
                property: 'Last edited time',
                direction: 'ascending',
            },
        ],
    });
    return response
})

export const getArticle = async (pageId: string) => {
    const response = await notion.pages.retrieve({ page_id: pageId });
    return response
}


export const getBlocks = cache(async (blockId: string) => {
    const response = await notion.blocks.children.list({
        block_id: blockId,
        page_size: 100,
    });
    return response
})