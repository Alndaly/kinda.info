interface CustomImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
	alt?: string;
}

const CustomImageBlock: React.FC<CustomImageProps> = ({ src, alt, ...props }) => {
	// @ts-ignore
	return <img className='rounded' src={src} alt={alt} {...props} />;
};

export default CustomImageBlock;