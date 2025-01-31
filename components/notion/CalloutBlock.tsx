import { getBlocks } from '@/service/articles';
import {
	BlockObjectResponse,
	CalloutBlockObjectResponse,
	ListBlockChildrenResponse,
} from '@notionhq/client/build/src/api-endpoints';
import NotionBlock from '.';
import { cn } from '@/lib/utils';

const CalloutBlock = async ({
	block,
}: {
	block: CalloutBlockObjectResponse;
}) => {
	let calloutChildren: ListBlockChildrenResponse | null = null;
	if (block.has_children) {
		calloutChildren = await getBlocks(block.id);
	}
	const element = (
		<p
			className={cn(
				'rounded p-5 border',
				'bg-' + block.callout.color.replace('_background', '-200')
			)}>
			{block.callout.icon?.type == 'emoji' ? (
				<span className='mr-2'>{block.callout.icon.emoji}</span>
			) : null}
			{block.callout.rich_text.map((richText, index) => {
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
			})}
			{calloutChildren &&
				calloutChildren.results.map((block) => {
					return (
						<NotionBlock key={block.id} block={block as BlockObjectResponse} />
					);
				})}
		</p>
	);
	return element;
};

export default CalloutBlock;
