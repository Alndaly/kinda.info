'use client';

import Giscus from '@giscus/react';
import React from 'react';
import { useTheme } from 'next-themes';
import { siteMetadata } from '../../data/sitemetadata';

const Comments = () => {
	const { theme, resolvedTheme } = useTheme();
	const commentsTheme =
		theme === 'dark' || resolvedTheme === 'dark' ? 'transparent_dark' : 'light';
	return (
		<Giscus
			repo={`${siteMetadata.github}/${siteMetadata.siteRepo}`}
			repoId={siteMetadata.repoid}
			category='Announcements'
			categoryId={siteMetadata.categoryid}
			mapping='pathname'
			reactionsEnabled='1'
			inputPosition='top'
			theme={commentsTheme}
			lang='en'
			loading='lazy'
		/>
	);
};

export default Comments;
