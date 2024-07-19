import { getArticles, getArticle } from '@/service/articles';
import ArticleCard from '@/components/article-card';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

export const revalidate = 3600;

const Page = async () => {
	const articles: QueryDatabaseResponse = await getArticles();
	const tasks = articles.results.map(async (article) => {
		const res = await getArticle(article.id);
		return res;
	});
	const res = await Promise.all(tasks);
	const articles_info = res;
	return (
		<div className='mt-[64px] prose dark:prose-invert lg:prose-lg xl:prose-xl grid grid-cols-1 gap-4 w-full mx-auto p-5'>
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
