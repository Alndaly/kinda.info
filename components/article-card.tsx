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
			className='no-underline flex flex-col gap-2 p-5 rounded dark:hover:bg-white/5  hover:bg-black/5 transition-all duration-300'>
			<div>
				{article.properties.Name.title.map((title: any, index: number) => {
					return (
						<div key={index} className='font-bold text-xl'>
							{title.plain_text}
						</div>
					);
				})}
			</div>
			{article.properties.Tags.multi_select.length > 0 && (
				<div className='flex flex-row gap-2'>
					{article.properties.Tags.multi_select.map((tag: any) => {
						return (
							<Link key={tag.id} href={'/tag/' + tag.name} className='text-sm no-underline'>
								{'#' + tag.name}
							</Link>
						);
					})}
				</div>
			)}

			{article.properties.Summary?.rich_text && (
				<div>
					{article.properties.Summary.rich_text.map(
						(summary: any, index: number) => {
							return (
								<div key={index} className='text-sm line-clamp-3'>
									{summary.plain_text}
								</div>
							);
						}
					)}
				</div>
			)}

			<div className='text-slate-400 text-sm space-x-2'>
				<span>
					上次更新:{' '}
					{moment
						.tz(
							article.properties['Last edited time'].last_edited_time,
							'Asia/Shanghai'
						)
						.format('LLLL')}
				</span>
			</div>
		</Link>
	);
};

export default ArticleCard;
