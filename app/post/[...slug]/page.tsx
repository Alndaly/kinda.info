import Link from 'next/link';
import Comments from '@/components/comments';
import NotionBlock from '@/components/notion';
import { getPageData, getBlocks } from '@/service/articles';
import moment from 'moment-timezone';
import {
	BlockObjectResponse,
	GetPageResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { redirect } from 'next/navigation';
import { getTableOfContents } from '@/utils/md';
import { DashboardTableOfContents } from '@/components/toc';

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
	const headers = getTableOfContents(blocks);
	const article: GetPageResponse = await getPageData(slug[0]);
	// @ts-ignore
	if (!article.properties.Published.checkbox) {
		// 如果文章是未发布的，则重定向到404页面
		redirect('/not-found');
	}
	return (
		<div className='flex flex-row gap-5'>
			<article className='prose dark:prose-invert max-w-none flex-1 p-5 sm:p-10'>
				{/* @ts-ignore */}
				{article.properties.Name.title.map((title: any, index: number) => {
					return <h1 key={index}>{title.plain_text}</h1>;
				})}
				<p className='text-sm text-zinc-500 dark:text-zinc-400'>
					上次更新:{' '}
					{moment
						.tz(
							// @ts-ignore
							article.properties['Last edited time'].last_edited_time,
							'Asia/Shanghai'
						)
						.format('LLLL')}
				</p>
				{/* @ts-ignore */}
				{article.properties.Summary?.rich_text &&
					// @ts-ignore
					article.properties.Summary?.rich_text.length > 0 && (
						<p className='rounded ring-1 ring-inset dark:ring-white/10 dark:bg-white/5 ring-black/10 bg-black/5 p-5'>
							<div className='font-bold text-lg pb-2 font-mono flex flex-row items-center gap-2 italic dark:text-yellow-200 text-yellow-500'>
								AI Summary
							</div>
							{/* @ts-ignore */}
							{article.properties.Summary.rich_text.map(
								(summary: any, index: number) => {
									return <span key={index}>{summary.plain_text}</span>;
								}
							)}
						</p>
					)}
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
			<div className='hidden md:flex w-1/4 h-full overflow-auto sticky top-[64px] p-5 sm:p-10'>
				<DashboardTableOfContents toc={headers} />
			</div>
		</div>
	);
};

export default PostPage;
