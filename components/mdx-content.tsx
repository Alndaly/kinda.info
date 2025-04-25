import * as runtime from 'react/jsx-runtime';
import CustomImageBlock from './custom-image-block';
import CustomCodeBlock from './custom-code-block';

const sharedComponents = {
	// Add your global components here
	img: CustomImageBlock,
	code: CustomCodeBlock,
	pre: ({ children }: { children: React.ReactNode }) => <>{children}</>, // remove the pre tag
};

// parse the Velite generated MDX code into a React component function
const useMDXComponent = (code: string) => {
	const fn = new Function(code);
	return fn({ ...runtime }).default;
};

interface MDXProps {
	code: string;
	components?: Record<string, React.ComponentType>;
}

// MDXContent component
export const MDXContent = ({ code, components }: MDXProps) => {
	const Component = useMDXComponent(code);
	return <Component components={{ ...sharedComponents, ...components }} />;
};
