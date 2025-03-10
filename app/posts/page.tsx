import { getDatabaseData, getPageData } from '@/service/articles';
import ArticleCard from '@/components/article-card';

export const revalidate = 3600;

type NotionPage = {
	id: string;
	created_time: string;
	last_edited_time: string;
	url: string;
	public_url: string;
};

function groupByMonth(pages: NotionPage[]): Record<string, NotionPage[]> {
	return pages.reduce((acc, page) => {
		const date = new Date(page.last_edited_time);
		const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
			.toString()
			.padStart(2, '0')}`; // 生成 "YYYY-MM" 格式的键

		if (!acc[monthKey]) {
			acc[monthKey] = [];
		}
		acc[monthKey].push(page);

		return acc;
	}, {} as Record<string, NotionPage[]>);
}

const Page = async () => {
	const articles = await getDatabaseData();
	const tasks = articles.results.map(async (article) => {
		const res = await getPageData(article.id);
		return res;
	});
	const articles_info = await Promise.all(tasks);
	// @ts-ignore
	const monthGroup = groupByMonth(articles_info);
	return (
		<div className='grid grid-cols-1 container items-center px-8 py-8 mx-auto sm:flex-row gap-5'>
			{Object.entries(monthGroup).map(([month, articles], index) => {
				return (
					<div key={index}>
						<h1 className='font-bold text-2xl mb-5'>{month}</h1>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
							{articles.map((article, index) => {
								return <ArticleCard key={index} article={article} />;
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default Page;
