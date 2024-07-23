import { Client } from '@notionhq/client'
import { cache } from 'react'

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export const getArticles = cache(async (databaseID?: string) => {
    const response = await notion.databases.query({
        database_id: databaseID ? databaseID : process.env.NOTION_PAGE_ID!,
        sorts: [
            {
                property: 'Last edited time',
                direction: 'descending',
            },
        ],
        filter: {
            and: [
                {
                    property: 'Published',
                    checkbox: {
                        equals: true,
                    },
                },
            ],
        }
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