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
		<div className='mb-8 mx-auto w-full max-w-6xl'>
			<h2 className='mb-1 text-xl'>
				<Link href={post.slug} className='font-bold no-underline'>
					{post.title}
				</Link>
			</h2>
			<time
				dateTime={moment(post.createTime)
					.tz('Asia/Shanghai')
					.format('LLLL d, yyyy HH:mm')}
				className='mb-2 block text-xs text-gray-600 flex flex-row space-x-5'>
				<div>{moment(post.createTime).tz('Asia/Shanghai').format('LLLL')}</div>
				<div>{post.readingTime.text}</div>
				{post.tags.map((tag, index) => {
					return (
						<Link key={index} href={`/tag/${tag}`}>
							{tag}
						</Link>
					);
				})}
			</time>
			<div className='line-clamp-2 text-gray-400 text-sm'>
				{post.description ? post.description : removeHtmlTag(post.body.raw)}
			</div>
		</div>
	);
}

export default function TagPosts({ params }: TagPostsProps) {
	const posts = allPosts
		.filter((post) => post.tags.includes(params?.slug[0]))
		.sort((a, b) => b.createTime - a.createTime);
	if (!posts) {
		notFound();
	}

	return (
		<>
			<p className='text-center italic text-xl pt-8'>
				{'# ' + params?.slug[0]}
			</p>
			<div className='px-4 py-8 md:px-6 md:py-10 lg:py-12'>
				{posts.map((post, idx) => (
					<PostCard key={idx} {...post} />
				))}
			</div>
		</>
	);
}