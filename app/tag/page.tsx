import { allPosts, type Post } from 'contentlayer/generated';
import cls from 'classnames';
import Link from 'next/link';

const tagsCount: any = {};

allPosts.forEach((item) => {
	item.tags.forEach((tag) => {
		tagsCount[tag] = (tagsCount[tag] || 0) + 1;
	});
});

const sortedTags = Object.keys(tagsCount).sort(
	(a, b) => tagsCount[b] - tagsCount[a]
);

const TagPage = () => {
	return (
		<div className={cls(
            'prose',
            'lg:prose-lg',
            'xl:prose-xl',
            'dark:prose-invert',
            'prose-table:break-all',
            'prose-a:no-underline',
            'prose-a:border-b',
            'prose-a:font-bold',
            'mx-auto',
            'py-8',
            'px-8',
            'md:px-0'
        )}>
			{sortedTags.map((tag) => (
				<Link
					key={tag}
					className={`inline-flex lg:block px-3 py-2 font-normal hover:bg-zinc-50 hover:text-cyan-500 dark:hover:bg-slate-800 transition trasnform duration-400 select-none`}
					href={`/tag/${tag}`}>
					{tag}({tagsCount[tag]})
				</Link>
			))}
		</div>
	);
};
export default TagPage;
