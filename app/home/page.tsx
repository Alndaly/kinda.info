/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
import { BiliBiliIcon } from '@/components/icon/bilibili-icon';
import { GithubIcon } from '@/components/icon/github-icon';
import { WxOfficialAccountIcon } from '@/components/icon/wx-official-account';
import { XiaoHongShuIcon } from '@/components/icon/xiaohongshu-icon';
import { YoutubeIcon } from '@/components/icon/youtube-icon';

export default function Home() {
	return (
		<div className='absolute top-0 left-0 h-full w-full bg-black/20 dark:bg-black/50 justify-center items-center flex flex-col'>
			<img
				className='rounded-full w-32 h-32 object-center'
				src='https://oss.kinda.info/image/202407162310900.jpg'
				alt='my avatar'
			/>
			<div className='font-bold text-lg mt-4 font-serif'>Hello, I'm Kinda</div>
			<div className='mt-4 flex flex-row gap-4 rounded-full backdrop-blur-md bg-black/20 dark:bg-black/50 p-2'>
				<div>
					<BiliBiliIcon />
				</div>
				<div>
					<XiaoHongShuIcon />
				</div>
				<div>
					<GithubIcon />
				</div>
				<div>
					<YoutubeIcon />
				</div>
				<div>
					<WxOfficialAccountIcon />
				</div>
			</div>
		</div>
	);
}
