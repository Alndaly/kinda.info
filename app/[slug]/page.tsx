import { allPages, type Page } from 'contentlayer/generated';
import { notFound } from 'next/navigation';
import { Mdx } from '@/app/mdx-components';
import cls from 'classnames';
import Image from 'next/image';

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
	if (params.slug.endsWith('js')) return;
	const page = allPages.find(
		(page) => page._raw.flattenedPath === 'pages/' + params.slug
	);
	if (!page) throw new Error(`Post not found for slug: ${params.slug}`);
	return { title: page.title };
};

const Page = ({ params }: { params: { slug: string } }) => {
	// Find the post for the current page.
	const page = allPages.find((page) => {
		return page._raw.flattenedPath === 'pages/' + params.slug;
	});

	// 404 if the post does not exist.
	if (!page) notFound();

	return (
		<>
			{page?.bgImage && (
				<div className='w-full h-96 relative top-0 relative'>
					<Image
						src={page.bgImage}
						alt='bg'
						fill
						style={{ objectFit: 'cover' }}
					/>
					<div className='px-8 sm:px-0 max-w-prose prose-h1:mb-0 lg:prose-lg w-full absolute z-100 mx-auto clear-both text-center top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2'>
						<div className='py-5 backdrop-blur-sm box-border bg-white/50 dark:bg-black/50 shadow rounded'>
							{page.title && (
								<h1 className='text-5xl font-bold'>{page.title}</h1>
							)}
						</div>
					</div>
				</div>
			)}
			<article
				className={cls(
					'dark:prose-invert',
					'prose-table:break-all',
					'prose-a:no-underline',
					'prose-a:border-b',
					'hover:prose-a:border-b-2',
					'prose-a:font-bold',
					'mx-auto',
					'py-8',
					'px-8',
					'md:px-0',
					{ prose: page.style !== 'website' },
					{ 'lg:prose-lg': page.style !== 'website' },
					{ 'max-w-none': page.style === 'website' }
				)}>
				<Mdx code={page.body.code}></Mdx>
			</article>
		</>
	);
};

export default Page;
