import { codeToHtml } from 'shiki';

const CustomCodeBlock = async ({
	children,
	className,
}: {
	children: any;
	className: string;
}) => {
	const element = await codeToHtml(children, {
		lang: className.replace('language-', ''),
		themes: {
			light: 'catppuccin-latte',
			dark: 'vitesse-dark',
		},
	});
	return <p dangerouslySetInnerHTML={{ __html: element }} />
};

export default CustomCodeBlock;
