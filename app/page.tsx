import Link from 'next/link';
import moment from 'moment-timezone';
import { allPosts, Post } from 'contentlayer/generated';
import { removeHtmlTag } from '@/app/utils';

function PostCard(post: Post) {
	return (
		<div className='mb-8 mx-auto w-full max-w-6xl'>
			<h2 className='mb-1 text-xl'>
				<Link href={post.slug} className='font-bold no-underline'>
					{post.title}
				</Link>
			</h2>
			<div className='mb-2 text-xs text-gray-600'>
				<time
					dateTime={moment(post.createTime)
						.tz('Asia/Shanghai')
						.format('LLLL d, yyyy HH:mm')}></time>
				<span className='mr-2'>
					{moment(post.createTime).tz('Asia/Shanghai').format('LLLL')}
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

export default function Home() {
	const posts = allPosts.sort((a, b) => b.createTime - a.createTime);

	return (
		<>
			<p className='text-center italic text-xl pt-8'>
				{'"天空生而蔚蓝，我们生而自由。"'}
			</p>
			<div className='px-4 py-8 md:px-6 md:py-10 lg:py-12'>
				{posts.map((post, idx) => (
					<PostCard key={idx} {...post} />
				))}
			</div>
		</>
	);
}
