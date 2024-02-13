import { allPosts } from 'contentlayer/generated';
import { notFound } from 'next/navigation';
import PostCard from '@/app/components/post-card';

interface TagPostsProps {
	params: {
		slug: string[];
	};
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
