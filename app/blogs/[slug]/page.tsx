import { format, parseISO } from 'date-fns';
import { allBlogs, type Blog } from 'contentlayer/generated';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import cls from 'classnames';
import { Mdx } from '@/app/mdx-components';
import Comments from '../../components/comments';

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
	const blog = allBlogs.find(
		(blog) => blog._raw.flattenedPath === 'blogs/' + params.slug
	);
	if (!blog) throw new Error(`Blog not found for slug: ${params.slug}`);
	return { title: blog.title };
};

const BlogPage = ({ params }: { params: { slug: string } }) => {
	// Find the blog for the current page.
	const blog = allBlogs.find((blog) => {
		return blog._raw.flattenedPath === 'blogs/' + params.slug;
	});

	// 404 if the blog does not exist.
	if (!blog) notFound();

	return (
		<>
			<div className='w-full h-52 sm:h-72 md:h-96 relative top-0 relative'>
				<Image
					src={
						blog?.bgImage
							? blog.bgImage
							: 'https://oss.kinda.info/image/202401211555429.jpeg'
					}
					alt='bg'
					fill
					style={{ objectFit: 'cover' }}
				/>
				<div className='px-8 sm:px-0 max-w-prose lg:prose-lg w-full absolute z-100 mx-auto clear-both text-center top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2'>
					<div className='py-5 px-5 backdrop-blur-sm box-border bg-white/50 dark:bg-black/50 shadow rounded'>
						{blog.title && <h1 className='text-5xl font-bold'>{blog.title}</h1>}
						<div className='mb-2 text-sm'>
							{format(parseISO(blog.date), 'LLLL d, yyyy')}
						</div>
						<div className='text-sm'>{blog.readingTime.text}</div>
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
				<Mdx code={blog.body.code}></Mdx>
				<Comments />
			</article>
		</>
	);
};

export default BlogPage;
