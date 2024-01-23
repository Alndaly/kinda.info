import { allPages, type Page } from 'contentlayer/generated';
import { notFound } from 'next/navigation';
import { Mdx } from '@/app/mdx-components';
import cls from 'classnames';
import Image from 'next/image';
import Comments from '../components/comments';
import ScrollTopAndComment from '../components/scroll-top-and-comment';
import { siteMetaData } from '../../data/sitemetadata';

interface PageProps {
	params: {
		slug: string[];
	};
}

async function getPageFromParams(params: PageProps['params']) {
	const slug = params?.slug?.join('/');
	const page = allPages.find((page: Page) => page.slugAsParams === slug);

	if (!page) {
		null;
	}

	return page;
}

export async function generateMetadata({ params }: PageProps) {
	const page = await getPageFromParams(params);

	if (!page) {
		return {};
	}

	return {
		title: page.title + ' - ' + siteMetaData.publisher,
		description: page.description,
		openGraph: {
			title: page.title + ' - ' + siteMetaData.publisher,
			description: page.description,
			url: '/' + page.slugAsParams,
			siteName: siteMetaData.siteName,
			images: [
				{
					url: `/og?title=${page.title}`,
				},
			],
			locale: siteMetaData.language,
			type: 'website',
		},
	};
}

export async function generateStaticParams(): Promise<PageProps['params'][]> {
	return allPages.map((page: any) => ({
		slug: page.slugAsParams.split('/'),
	}));
}

const Page = async ({ params }: PageProps) => {
	const page = await getPageFromParams(params);

	if (!page) {
		notFound();
	}

	return (
		<>
			{page?.image && (
				<div className='w-full h-52 sm:h-72 md:h-96 relative top-0 relative'>
					<Image
						src={page.image}
						alt='bg'
						fill
						style={{ objectFit: 'cover' }}
					/>
					<div className='px-8 sm:px-0 max-w-prose prose-h1:mb-0 lg:prose-lg w-full absolute z-100 mx-auto clear-both text-center top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2'>
						<div className='py-5 px-5 backdrop-blur-sm box-border bg-white/50 dark:bg-black/50 shadow rounded'>
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
				{!page.image && page.title && (
					<h1>{page.title}</h1>
				)}
				<div>{page.description}</div>
				<hr />
				<Mdx code={page.body.code}></Mdx>
				<Comments />
			</article>
			<ScrollTopAndComment />
		</>
	);
};

export default Page;
