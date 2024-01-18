import { allPages, type Page } from 'contentlayer/generated';
import { notFound } from 'next/navigation';
import { Mdx } from '@/app/mdx-components';

export const generateStaticParams = async () =>
	allPages.map((page) => ({ slug: page._raw.flattenedPath }));

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
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
		<article className='prose dark:prose-invert mx-auto max-w-xl py-8 relative'>
			<h1 className='text-3xl font-bold'>{page.title}</h1>
			<Mdx code={page.body.code}></Mdx>
		</article>
	);
};

export default Page;
