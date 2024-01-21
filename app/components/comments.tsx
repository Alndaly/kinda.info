"use client"

import Giscus from '@giscus/react';

export default function Comments() {
	return (
		<Giscus
			id='comments'
			repo='Alndaly/comment-for-kinda.info'
			repoId='R_kgDOLHlvqA'
			category='Announcements'
			categoryId='DIC_kwDOLHlvqM4CcknJ'
			mapping='pathname'
			term='千年暗室，一灯即明!'
			reactionsEnabled='1'
			emitMetadata='0'
			inputPosition='bottom'
			theme='preferred_color_scheme'
			lang='zh-CN'
			loading='lazy'
		/>
	);
}
