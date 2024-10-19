'use client';

import * as React from 'react';

import { TableOfContents } from '@/utils/md';
import { cn } from '@/lib/utils';

interface TocProps {
	toc: TableOfContents;
}

export function DashboardTableOfContents({ toc }: TocProps) {
	const itemIds = React.useMemo(
		() =>
			toc.items
				? toc.items
						.flatMap((heading1) => [
							heading1.id,
							heading1.items?.map((heading2) => [
								heading2.id,
								heading2.items?.map((heading3) => [heading3.id]),
							]),
						])
						.flat(4)
						.filter(Boolean)
				: [],
		[toc]
	);
	const activeHeading = useActiveItem(itemIds);

	if (!toc?.items) {
		return null;
	}

	return (
		<div className='space-y-2'>
			<p className='font-medium'>当前页面目录</p>
			{toc.items.length > 0 && (
				<ul className={cn('m-0 list-none')}>
					<IndentTree tree={toc} activeItem={activeHeading} />
				</ul>
			)}
			{toc.items.length === 0 && <div className='opacity-50'>暂无目录</div>}
		</div>
	);
}

function useActiveItem(itemIds: (string | undefined)[]) {
	const [activeId, setActiveId] = React.useState<string>('');

	React.useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.some((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
						return true;
					}
				});
			},
			{ rootMargin: `-64px 0px 0px 0px` }
		);

		itemIds?.forEach((id) => {
			if (!id) {
				return;
			}
			const element = document.getElementById(id);
			if (element) {
				observer.observe(element);
			}
		});

		return () => {
			itemIds?.forEach((id) => {
				if (!id) {
					return;
				}

				const element = document.getElementById(id);
				if (element) {
					observer.unobserve(element);
				}
			});
		};
	}, [itemIds]);

	return activeId;
}

interface TreeProps {
	tree: TableOfContents;
	level?: number;
	activeItem?: string | null;
}

function IndentTree({ tree, level = 1, activeItem }: TreeProps) {
	let style = 'pl-0';
	if (level == 2) {
		style = 'pl-4';
	} else if (level == 3) {
		style = 'pl-8';
	}
	return tree?.items?.length && level <= 3 ? (
		<>
			{tree.items.map((item, index) => {
				return (
					<>
						<li key={index} className={cn('mt-0 pt-2', style)}>
							<a
								href={`#${item.id}`}
								className={cn(
									'inline-block',
									item.id === `${activeItem}`
										? 'font-medium text-primary'
										: 'text-sm text-muted-foreground'
								)}>
								{item.title}
							</a>
						</li>
						{item.items?.length ? (
							<IndentTree
								tree={item}
								level={level + 1}
								activeItem={activeItem}
							/>
						) : null}
					</>
				);
			})}
		</>
	) : null;
}
