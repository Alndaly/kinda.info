import ArticleCard from '@/components/article-card';
import { getDatabaseData, getPageData } from '@/service/articles';

interface TagProps {
	params: {
		slug: string[];
	};
}
const TagPage = async ({ params }: TagProps) => {
	// Find the post for the current page.
	const { slug } = params;
	const tag = decodeURIComponent(slug[0]);
	const articles = await getDatabaseData(process.env.NOTION_PAGE_ID, tag);
	const tasks = articles.results.map(async (article) => {
		const res = await getPageData(article.id);
		return res;
	});
	const res = await Promise.all(tasks);
	const articles_info = res;
	return (
		<div className='prose dark:prose-invert grid grid-cols-1 gap-4 w-full mx-auto py-5'>
			<div className='font-bold text-2xl italic p-5'>Tag: {tag}</div>
			{articles_info.map((item) => {
				return (
					<div key={item.id}>
						<ArticleCard article={item} />
					</div>
				);
			})}
		</div>
	);
};
export default TagPage;
