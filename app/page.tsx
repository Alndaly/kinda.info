import Link from 'next/link';
import { compareDesc, format, parseISO } from 'date-fns';
import { allPosts, Post } from 'contentlayer/generated';
import { removeHtmlTag } from '@/app/utils';

function PostCard(post: Post) {
	return (
		<div className='mb-8 mx-auto w-full max-w-6xl'>
			<h2 className='mb-1 text-xl'>
				<Link href={post.url} className='font-bold no-underline'>
					{post.title}
				</Link>
			</h2>
			<time
				dateTime={post.date}
				className='mb-2 block text-xs text-gray-600 flex flex-row space-x-5'>
				<div>{format(parseISO(post.date), 'LLLL d, yyyy')}</div>
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
		compareDesc(new Date(a.date), new Date(b.date))
	);

	return (
		<div className='px-4 py-8 md:px-6 md:py-10 lg:py-12'>
			{posts.map((post, idx) => (
				<PostCard key={idx} {...post} />
			))}
		</div>
	);
}
