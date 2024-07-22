import Link from 'next/link';
import Comments from '@/components/comments';
import NotionBlock from '@/components/notion';
import { getArticle, getArticles, getBlocks } from '@/service/articles';
import moment from 'moment-timezone';
import {
	BlockObjectResponse,
	QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';

export const revalidate = 3600;

interface PostProps {
	params: {
		slug: string[];
	};
}

// export const generateStaticParams = async () => {
// 	const articles: QueryDatabaseResponse = await getArticles();
// 	return articles.results.map((article) => ({
// 		slug: [article.id],
// 	}));
// };

const PostPage = async ({ params }: PostProps) => {
	// Find the post for the current page.
	const { slug } = params;
	const blocks = (await getBlocks(slug[0])).results;
	const article = await getArticle(slug[0]);
	return (
		<>
			<article className='prose dark:prose-invert sm:mx-auto p-5 sm:px-0'>
				<div>
					{/* @ts-ignore */}
					{article.properties.Name.title.map((title: any, index: number) => {
						return <h1 key={index}>{title.plain_text}</h1>;
					})}
				</div>
				<div className='text-sm text-zinc-500 dark:text-zinc-400'>
					<p>
						Last update:{' '}
						{moment
							.tz(
								// @ts-ignore
								article.properties['Last edited time'].last_edited_time,
								'Asia/Shanghai'
							)
							.format('YYYY-MM-DD HH:mm:ss')}
					</p>
				</div>
				<hr />
				{blocks.map((block) => {
					return (
						<div key={block.id}>
							<NotionBlock block={block as BlockObjectResponse} />
						</div>
					);
				})}
				<Link
					className='no-underline'
					href='https://creativecommons.org/licenses/by-nc-sa/4.0/'
					target='_blank'>
					<p className='py-2 text-sm text-right sm:text-left text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-200 transition duration-400'>
						CC BY-NC-SA 4.0
					</p>
				</Link>
				<Comments />
			</article>
		</>
	);
};

export default PostPage;
