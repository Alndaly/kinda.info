import moment from 'moment-timezone';
import { allPosts, type Post } from 'contentlayer/generated';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import TableOfContent from '@/app/components/toc';
import Link from 'next/link';
import { siteConfig } from '@/site.config';
import cls from 'classnames';
import ScrollTopAndComment from '@/app/components/scroll-top-and-comment';
import { Mdx } from '@/app/components/mdx-components';
import Comments from '../../components/comments';

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
	const sortedPosts = allPosts.sort((a: Post, b: Post) => {
		const aDate: any = a.createTime;
		const bDate: any = b.createTime;
		return bDate - aDate;
	});

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

	return {
		title: post.title + ' - ' + siteConfig.author,
		description: post.description,
		openGraph: {
			url: `/post/${post.slugAsParams}`,
			title: post.title + ' - ' + siteConfig.author,
			description: post.description,
			type: 'article',
			images: [
				post.image == ''
					? { url: `/og?title=${post.title}` }
					: { url: post.image },
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

	const adjacentPosts = await getAdjacentPosts(post);
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		datePublished: post.createTime,
		dateModified: post.updateTime,
		headline: post.title,
		image:
			post.image == ''
				? [`/og?title=${post.title}`]
				: [post.image, `/og?title=${post.title}`],
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
					{moment(post.updateTime).tz('Asia/Shanghai').format('LLLL')}
				</div>
				{post.title && <h1 className='pt-8'>{post.title}</h1>}
				{post.tags && (
					<p className='flex flex-row gap-2'>
						{post.tags.map((tag, index) => {
							return (
								<Link
									className='!font-light text-sm border-none'
									key={index}
									href={`/tag/${tag}`}>
									{`# ${tag}`}
								</Link>
							);
						})}
					</p>
				)}
				{post?.image && (
					<Image
						src={post.image}
						alt='bg'
						width={1920}
						height={1080}
						className='rounded-lg'
						style={{ objectFit: 'cover' }}
					/>
				)}
				{post.description && <div>{post.description}</div>}
				<hr />
				{post.headings && post.headings.length > 0 && (
					<TableOfContent headings={post.headings} />
				)}
				<Mdx code={post.body.code}></Mdx>
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
