import Fuse from 'fuse.js';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { allPosts, type Post } from 'contentlayer/generated';
import { Fragment, useEffect, useState } from 'react';

interface SearchBarProps {
	onClose: () => void;
}

const fuseOptions = {
	keys: ['title', 'body.raw'],
};

const fuse = new Fuse(allPosts, fuseOptions);

const SearchBar = (props: SearchBarProps) => {
	const { onClose } = props;

	const router = useRouter();

	const [query, setQuery] = useState('');
	const [searchedPosts, setSearchedPosts] = useState<any[]>([]);

	useEffect(() => {
		const filteredPost =
			query === '' ? allPosts : fuse.search(query).map(({ item }) => item);
		console.log(111, filteredPost);
		setSearchedPosts(filteredPost);
	}, [query]);

	return (
		<Transition appear as={Fragment} show={true}>
			<Dialog as='div' className='relative z-10' onClose={onClose}>
				<Transition.Child
					as={Fragment}
					enter='ease-out duration-300'
					enterFrom='opacity-0'
					enterTo='opacity-100'
					leave='ease-in duration-200'
					leaveFrom='opacity-100'
					leaveTo='opacity-0'>
					<div className='fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm' />
				</Transition.Child>

				<div className='fixed inset-0 overflow-y-auto'>
					<div className='flex h-full items-center justify-center relative'>
						<Transition.Child
							as={Fragment}
							enter='ease-out duration-300'
							enterFrom='opacity-0 scale-95'
							enterTo='opacity-100 scale-100'
							leave='ease-in duration-200'
							leaveFrom='opacity-100 scale-100'
							leaveTo='opacity-0 scale-95'>
							<Dialog.Panel className='border border-zinc-50 dark:border-zinc-800 drop-shadow-lg w-full max-w-xl rounded-2xl bg-white dark:bg-[#1E1E1E] p-6 text-left flex flex-col h-full max-h-[50%]'>
								<input
									placeholder='输入关键词'
									className='bg-transparent p-5 w-full outline-none border-b border-zinc-50 dark:border-zinc-800 '
									onChange={(event) => setQuery(event.target.value)}
								/>
								{query && searchedPosts && searchedPosts.length > 0 && (
									<div className='pt-5 w-full flex-1 overflow-auto flex flex-col gap-2'>
										{searchedPosts.map((post: Post) => {
											return (
												<div
													onClick={() => {
														router.push(post.urlslug);
														onClose();
													}}
													className='w-full dark:bg-white/5 dark:hover:bg-white/10 bg-black/5 hover:bg-black/10 p-3 rounded cursor-pointer'
													key={post._id}>
													{post.title}
												</div>
											);
										})}
									</div>
								)}
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
};

export default SearchBar;
