import Link from 'next/link';
import { compareDesc, format, parseISO } from 'date-fns';
import { allPosts, Post } from 'contentlayer/generated';
import { removeHtmlTag } from '@/app/utils';
import Youtube from './components/youtube';

function PostCard(post: Post) {
	return (
		<div className='mb-8 mx-auto w-full max-w-6xl'>
			<h2 className='mb-1 text-xl'>
				<Link href={post.slug} className='font-bold no-underline'>
					{post.title}
				</Link>
			</h2>
			<time
				dateTime={format(new Date(post.createTime), 'LLLL d, yyyy HH:mm')}
				className='mb-2 block text-xs text-gray-600 flex flex-row space-x-5'>
				<div>{format(new Date(post.createTime), 'LLLL d, yyyy')}</div>
				<div>{post.readingTime.text}</div>
			</time>
			<div className='line-clamp-2 text-gray-400 text-sm'>
				{post.description ? post.description : removeHtmlTag(post.body.raw)}
			</div>
		</div>
	);
}

export default function Home() {
	const posts = allPosts.sort((a, b) =>
		compareDesc(new Date(a.createTime), new Date(b.createTime))
	);

	return (
		<>
			<Youtube
				src='https://www.youtube.com/embed/VNu15Qqomt8?autoplay=1&autohide=1&border=0&wmode=opaque&enablejsapi=1&controls=0&modestbranding=1&iv_load_policy=1&start=55'
				title=''
			/>
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
