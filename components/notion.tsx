import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import Link from 'next/link';
import { codeToHtml } from 'shiki';

const NotionBlock = async ({ block }: { block: BlockObjectResponse }) => {
	const type = block.type;
	let element = null;
	switch (type) {
		case 'paragraph':
			element = block.paragraph.rich_text.map((richText, index) => {
				if (richText.href && richText.annotations.code) {
					return (
						<Link className='break-words' href={richText.href} key={index} target='_blank'>
							<code>{richText.plain_text}</code>
						</Link>
					);
				} else if (richText.href && !richText.annotations.code) {
					return (
						<Link className='break-words' href={richText.href} key={index} target='_blank'>
							{richText.plain_text}
						</Link>
					);
				} else if (richText.annotations.code && !richText.href) {
					return <code key={index}>{richText.plain_text}</code>;
				}
				return <span className='break-words' key={index}>{richText.plain_text}</span>;
			});
			break;
		case 'image':
			element =
				block.image.type === 'external' ? (
					<picture>
						<img
							className='w-full'
							src={block.image.external.url}
							alt=''
						/>
					</picture>
				) : (
					<picture>
						<img
							className='w-full'
							src={block.image?.file?.url}
							alt=''
						/>
					</picture>
				);

			break;
		case 'divider':
			element = <hr />;
			break;
		case 'heading_1':
			element = (
				<h1>
					{block.heading_1.rich_text.map((richText, index) => {
						return <span key={index}>{richText.plain_text}</span>;
					})}
				</h1>
			);
			break;
		case 'heading_2':
			element = (
				<h2>
					{block.heading_2.rich_text.map((richText, index) => {
						return <span key={index}>{richText.plain_text}</span>;
					})}
				</h2>
			);
			break;
		case 'bulleted_list_item':
			element = (
				<ul>
					{block.bulleted_list_item.rich_text.map((richText, index) => {
						return <li key={index}>{richText.plain_text}</li>;
					})}
				</ul>
			);
			break;
		case 'quote':
			element = block.quote.rich_text.map((richText, index) => {
				return <blockquote key={index}>{richText.plain_text}</blockquote>;
			});
			break;
		case 'callout':
			element = (
				<p className='rounded p-5 border'>
					{block.callout.icon?.type == 'emoji' ? (
						<span className='mr-2'>{block.callout.icon.emoji}</span>
					) : null}
					{block.callout.rich_text.map((richText, index) => {
						return <span key={index}>{richText.plain_text}</span>;
					})}
				</p>
			);
			break;
		case 'code':
			const task = block.code.rich_text.map(async (richText, index) => {
				return await codeToHtml(richText.plain_text, {
					lang: block.code.language,
					themes: {
						light: 'vitesse-light',
						dark: 'vitesse-dark',
					},
				});
			});
			element = (
				<p dangerouslySetInnerHTML={{ __html: await Promise.all(task) }}></p>
			);
			break;
		default:
			element = <p>unsupported block</p>;
			break;
	}

	if (block.has_children) {
		return (
			<>
				{element}
				{/* <NotionBlock block={} /> */}
			</>
		);
	}
	return element;
};

export default NotionBlock;
