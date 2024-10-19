import { Heading3BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const Heading3Block = ({ block }: { block: Heading3BlockObjectResponse }) => {
	const element = (
		<h3 id={block.id} className='scroll-mt-[64px]'>
			{block.heading_3.rich_text.map((richText, index) => {
				return <span key={index}>{richText.plain_text}</span>;
			})}
		</h3>
	);
	return element;
};
export default Heading3Block;
