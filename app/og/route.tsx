import { ImageResponse } from 'next/og';

import { siteConfig } from '@/site.config';

export const runtime = 'edge';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);

	const title = searchParams.has('title')
		? searchParams.get('title')?.slice(0, 100)!
		: siteConfig.publisher;

	return new ImageResponse(
		(
			<div tw='flex w-full h-full flex-col bg-[#09090b] text-white p-[80px]'>
				<div tw='flex flex-col w-full pt-[40px] px-8'>
					<div tw={`flex w-full h-full ml-4`}>
						<div
							style={{
								display: 'flex',
								fontSize: 70,
								fontStyle: 'normal',
								color: 'white',
								marginTop: 30,
								lineHeight: 1.8,
								whiteSpace: 'pre-wrap',
							}}>
							{title}
						</div>
					</div>
				</div>
				<div tw='flex items-center justify-between w-full mt-auto px-8'>
					<div tw='flex items-center'>
						<svg
							viewBox='0 0 24 24'
							xmlns='http://www.w3.org/2000/svg'
							fill='#9b9ba4'
							width={50}
							height={50}>
							<path d='M24 22.525H0l12-21.05 12 21.05z' />
						</svg>
						<div tw='flex ml-4 text-[#9b9ba4]'>
							<div tw='flex text-[#eaeaf0] ml-4 mr-4 text-4xl'>
								{siteConfig.siteRepo}
							</div>
						</div>
					</div>
				</div>
			</div>
		),
		{
			width: 1200,
			height: 630,
		}
	);
}
