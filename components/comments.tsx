'use client';

import Giscus from '@giscus/react';
import React from 'react';
import { useTheme } from 'next-themes';
import { siteConfig } from '@/site.config';

const Comments = () => {
	const { theme, resolvedTheme } = useTheme();
	const commentsTheme =
		theme === 'dark' || resolvedTheme === 'dark' ? 'transparent_dark' : 'light';
	return (
		<div id='comments'>
			<Giscus
				repo={`${siteConfig.github}/${siteConfig.siteRepo}`}
				repoId={siteConfig.repoId}
				category='Announcements'
				categoryId={siteConfig.categoryId}
				mapping='pathname'
				reactionsEnabled='1'
				inputPosition='top'
				theme={commentsTheme}
				lang='en'
				// loading='lazy'
			/>
		</div>
	);
};

export default Comments;
