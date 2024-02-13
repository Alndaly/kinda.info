import { allPosts } from 'contentlayer/generated';
import PostCard from './components/post-card';

export default function Home() {
	const posts = allPosts.sort((a, b) => b.updateTime - a.updateTime);

	return (
		<div className='prose dark:prose-invert lg:prose-lg xl:prose-xl mx-auto px-8 md:px-0'>
			<p className='text-center italic text-xl pt-8'>
				{'"天空生而蔚蓝，我们生而自由。"'}
			</p>
			<div>
				{posts.map((post, idx) => (
					<PostCard key={idx} {...post} />
				))}
			</div>
		</div>
	);
}
