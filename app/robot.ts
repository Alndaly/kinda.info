import { siteMetaData } from '@/data/sitemetadata';

export default function robots() {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
		},
		sitemap: `${siteMetaData.siteUrl}/sitemap.xml`,
	};
}
