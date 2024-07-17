import { getBlocks } from '@/service/articles';
import {
	BlockObjectResponse,
	ColumnListBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import NotionBlock from '.';

const ColumnListBlock = async ({
	block,
}: {
	block: ColumnListBlockObjectResponse;
}) => {
	// 获取子列数
	let element = null;
	if (block.has_children) {
		const res = await getBlocks(block.id);
		element = (
			<p className={`grid grid-cols-1 sm:grid-cols-2 gap-2`}>
				{res.results.map((block) => {
					return (
						<NotionBlock key={block.id} block={block as BlockObjectResponse} />
					);
				})}
			</p>
		);
	} else {
		element = null;
	}
	return element;
};

export default ColumnListBlock;
