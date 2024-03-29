import Rss from 'rss';
import { siteConfig } from '@/site.config';
import moment from 'moment-timezone';
import { allPosts } from 'contentlayer/generated';

export async function GET(request: Request) {
	const feed = new Rss({
		title: siteConfig.title,
		description: siteConfig.description,
		generator: 'Node-RSS feed generator',
		feed_url: `${siteConfig.siteUrl}/rss`,
		site_url: siteConfig.siteUrl,
		image_url: `${siteConfig.siteUrl}${siteConfig.cover}`,
		docs: siteConfig.siteUrl,
		language: siteConfig.language,
		copyright: 'CC BY-NC-SA 4.0',
	});

	allPosts.forEach((post) => {
		feed.item({
			title: post.title ? post.title : '暂无标题',
			description: post.description ? post.description : '暂无描述',
			author: siteConfig.author,
			url: `${siteConfig.siteUrl}${post.slug}`,
			guid: `${siteConfig.siteUrl}${post.slug}`,
			date: moment(post.updateTime).tz(siteConfig.timeZone).format('LLLL'),
		});
	});

	return new Response(feed.xml(), {
		headers: {
			'Content-Type': 'application/atom+xml; chatset=utf-8',
		},
	});
}
