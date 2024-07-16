import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export const getArticles = async () => {
    const response = await notion.databases.query({
        database_id: 'efe5db924ac24e8da24ba07c3dc8e441',
        sorts: [
            {
                property: 'Last edited time',
                direction: 'ascending',
            },
        ],
    });
    return response
}

export const getArticle = async (pageId: string) => {
    const response = await notion.pages.retrieve({ page_id: pageId });
    return response
}