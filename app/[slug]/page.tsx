import { allPages, type Page } from 'contentlayer/generated';
import { notFound } from 'next/navigation';
import { Mdx } from '@/app/mdx-components';
import cls from 'classnames';

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
			{page.title && <h1 className='text-5xl font-bold'>{page.title}</h1>}
			<Mdx code={page.body.code}></Mdx>
		</article>
	);
};

export default Page;
