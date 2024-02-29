import { allPages, type Page } from 'contentlayer/generated';
import { notFound } from 'next/navigation';
import { Mdx } from '@/app/components/mdx-components';
import moment from 'moment-timezone';
import cls from 'classnames';
import Comments from '../components/comments';
import ScrollTopAndComment from '../components/scroll-top-and-comment';
import { siteConfig } from '../../site.config';

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
		title: page.title + ' - ' + siteConfig.author,
		description: page.description,
		openGraph: {
			title: page.title + ' - ' + siteConfig.author,
			description: page.description,
			url: '/' + page.slugAsParams,
			siteName: siteConfig.siteName,
			images: [
				{
					url: `/og?title=${page.title}`,
				},
			],
			locale: siteConfig.language,
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
				<div className='text-sm prose-sm select-none'>
					{page.readingTime.words} words · {page.readingTime.text} · Last
					updated on{' '}
					{moment(page.updateTime).tz(siteConfig.timeZone).format('LLLL')}
				</div>
				{page.title && <h1 className='pt-8'>{page.title}</h1>}
				{page?.image && (
					<img
						src={page.image}
						alt='bg'
						className='rounded-lg w-full aspect-video'
					/>
				)}
				{page.description && <div>{page.description}</div>}
				<hr />
				<Mdx code={page.body.code}></Mdx>
				<Comments />
			</article>
			<ScrollTopAndComment />
		</>
	);
};

export default Page;
