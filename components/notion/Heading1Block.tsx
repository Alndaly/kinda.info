import { Heading1BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const Heading1Block = ({ block }: { block: Heading1BlockObjectResponse }) => {
	const element = (
		<h1>
			{block.heading_1.rich_text.map((richText, index) => {
				return <span key={index}>{richText.plain_text}</span>;
			})}
		</h1>
	);
	return element;
};
export default Heading1Block;
