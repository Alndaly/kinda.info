import { ParagraphBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import Link from 'next/link';

const ParagraphBlock = ({ block }: { block: ParagraphBlockObjectResponse }) => {
	const element = block.paragraph.rich_text.map((richText, index) => {
		if (richText.href && richText.annotations.code) {
			return (
				<Link
					className={`break-words 
					${richText.annotations.bold ? 'font-bold' : ''} 
					${richText.annotations.italic ? 'italic' : ''} 
					${richText.annotations.underline ? 'underline' : ''} 
					${richText.annotations.strikethrough ? 'line-through' : ''}
					`}
					href={richText.href}
					key={index}
					target='_blank'>
					<code>{richText.plain_text}</code>
				</Link>
			);
		} else if (richText.href && !richText.annotations.code) {
			return (
				<Link
					className={`break-words 
					${richText.annotations.bold ? 'font-bold' : ''} 
					${richText.annotations.italic ? 'italic' : ''} 
					${richText.annotations.underline ? 'underline' : ''} 
					${richText.annotations.strikethrough ? 'line-through' : ''}
					`}
					href={richText.href}
					key={index}
					target='_blank'>
					{richText.plain_text}
				</Link>
			);
		} else if (richText.annotations.code && !richText.href) {
			return <code key={index}>{richText.plain_text}</code>;
		}
		return (
			<span
				className={`break-words 
					${richText.annotations.bold ? 'font-bold' : ''} 
					${richText.annotations.italic ? 'italic' : ''} 
					${richText.annotations.underline ? 'underline' : ''} 
					${richText.annotations.strikethrough ? 'line-through' : ''}
					`}
				key={index}>
				{richText.plain_text}
			</span>
		);
	});
	return <p>{element}</p>;
};

export default ParagraphBlock;
