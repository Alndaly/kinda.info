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
					<div className='fixed inset-0 bg-white/50 dark:bg-black/50' />
				</Transition.Child>

				<div className='fixed inset-0 overflow-y-auto'>
					<div className='flex min-h-full items-center justify-center p-4 text-center'>
						<Transition.Child
							as={Fragment}
							enter='ease-out duration-300'
							enterFrom='opacity-0 scale-95'
							enterTo='opacity-100 scale-100'
							leave='ease-in duration-200'
							leaveFrom='opacity-100 scale-100'
							leaveTo='opacity-0 scale-95'>
							<Dialog.Panel className='transition-all duration-600 transform w-full max-w-md transform rounded-2xl bg-white dark:bg-black p-6 text-left align-middle transition-all'>
								<input
									placeholder='输入关键词'
									className='p-5 w-full rounded-xl outline-none border-none focus:ring-0'
									onChange={(event) => setQuery(event.target.value)}
								/>
								{query && searchedPosts && searchedPosts.length > 0 && (
									<div className='pt-5 w-full'>
										{searchedPosts.map((post: Post) => {
											return (
												<div
													onClick={() => {
														router.push(post.urlslug);
														onClose();
													}}
													className='w-full hover:bg-white/20 p-2 rounded cursor-pointer'
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
