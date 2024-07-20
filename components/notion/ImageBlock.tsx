import { ImageBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const ImageBlock = async ({ block }: { block: ImageBlockObjectResponse }) => {
	const element =
		block.image.type === 'external' ? (
			<picture>
				<img className='w-full' src={block.image.external.url} alt='' />
				{block.image.caption.map((caption, index) => (
					<figcaption key={index}>{caption.plain_text}</figcaption>
				))}
			</picture>
		) : (
			<picture>
				<img className='w-full' src={block.image.file.url} alt='' />
				{block.image.caption.map((caption, index) => (
					<figcaption key={index}>{caption.plain_text}</figcaption>
				))}
			</picture>
		);
	return element;
};

export default ImageBlock;
