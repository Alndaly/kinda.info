import React from 'react';
import Link from 'next/link';
import moment from 'moment-timezone';

const ArticleCard = (props: any) => {
	const { article } = props;
	return (
		<Link
			// href={article.public_url}
			href={'/post/' + article.id}
			// target='_blank'
			className='no-underline flex flex-col gap-2 p-5 rounded hover:bg-slate-50/70 dark:hover:bg-slate-800/50'>
			<div>
				{article.properties.Name.title.map((title: any, index: number) => {
					return (
						<div key={index} className='font-bold text-lg'>
							{title.plain_text}
						</div>
					);
				})}
			</div>
			{article.properties.Tags.multi_select.length > 0 && (
				<div className='flex flex-row gap-2'>
					{article.properties.Tags.multi_select.map((tag: any) => {
						return (
							<div
								key={tag.id}
								className='text-sm border rounded-md border-gray-200 px-2'>
								{tag.name}
							</div>
						);
					})}
				</div>
			)}
			<div className='text-slate-400 text-sm space-x-2'>
				<span>
					Last update:{' '}
					{moment
						.tz(
							article.properties['Last edited time'].last_edited_time,
							'Asia/Shanghai'
						)
						.format('YYYY-MM-DD HH:mm:ss')}
				</span>
				<span>
					Created:{' '}
					{moment
						.tz(article.properties['Created'].created_time, 'Asia/Shanghai')
						.format('YYYY-MM-DD HH:mm:ss')}
				</span>
			</div>
		</Link>
	);
};

export default ArticleCard;
