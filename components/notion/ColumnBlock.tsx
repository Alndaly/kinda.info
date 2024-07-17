import { getBlocks } from '@/service/articles';
import {
	BlockObjectResponse,
	ColumnBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import NotionBlock from '.';

const ColumnBlock = async ({ block }: { block: ColumnBlockObjectResponse }) => {
	const columns = await getBlocks(block.id);
	const element = columns.results.map((block) => {
		return <NotionBlock key={block.id} block={block as BlockObjectResponse} />;
	});
	return element;
};

export default ColumnBlock;
