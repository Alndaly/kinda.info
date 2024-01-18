import { format, parseISO } from 'date-fns';
import { allPosts, type Post } from 'contentlayer/generated';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Mdx } from '@/app/mdx-components';

export const generateStaticParams = async () =>
	allPosts.map((post) => ({ slug: post._raw.flattenedPath }));

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
			<div className='w-full h-96 relative top-0'>
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
			</div>
			<article className='prose dark:prose-invert mx-auto max-w-xl py-8 relative'>
				<h1 className='text-3xl font-bold'>{post.title}</h1>
				<div className='mb-8 text-xs text-gray-600 flex flex-row space-x-5'>
					<div>{format(parseISO(post.date), 'LLLL d, yyyy')}</div>
					<div>{post.readingTime.text}</div>
				</div>
				<Mdx code={post.body.code}></Mdx>
			</article>
		</>
	);
};

export default PostPage;
