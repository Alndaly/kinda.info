'use client';

import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { useEffect, useState } from 'react';

const getTableOfContents = (blocks: BlockObjectResponse[]) => {
	const headers = blocks
		.filter(
			(block) =>
				block.type === 'heading_1' ||
				block.type === 'heading_2' ||
				block.type === 'heading_3'
		)
		.map((block) => {
			return {
				id: block.id,
				// @ts-ignore
				text: block[block.type].rich_text[0].plain_text,
				level: block.type,
			};
		});
	return headers;
};

interface TocItem {
	id: string;
	text: string;
	level: string;
}

const TableOfContents = ({ blocks }: { blocks: BlockObjectResponse[] }) => {
	const [toc, setToc] = useState<TocItem[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null); // State to track active section

	useEffect(() => {
		const headers = getTableOfContents(blocks);
		setToc(headers);
	}, [blocks]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id); // Set active section when it intersects
					}
				});
			},
			{
				rootMargin: '0px 0px -80% 0px', // Trigger when 80% of the section is visible
			}
		);

		// Observe each heading element
		toc.forEach((item) => {
			const element = document.getElementById(item.id);
			if (element) {
				observer.observe(element);
			}
		});

		// Cleanup observer on component unmount
		return () => {
			toc.forEach((item) => {
				const element = document.getElementById(item.id);
				if (element) {
					observer.unobserve(element);
				}
			});
		};
	}, [toc]);

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	};
	return (
		<div className='fixed top-[80px] right-0 p-5'>
			<ul className='space-y-2 overflow-auto'>
				{toc.map((item, index) => (
					<li
						key={index}
						style={{
							marginLeft: `${
								item.level === 'heading_1'
									? 0
									: item.level === 'heading_2'
									? 20
									: 40
							}px`,
						}}>
						<button
							className={`text-sm text-muted-foreground hover:underline underline-offset-4 ${
								activeId === item.id ? 'text-blue-500 font-bold text-primary' : ''
							}`}
							onClick={() => scrollToSection(item.id)}>
							{item.text}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default TableOfContents;
