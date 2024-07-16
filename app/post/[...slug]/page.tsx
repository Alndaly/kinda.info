import Link from 'next/link';
import cls from 'classnames';

interface PostProps {
	params: {
		slug: string[];
	};
}

const PostPage = async ({ params }: PostProps) => {
	// Find the post for the current page.

	return (
		<>
			<article
				className={cls(
					'prose',
					'lg:prose-lg',
					'xl:prose-xl',
					'dark:prose-invert',
					'prose-table:break-all',
					'prose-a:no-underline',
					'prose-a:border-b',
					'hover:prose-a:border-b-2',
					'prose-a:font-bold',
					'mx-auto',
					'py-8',
					'px-8',
					'md:px-0'
				)}>
				{/* @ts-ignore */}
				<div dangerouslySetInnerHTML={{ __html: content.value }}></div>
				<Link
					href='https://creativecommons.org/licenses/by-nc-sa/4.0/'
					target='_blank'>
					<p className='py-2 text-sm text-right sm:text-left text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-200 transition duration-400'>
						CC BY-NC-SA 4.0
					</p>
				</Link>
			</article>
		</>
	);
};

export default PostPage;
