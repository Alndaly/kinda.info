'use client';

import Giscus from '@giscus/react';
import React from 'react';
import { useTheme } from 'next-themes';
import { siteMetaData } from '../../data/sitemetadata';

const Comments = () => {
	const { theme, resolvedTheme } = useTheme();
	const commentsTheme =
		theme === 'dark' || resolvedTheme === 'dark' ? 'transparent_dark' : 'light';
	return (
		<div id='comments'>
			<Giscus
				repo={`${siteMetaData.github}/${siteMetaData.siteRepo}`}
				repoId={siteMetaData.repoId}
				category='Announcements'
				categoryId={siteMetaData.categoryId}
				mapping='pathname'
				reactionsEnabled='1'
				inputPosition='top'
				theme={commentsTheme}
				lang='en'
				loading='lazy'
			/>
		</div>
	);
};

export default Comments;
