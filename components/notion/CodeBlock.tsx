import { CodeBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { codeToHtml } from 'shiki';

const CodeBlock = async ({ block }: { block: CodeBlockObjectResponse }) => {
	const task = block.code.rich_text.map(async (richText, index) => {
		return await codeToHtml(richText.plain_text, {
			lang: block.code.language == 'plain text' ? 'text' : block.code.language,
			themes: {
				light: 'catppuccin-latte',
				dark: 'vitesse-dark',
			},
		});
	});
	const element = (
		<p dangerouslySetInnerHTML={{ __html: await Promise.all(task) }}></p>
	);
	return element;
};

export default CodeBlock;
