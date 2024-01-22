import { format, parseISO } from 'date-fns';
import { allPosts, type Post } from 'contentlayer/generated';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { siteMetadata } from '@/data/sitemetadata';
import cls from 'classnames';
import { Mdx } from '@/app/mdx-components';
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
		const aDate: any = a.date;
		const bDate: any = b.date;
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
		title: post.title + ' - ' + siteMetadata.publishName,
		description: post.description,
		openGraph: {
			url: `/post/${post.slugAsParams}`,
			title: post.title + ' - ' + siteMetadata.publishName,
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
		datePublished: post.date,
		dateModified: post.date,
		headline: post.title,
		image:
			post.image == ''
				? [`/og?title=${post.title}`]
				: [post.image, `/og?title=${post.title}`],
		description: post.description,
		author: [
			{
				'@type': 'Person',
				name: `${siteMetadata.author}`,
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
			<div className='w-full h-52 sm:h-72 md:h-96 relative top-0 relative'>
				<Image
					src={
						post?.image
							? post.image
							: 'https://oss.kinda.info/image/202401211555429.jpeg'
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
				<div className='justify-between flex gap-8 py-8 leading-relaxed'>
					{adjacentPosts.previousPostTitle && (
						<div>
							<div>Previous Post</div>
							<Link href={`/post/${adjacentPosts.previousPostSlug}`}>
								{adjacentPosts.previousPostTitle}
							</Link>
						</div>
					)}

					{adjacentPosts.nextPostTitle && (
						<div className='mb-0 pb-0'>
							<div>Next Post</div>
							<Link href={`/post/${adjacentPosts.nextPostSlug}`}>
								{adjacentPosts.nextPostTitle}
							</Link>
						</div>
					)}
				</div>
				<Comments />
			</article>
		</>
	);
};

export default PostPage;
