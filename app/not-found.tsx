import Link from 'next/link';

export default function NotFound() {
	return (
		<div className='flex justify-center items-center flex-col p-5 gap-5 min-h-full'>
			<p className='text-2xl'>Ops...</p>
			<p className='text-xl'>
				This page is deleted
			</p>
			<Link
				href='/'
				className='rounded-full px-5 py-2 border border-zinc-300 dark:border-zinc-500'>
				Return Home
			</Link>
			<p className='text-sm'>
				Or if you do want to contact me, do this by
				<a href='mailto:1142704468@qq.com' className='font-bold underline ml-1'>email</a>
			</p>
		</div>
	);
}
