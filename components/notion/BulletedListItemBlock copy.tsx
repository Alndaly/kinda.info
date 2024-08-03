import { NumberedListItemBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const NumberedListItemBlock = ({
	block,
}: {
	block: NumberedListItemBlockObjectResponse;
}) => {
	const element = (
		<>
			{block.numbered_list_item.rich_text.map((richText, index) => {
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
export default NumberedListItemBlock;
