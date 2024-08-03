import Link from 'next/link';
import Comments from '@/components/comments';
import NotionBlock from '@/components/notion';
import { getPageData, getDatabaseData, getBlocks } from '@/service/articles';
import moment from 'moment-timezone';
import {
	BlockObjectResponse,
	GetPageResponse,
	QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { redirect } from 'next/navigation';

export const revalidate = 3600;

interface PostProps {
	params: {
		slug: string[];
	};
}

// export const generateStaticParams = async () => {
// 	const articles: QueryDatabaseResponse = await getDatabaseData();
// 	return articles.results.map((article) => ({
// 		slug: [article.id],
// 	}));
// };

const PostPage = async ({ params }: PostProps) => {
	// Find the post for the current page.
	const { slug } = params;
	const blocks = (await getBlocks(slug[0])).results;
	const article: GetPageResponse = await getPageData(slug[0]);
	// @ts-ignore
	if (!article.properties.Published.checkbox) {
		// 如果文章是未发布的，则重定向到404页面
		redirect('/not-found');
	}
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
						上次更新:{' '}
						{moment
							.tz(
								// @ts-ignore
								article.properties['Last edited time'].last_edited_time,
								'Asia/Shanghai'
							)
							.format('LLLL')}
					</p>
				</div>
				<hr />
				{blocks.map((block) => {
					return (
						<NotionBlock key={block.id} block={block as BlockObjectResponse} />
					);
				})}
				{/* @ts-ignore */}
				{article.properties.Tags.multi_select.length > 0 && (
					<div className='flex flex-row gap-2 py-2'>
						{/* @ts-ignore */}
						{article.properties.Tags.multi_select.map((tag: any) => {
							return (
								<Link
									href={`/tag/${tag.name}`}
									key={tag.id}
									className='text-sm no-underline'>
									{'#' + tag.name}
								</Link>
							);
						})}
					</div>
				)}
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
