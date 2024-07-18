import { ImageBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const ImageBlock = async ({ block }: { block: ImageBlockObjectResponse }) => {
	const element =
		block.image.type === 'external' ? (
			<picture>
				<img className='w-full' src={block.image.external.url} alt='' />
			</picture>
		) : (
			<picture>
				<img className='w-full' src={block.image.file.url} alt='' />
			</picture>
		);
	return element;
};

export default ImageBlock;
