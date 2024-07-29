import { getDatabaseData, getPageData } from '@/service/articles';
import ArticleCard from '@/components/article-card';

export const revalidate = 3600;

const Page = async () => {
	const articles = await getDatabaseData();
	const tasks = articles.results.map(async (article) => {
		const res = await getPageData(article.id);
		return res;
	});
	const res = await Promise.all(tasks);
	const articles_info = res;
	return (
		<div className='prose dark:prose-invert grid grid-cols-1 gap-4 w-full mx-auto p-5 sm:px-0'>
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

export default Page;
