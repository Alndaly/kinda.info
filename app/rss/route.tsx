import Rss from 'rss';
import { siteMetadata } from '@/data/sitemetadata';
import { allPosts } from 'contentlayer/generated';

export async function GET(request: Request) {
	const feed = new Rss({
		title: siteMetadata.title,
		description: siteMetadata.description,
		generator: 'Node-RSS feed generator',
		feed_url: `${siteMetadata.siteUrl}/rss`,
		site_url: siteMetadata.siteUrl,
		image_url: `${siteMetadata.siteUrl}${siteMetadata.cover}`,
		docs: siteMetadata.siteUrl,
		language: siteMetadata.language,
		copyright: 'CC BY-NC-SA 4.0',
	});

	allPosts.forEach((post) => {
		feed.item({
			title: post.title ? post.title : '暂无标题哦',
			description: post.description ? post.description : '暂无描述',
			author: siteMetadata.author,
			url: `${siteMetadata.siteUrl}${post.slug}`,
			guid: `${siteMetadata.siteUrl}${post.slug}`,
			date: post.date,
		});
	});

	return new Response(feed.xml(), {
		headers: {
			'Content-Type': 'application/xml',
		},
	});
}
