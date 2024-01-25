'use client';

import { Dialog, Transition } from '@headlessui/react';
import headerNavLinks from '@/data/headerNavLinks';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';

interface MobileNavBarProps {
	onClose: () => void;
}

const MobileNavBar = (props: MobileNavBarProps) => {
	const { onClose } = props;

	const router = useRouter();

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
							<Dialog.Panel className='border border-zinc-50 dark:border-zinc-800 drop-shadow-lg w-full max-w-xl bg-white dark:bg-[#1E1E1E] p-6 text-left flex flex-col h-full'>
								<div className='flex justify-end w-full' onClick={onClose}>
									<svg viewBox='0 0 1024 1024' width='30' height='30'>
										<path
											d='M312.13091 310.48787a46.545021 46.545021 0 0 1 65.814659 0l133.816935 133.933298 133.58421-133.351485a46.312296 46.312296 0 0 1 65.628479 0 45.381395 45.381395 0 0 1-0.9309 64.813942l-133.11876 133.77039 133.11876 133.118759a46.545021 46.545021 0 0 1 0 65.81466 45.497758 45.497758 0 0 1-64.930304-1.023991l-133.11876-132.653309-133.118759 133.910025a46.568293 46.568293 0 1 1-65.931022-65.81466L446.36675 509.677287l-134.23584-133.49112a46.545021 46.545021 0 0 1 0-65.698297zM511.995229 1023.999767a508.248355 508.248355 0 0 1-293.349994-93.299494 46.405386 46.405386 0 0 1-34.21059-44.68322l-0.418905-4.305414a46.405386 46.405386 0 0 1 80.592703-31.557525 420.534263 420.534263 0 1 0-132.653309-160.161416l-7.540293 7.540293a46.545021 46.545021 0 0 1 29.02082 43.077417l0.442178 4.328687a46.428658 46.428658 0 0 1-91.088606 12.776608A511.995229 511.995229 0 1 1 511.995229 1023.999767z'
											fill='currentColor'></path>
									</svg>
								</div>
								<div className='flex flex-col'>
									{headerNavLinks.map((link) => {
										return (
											<div
												key={link.title}
												onClick={() => {
													router.push(link.href);
													onClose();
												}}
												className='py-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-300 transform duration-400'>
												{link.title}
											</div>
										);
									})}
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
};

export default MobileNavBar;
