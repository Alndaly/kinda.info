import Rss from 'rss';
import { siteMetaData } from '@/data/sitemetadata';
import { format } from 'date-fns';
import { allPosts } from 'contentlayer/generated';

export async function GET(request: Request) {
	const feed = new Rss({
		title: siteMetaData.title,
		description: siteMetaData.description,
		generator: 'Node-RSS feed generator',
		feed_url: `${siteMetaData.siteUrl}/rss`,
		site_url: siteMetaData.siteUrl,
		image_url: `${siteMetaData.siteUrl}${siteMetaData.cover}`,
		docs: siteMetaData.siteUrl,
		language: siteMetaData.language,
		copyright: 'CC BY-NC-SA 4.0',
	});

	allPosts.forEach((post) => {
		feed.item({
			title: post.title ? post.title : '暂无标题哦',
			description: post.description ? post.description : '暂无描述',
			author: siteMetaData.author,
			url: `${siteMetaData.siteUrl}${post.slug}`,
			guid: `${siteMetaData.siteUrl}${post.slug}`,
			date: format(new Date(post.createTime), 'LLLL d, yyyy HH:mm'),
		});
	});

	return new Response(feed.xml(), {
		headers: {
			'Content-Type': 'application/xml',
		},
	});
}
