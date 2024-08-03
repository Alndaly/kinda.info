import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import ImageBlock from './ImageBlock';
import ParagraphBlock from './ParagraphBlock';
import BulletedListItemBlock from './BulletedListItemBlock';
import CodeBlock from './CodeBlock';
import CalloutBlock from './CalloutBlock';
import QuoteBlock from './QuoteBlock';
import ColumnListBlock from './ColumnListBlock';
import ColumnBlock from './ColumnBlock';
import Heading1Block from './Heading1Block';
import Heading2Block from './Heading2Block';
import Heading3Block from './Heading3Block';
import NumberedListItemBlock from './BulletedListItemBlock copy';

const NotionBlock = async ({ block }: { block: BlockObjectResponse }) => {
	const type = block.type;
	let element = null;
	switch (type) {
		case 'paragraph':
			element = <ParagraphBlock block={block} />;
			break;
		case 'image':
			element = <ImageBlock block={block} />;
			break;
		case 'column':
			element = <ColumnBlock block={block} />;
			break;
		case 'column_list':
			element = <ColumnListBlock block={block} />;
			break;
		case 'heading_1':
			element = <Heading1Block block={block} />;
			break;
		case 'heading_2':
			element = <Heading2Block block={block} />;
			break;
		case 'heading_3':
			element = <Heading3Block block={block} />;
			break;
		case 'bulleted_list_item':
			element = <BulletedListItemBlock block={block} />;
			break;
		case 'numbered_list_item':
			element = <NumberedListItemBlock block={block} />;
			break;
		case 'quote':
			element = <QuoteBlock block={block} />;
			break;
		case 'callout':
			element = <CalloutBlock block={block} />;
			break;
		case 'code':
			element = <CodeBlock block={block} />;
			break;
		case 'divider':
			element = <hr />;
			break;
		default:
			element = <p>unsupported block</p>;
			break;
	}
	return element;
};

export default NotionBlock;
