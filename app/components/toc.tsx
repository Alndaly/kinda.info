'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

function useActiveId() {
	const observer = useRef<IntersectionObserver>();
	const [activeId, setActiveId] = useState('');

	useEffect(() => {
		const handleObserver = (entries: IntersectionObserverEntry[]) => {
			entries.forEach((entry) => {
				if (entry?.isIntersecting) {
					setActiveId(entry.target.id);
				}
			});
		};

		observer.current = new IntersectionObserver(handleObserver, {
			rootMargin: '0px 0px 0px 0px',
			threshold: 1,
		});

		const elements = document.querySelectorAll('h2, h3, h4');
		elements.forEach(
			(elem) => observer.current && observer.current.observe(elem)
		);
		return () => observer.current?.disconnect();
	}, []);

	return activeId;
}

export default function TableOfContent({ headings }: any) {
	const activeId = useActiveId();
	return (
		<div className='z-10 flex flex-col'>
			{headings.map((heading: any) => {
				return (
					<Link
						key={heading.id}
						data-level={heading.level}
						href={`#${heading.text}`}
						className={`"data-[level=two]:ml-1 data-[level=three]:ml-2 leading-9 rounded-lg px-3 py-1 font-normal text-zinc-500 dark:text-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:text-zinc-50 dark:hover:bg-zinc-800 transition duration-400"  ${
							activeId === heading.id &&
							'bg-zinc-50 text-zinc-900 dark:text-zinc-100 dark:bg-zinc-800'
						}`}
						onClick={(e) => {
							e.preventDefault();
							document &&
								document.getElementById(heading.id) &&
								document
									.getElementById(heading.id)!
									.scrollIntoView({ behavior: 'smooth', block: 'start' });
						}}>
						{heading.text}
					</Link>
				);
			})}
		</div>
	);
}
