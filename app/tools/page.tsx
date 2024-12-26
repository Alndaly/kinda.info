import Image from 'next/image';
import Link from 'next/link';

const tools = [
	{
		name: '超级好用的纯音乐/白噪音网站',
		description: '超级好用的纯音乐/白噪音网站',
		url: 'https://moodist.mvze.net',
		cover: 'https://oss.kinda.info/image/202412262256146.png',
	},
];

const ToolsPage = () => {
	return (
		<div className='flex flex-col gap-2 p-5'>
			<h1 className='font-bold text-2xl text-center'>工具集合</h1>
			<p className='text-center'>不一定是我开发的，只是方便我浏览。</p>
			<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
				{tools.map((tool, index) => {
					return (
						<Link
							key={index}
							target='_blank'
							href={tool.url}
							className='flex flex-col gap-2 relative rounded ring-1 ring-inset dark:ring-white/10 ring-black/10 bg-black/5 dark:bg-white/5 p-5'>
							<div className='relative w-full aspect-video mb-2'>
								<Image src={tool.cover} alt={tool.name} fill />
							</div>
							<h2 className='font-bold'>{tool.name}</h2>
						</Link>
					);
				})}
			</div>
		</div>
	);
};

export default ToolsPage;
