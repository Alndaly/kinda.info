import Link from 'next/link';
import Comments from '@/components/comments';
import NotionBlock from '@/components/notion';
import { getPageData, getBlocks, getDatabaseData } from '@/service/articles';
import moment from 'moment-timezone';
import ScrollTopAndComment from '@/components/scroll-top-and-comment';
import {
	BlockObjectResponse,
	GetPageResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { redirect } from 'next/navigation';
import { getTableOfContents } from '@/utils/md';

export const revalidate = 3600;

interface PostProps {
	params: Promise<{
		slug: string;
	}>;
}

export async function generateStaticParams() {
	const articles = await getDatabaseData();
	const tasks = articles.results.map(async (article) => {
		const res = await getPageData(article.id);
		return res;
	});
	const posts = await Promise.all(tasks);
	return posts.map((post) => ({
		slug: post.id,
	}));
}

export async function generateMetadata({ params }: PostProps) {
	const { slug } = await params;
	const blocks = (await getBlocks(slug)).results;
	const article: GetPageResponse = await getPageData(slug);
	// 动态提取标题、描述和作者
	// @ts-ignore
	const title =
		// @ts-ignore
		article.properties.Name?.title.map((t: any) => t.plain_text).join('') ||
		'该页面莫得标题';
	// @ts-ignore
	const description =
		// @ts-ignore
		article.properties.Summary?.rich_text
			.map((s: any) => s.plain_text)
			.join('') || '该页面莫得描述';
	// @ts-ignore
	const author =
		// @ts-ignore
		article.properties.Author?.people?.map((p: any) => p.name).join(', ') ||
		'未知作者';

	return {
		title,
		description,
		authors: [{ name: author }], // 作者信息
		openGraph: {
			title,
			description,
			siteName: 'kinda, a blog',
			type: 'article',
			image: 'https://oss.kinda.info/image/202502042221927.jpeg',
			authors: [author], // Open Graph 支持的作者字段
		},
		twitter: {
			// card: 'summary_large_image',
			title,
			description,
			creator: author, // Twitter 卡片中的作者信息
		},
	};
}

const PostPage = async ({ params }: PostProps) => {
	// Find the post for the current page.
	const { slug } = await params;
	const blocks = (await getBlocks(slug)).results;
	const headers = getTableOfContents(blocks);
	const article: GetPageResponse = await getPageData(slug);
	// @ts-ignore
	if (!article.properties.Published.checkbox) {
		// 如果文章是未发布的，则重定向到404页面
		redirect('/not-found');
	}

	return (
		<div>
			<article className='prose dark:prose-invert mx-auto p-5 sm:p-10'>
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
						<div className='rounded ring-1 ring-inset dark:ring-white/10 ring-black/10 bg-black/5 dark:bg-white/5 p-5'>
							<p className='my-0 font-bold text-lg pb-2 font-mono flex flex-row items-center gap-2 italic dark:text-yellow-200 text-yellow-500'>
								AI Summary
							</p>
							{/* @ts-ignore */}
							{article.properties.Summary.rich_text.map(
								(summary: any, index: number) => {
									return <span key={index}>{summary.plain_text}</span>;
								}
							)}
						</div>
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
			<ScrollTopAndComment />
		</div>
	);
};

export default PostPage;
