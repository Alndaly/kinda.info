import React from 'react';
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';

const ArticleCard = (props: any) => {
	const { article } = props;
	return (
		<div className='flex flex-col gap-2 rounded transition-all duration-300 bg-muted p-5'>
			<Link href={'/post/' + article.id}>
				{article.properties.Name.title.map((title: any, index: number) => {
					return (
						<div key={index} className='font-bold text-xl line-clamp-2'>
							{title.plain_text}
						</div>
					);
				})}
			</Link>
			{article.properties.Summary?.rich_text && (
				<div className='flex-1'>
					{article.properties.Summary.rich_text.map(
						(summary: any, index: number) => {
							return (
								<div key={index} className='line-clamp-3'>
									{summary.plain_text}
								</div>
							);
						}
					)}
				</div>
			)}
			<div className='flex flex-row justify-between'>
				<div className='text-muted-foreground text-xs'>
					<span>
						上次更新
						{formatDistance(
							new Date(article.properties['Last edited time'].last_edited_time),
							new Date(),
							{
								addSuffix: true,
								locale: zhCN,
							}
						)}
					</span>
				</div>
				{article.properties.Tags.multi_select.length > 0 && (
					<div className='flex flex-row gap-2'>
						{article.properties.Tags.multi_select.map((tag: any) => {
							return (
								<Link
									key={tag.id}
									href={'/tag/' + tag.name}
									className='no-underline text-xs text-muted-foreground'>
									{'#' + tag.name}
								</Link>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default ArticleCard;
