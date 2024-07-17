import Link from 'next/link';
import Comments from '@/components/comments';
import NotionBlock from '@/components/notion';
import { getArticle, getBlocks } from '@/service/articles';
import moment from 'moment-timezone';
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

interface PostProps {
	params: {
		slug: string[];
	};
}

const PostPage = async ({ params }: PostProps) => {
	// Find the post for the current page.
	const { slug } = params;
	const blocks = (await getBlocks(slug[0])).results;
	const article = await getArticle(slug[0]);
	return (
		<>
			<article className='mt-[64px] prose dark:prose-invert lg:prose-lg xl:prose-xl sm:mx-auto mx-5'>
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
