import moment from 'moment-timezone';
import { allPosts, type Post } from 'contentlayer/generated';
import { notFound } from 'next/navigation';
import TableOfContent from '@/app/components/toc';
import Link from 'next/link';
import { siteConfig } from '@/site.config';
import cls from 'classnames';
import ScrollTopAndComment from '@/app/components/scroll-top-and-comment';
import Comments from '../../components/comments';
import { convertMdToHtml } from '@/app/utils';

interface PostProps {
	params: {
		slug: string[];
	};
}

interface AdjacentPost {
	previousPostTitle?: string;
	previousPostSlug?: string;
	nextPostTitle?: string;
	nextPostSlug?: string;
}

async function getPostFromParams(params: PostProps['params']) {
	const slug = params?.slug?.join('/');
	const post = allPosts.find((post: Post) => post.slugAsParams === slug);

	if (!post) {
		null;
	}

	return post;
}

async function getAdjacentPosts(post: Post) {
	const sortedPosts = allPosts.sort(
		(a: Post, b: Post) => a.updateTime - b.updateTime
	);

	const currentIndex = sortedPosts.findIndex((p: Post) => p === post);

	const previousPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;
	const nextPost =
		currentIndex < sortedPosts.length - 1
			? sortedPosts[currentIndex + 1]
			: null;

	const result: AdjacentPost = {};

	if (previousPost) {
		result.previousPostTitle = previousPost.title;
		result.previousPostSlug = previousPost.slugAsParams;
	}

	if (nextPost) {
		result.nextPostTitle = nextPost.title;
		result.nextPostSlug = nextPost.slugAsParams;
	}

	return result;
}

export async function generateMetadata({ params }: PostProps) {
	const post = await getPostFromParams(params);

	if (!post) {
		return {};
	}

	const title = post.title ? post.title : post.slugAsParams;

	return {
		title: title,
		description: post.description,
		openGraph: {
			url: `/post/${post.slugAsParams}`,
			title: title + ' - ' + siteConfig.author,
			description: post.description,
			type: 'article',
			images: [
				post.image == '' ? { url: `/og?title=${title}` } : { url: post.image },
			],
		},
	};
}

export async function generateStaticParams() {
	return allPosts.map((post: Post) => ({
		slug: post.slugAsParams.split('/'),
	}));
}

const PostPage = async ({ params }: PostProps) => {
	// Find the post for the current page.
	const post: Post | undefined = allPosts.find((post: Post) => {
		return post._raw.flattenedPath === 'post/' + params.slug;
	});

	// 404 if the post does not exist.
	if (!post) notFound();

	const title = post.title ? post.title : post.slugAsParams;

	const content = await convertMdToHtml(post.body.raw);

	const adjacentPosts = await getAdjacentPosts(post);
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		datePublished: post.createTime,
		dateModified: post.updateTime,
		headline: title,
		image:
			post.image == ''
				? [`/og?title=${title}`]
				: [post.image, `/og?title=${title}`],
		description: post.description,
		author: [
			{
				'@type': 'Person',
				name: `${siteConfig.author}`,
				url: `/about`,
			},
		],
	};

	return (
		<>
			<section>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</section>
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
					{post.readingTime.words} words · {post.readingTime.text} · Last
					updated on{' '}
					{moment(post.updateTime).tz(siteConfig.timeZone).format('LLLL')}
				</div>
				{title && <h1 className='pt-8'>{title}</h1>}
				{post?.image && (
					<img
						src={post.image}
						alt='bg'
						className='rounded-lg w-full aspect-video'
					/>
				)}
				{post.description && <div>{post.description}</div>}
				<hr />
				{post.headings && post.headings.length > 0 && (
					<TableOfContent headings={post.headings} />
				)}
				{/* @ts-ignore */}
				<div dangerouslySetInnerHTML={{ __html: content.value }}></div>
				<Link
					href='https://creativecommons.org/licenses/by-nc-sa/4.0/'
					target='_blank'>
					<p className='py-2 text-sm text-right sm:text-left text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-200 transition duration-400'>
						CC BY-NC-SA 4.0
					</p>
				</Link>
				<Comments />
				<hr />
				<div className='justify-between flex leading-relaxed'>
					<div>
						{adjacentPosts.previousPostTitle && (
							<div>
								<div>Previous Post</div>
								<Link href={`/post/${adjacentPosts.previousPostSlug}`}>
									{adjacentPosts.previousPostTitle}
								</Link>
							</div>
						)}
					</div>
					<div>
						{adjacentPosts.nextPostTitle && (
							<div className='mb-0 pb-0'>
								<div>Next Post</div>
								<Link href={`/post/${adjacentPosts.nextPostSlug}`}>
									{adjacentPosts.nextPostTitle}
								</Link>
							</div>
						)}
					</div>
				</div>
			</article>
			<ScrollTopAndComment />
		</>
	);
};

export default PostPage;
