'use client';

import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface TocProps {
	headings: any;
	showActive?: boolean;
}

// function useActiveId() {
// 	const observer = useRef<IntersectionObserver>();
// 	const [activeId, setActiveId] = useState('');

// 	useEffect(() => {
// 		const handleObserver = (entries: IntersectionObserverEntry[]) => {
// 			entries.forEach((entry) => {
// 				if (entry?.isIntersecting) {
// 					setActiveId(entry.target.id);
// 				}
// 			});
// 		};

// 		observer.current = new IntersectionObserver(handleObserver, {
// 			rootMargin: '0px 0px 0px 0px',
// 			threshold: 1,
// 		});

// 		const elements = document.querySelectorAll('h2, h3, h4');
// 		elements.forEach(
// 			(elem) => observer.current && observer.current.observe(elem)
// 		);
// 		return () => observer.current?.disconnect();
// 	}, []);

// 	return activeId;
// }

export default function TableOfContent(props: TocProps) {
	const { headings } = props;
	// const activeId = useActiveId();
	return (
		<div className='border-solid flex flex-col gap-5 border border-zinc dark:border-zinc-600 rounded p-2 !text-sm'>
			<Disclosure>
				{({ open }) => (
					<>
						<Disclosure.Button>
							<div className='flex flex-row items-center justify-center'>
								<span>目录</span>
								<ChevronDownIcon
									className={`${
										open ? 'rotate-180 transform' : ''
									} h-5 w-5 transition-all`}
								/>
							</div>
						</Disclosure.Button>
						<Disclosure.Panel>
							<div className='flex flex-col gap-2'>
								{headings.map((heading: any) => {
									return (
										<Link
											key={heading.id}
											data-level={heading.level}
											href={`#${heading.text}`}
											className={
												'hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded data-[level=two]:ml-2 data-[level=three]:ml-4 data-[level=four]:ml-6 data-[level=five]:ml-8 border-none !font-light'
											}
											onClick={(e) => {
												e.preventDefault();
												document &&
													document.getElementById(heading.id) &&
													document.getElementById(heading.id)!.scrollIntoView({
														behavior: 'smooth',
														block: 'start',
													});
											}}>
											{heading.text}
										</Link>
									);
								})}
							</div>
						</Disclosure.Panel>
					</>
				)}
			</Disclosure>
		</div>
	);
}
