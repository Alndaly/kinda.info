import { BulletedListItemBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const BulletedListItemBlock = ({
	block,
}: {
	block: BulletedListItemBlockObjectResponse;
}) => {
	const element = (
		<>
			{block.bulleted_list_item.rich_text.map((richText, index) => {
				return (
					<li key={index}>
						{richText.plain_text}
					</li>
				);
			})}
		</>
	);
	return element;
};
export default BulletedListItemBlock;
