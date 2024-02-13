import Link from 'next/link';
import moment from 'moment-timezone';
import { allPosts, Post } from 'contentlayer/generated';
import { removeHtmlTag } from '@/app/utils';
import { notFound } from 'next/navigation';

interface TagPostsProps {
	params: {
		slug: string[];
	};
}

function PostCard(post: Post) {
	return (
		<div className='mb-8 w-full'>
			<h2 className='mb-1 text-xl'>
				<Link href={post.slug} className='font-bold no-underline'>
					{post.title}
				</Link>
			</h2>
			<div className='mb-2 text-xs text-gray-600'>
				<time
					dateTime={moment(post.updateTime)
						.tz('Asia/Shanghai')
						.format('LLLL d, yyyy HH:mm')}></time>
				<span className='mr-2'>
					{moment(post.updateTime).tz('Asia/Shanghai').format('LLLL')}
				</span>
				<span className='mr-2'>{post.readingTime.text}</span>
				{post.tags.map((tag, index) => {
					return (
						<Link key={index} href={`/tag/${tag}`} className='mr-2'>
							{tag}
						</Link>
					);
				})}
			</div>
			<div className='line-clamp-2 text-gray-400 text-sm'>
				{post.description ? post.description : removeHtmlTag(post.body.raw)}
			</div>
		</div>
	);
}

export default function TagPosts({ params }: TagPostsProps) {
	const posts = allPosts
		.filter((post) => post.tags.includes(params?.slug[0]))
		.sort((a, b) => b.updateTime - a.updateTime)
		.sort((a, b) => {
			if (a.order && b.order) {
				return a.order - b.order;
			} else if (a.order && !b.order) {
				return -1;
			} else if (!a.order && b.order) {
				return 1;
			}
			return 0;
		});
	if (!posts) {
		notFound();
	}

	return (
		<div className='prose dark:prose-invert mx-auto px-8 md:px-0 lg:prose-lg xl:prose-xl'>
			<h1 className='italic pt-8 font-bold'>{params?.slug[0]}</h1>
			<p>{`${posts.length} blog${posts.length > 1 ? 's' : ''} in total`} </p>
			<hr />
			<div>
				{posts.map((post, idx) => (
					<PostCard key={idx} {...post} />
				))}
			</div>
		</div>
	);
}
