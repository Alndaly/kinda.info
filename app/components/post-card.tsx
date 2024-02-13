import Link from 'next/link';
import moment from 'moment-timezone';
import { siteConfig } from '@/site.config';
import { removeHtmlTag } from '@/app/utils';
import { Post } from 'contentlayer/generated';

const PostCard = (post: Post) => {
	return (
		<div className='mb-8 w-full'>
			<h2 className='text-xl !mb-5'>
				<Link href={post.slug} className='font-bold no-underline'>
					{post.title}
				</Link>
			</h2>
			<div className='mb-2 text-xs text-gray-500'>
				<time
					dateTime={moment(post.updateTime)
						.tz(siteConfig.timeZone)
						.format('lll')}></time>
				<span className='mr-2'>
					last updated at {moment(post.updateTime).tz(siteConfig.timeZone).format('lll')}
				</span>
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
};

export default PostCard;
