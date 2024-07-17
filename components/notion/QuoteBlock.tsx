import { QuoteBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const QuoteBlock = ({ block }: { block: QuoteBlockObjectResponse }) => {
	const element = block.quote.rich_text.map((richText, index) => {
		return (
			<blockquote
				key={index}
				className={`${richText.annotations.bold ? 'font-bold' : ''} ${
					richText.annotations.italic ? 'italic' : ''
				}`}>
				{richText.plain_text}
			</blockquote>
		);
	});
	return element;
};
export default QuoteBlock;
