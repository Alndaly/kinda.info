import Image from 'next/image';
import type { MDXComponents } from 'mdx/types';
import BiliBili from './bilibili';
import Youtube from './youtube';
import MyInfo from './my-info';
import { useMDXComponent } from 'next-contentlayer/hooks';

// Define your custom MDX components.
const mdxComponents: MDXComponents = {
	Image,
	BiliBili,
	Youtube,
	MyInfo
};

interface MdxProps {
	code: string;
}

export function Mdx({ code }: MdxProps) {
	const Component = useMDXComponent(code);
	return <Component components={mdxComponents} />;
}
