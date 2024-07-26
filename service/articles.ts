import { Client } from '@notionhq/client'
import { cache } from 'react'
import { ProxyAgent } from 'proxy-agent';
import { GetPageResponse, ListBlockChildrenResponse, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

// The correct proxy `Agent` implementation to use will be determined
// via the `http_proxy` / `https_proxy` / `no_proxy` / etc. env vars
const agent = new ProxyAgent();

const notion = new Client({ auth: process.env.NOTION_TOKEN, agent });

export const getDatabaseData = cache(async (databaseID?: string): Promise<QueryDatabaseResponse> => {
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

export const getPageData = async (pageId: string): Promise<GetPageResponse> => {
    const response = await notion.pages.retrieve({ page_id: pageId });
    return response
}


export const getBlocks = cache(async (blockId: string): Promise<ListBlockChildrenResponse> => {
    const response = await notion.blocks.children.list({
        block_id: blockId,
        page_size: 100,
    });
    return response
})