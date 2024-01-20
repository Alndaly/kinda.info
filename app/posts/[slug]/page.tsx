import { format, parseISO } from 'date-fns';
import { allPosts, type Post } from 'contentlayer/generated';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import cls from 'classnames';
import { Mdx } from '@/app/mdx-components';

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
	const post = allPosts.find(
		(post) => post._raw.flattenedPath === 'posts/' + params.slug
	);
	if (!post) throw new Error(`Post not found for slug: ${params.slug}`);
	return { title: post.title };
};

const PostPage = ({ params }: { params: { slug: string } }) => {
	// Find the post for the current page.
	const post = allPosts.find((post) => {
		return post._raw.flattenedPath === 'posts/' + params.slug;
	});

	// 404 if the post does not exist.
	if (!post) notFound();

	return (
		<>
			<div className='w-full h-52 sm:h-72 md:h-96 relative top-0 relative'>
				<Image
					src={
						post?.bgImage
							? post.bgImage
							: 'https://oss.kinda.info/image/202401190030996.jpg'
					}
					alt='bg'
					fill
					style={{ objectFit: 'cover' }}
				/>
				<div className='px-8 sm:px-0 max-w-prose lg:prose-lg w-full absolute z-100 mx-auto clear-both text-center top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2'>
					<div className='py-5 px-5 backdrop-blur-sm box-border bg-white/50 dark:bg-black/50 shadow rounded'>
						{post.title && <h1 className='text-5xl font-bold'>{post.title}</h1>}
						<div className='mb-2 text-sm'>
							{format(parseISO(post.date), 'LLLL d, yyyy')}
						</div>
						<div className='text-sm'>{post.readingTime.text}</div>
					</div>
				</div>
			</div>
			<article
				className={cls(
					'prose',
					'lg:prose-lg',
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
				<Mdx code={post.body.code}></Mdx>
			</article>
		</>
	);
};

export default PostPage;
