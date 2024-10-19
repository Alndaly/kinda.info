import { Heading2BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const Heading2Block = ({ block }: { block: Heading2BlockObjectResponse }) => {
	const element = (
		<h2 id={block.id} className='scroll-mt-[64px]'>
			{block.heading_2.rich_text.map((richText, index) => {
				return <span key={index}>{richText.plain_text}</span>;
			})}
		</h2>
	);
	return element;
};
export default Heading2Block;
