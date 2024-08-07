'use client';
import { Popover, PopoverPanel, PopoverButton } from '@headlessui/react';
import { configResponsive, useResponsive } from 'ahooks';

configResponsive({
	small: 640,
	middle: 768,
	large: 1024,
});

export function WxOfficialAccountIcon() {
	const responsive = useResponsive();

	return (
		<Popover className='relative'>
			<PopoverButton className='outline-none'>
				<div className='border rounded-full w-8 h-8 flex items-center justify-center border-black dark:border-white'>
					<svg
						className='w-4 h-4 text-black dark:text-white'
						viewBox='0 0 1024 1024'
						version='1.1'
						xmlns='http://www.w3.org/2000/svg'>
						<path
							d='M502.2208 278.9376c-23.4496 0.4608-43.264 20.3776-42.8544 43.1104 0.4096 23.552 19.8656 41.984 43.9808 41.728a41.984 41.984 0 0 0 42.2912-43.008 42.24 42.24 0 0 0-43.4176-41.8304z m-228.2496 43.776c0.8704-22.6816-18.7904-43.0592-42.1888-43.7248a42.496 42.496 0 0 0-44.288 41.0112 41.984 41.984 0 0 0 41.6768 43.52 43.2128 43.2128 0 0 0 44.8-40.8064z m437.4528 38.5536c-95.0272 4.9664-177.664 33.6896-244.7872 98.6112-67.84 65.6384-98.816 146.0224-90.3168 245.6576-37.1712-4.608-70.9632-9.6256-105.0112-12.4928-11.776-1.024-25.7024 0.4096-35.6864 6.0416-33.024 18.5856-64.7168 39.5776-102.2464 62.976 6.8608-31.0784 11.3152-58.3168 19.2512-84.48 5.7856-19.2512 3.072-29.952-14.6944-42.496C23.8592 554.752-24.2688 434.4832 11.776 310.6816c33.28-114.4832 115.0976-183.9616 226.2016-220.16 151.7056-49.408 322.1504 1.024 414.3616 121.088a282.624 282.624 0 0 1 59.136 149.6576z m91.8016 189.6448a35.3792 35.3792 0 0 0-35.1232 33.792 34.816 34.816 0 0 0 34.6624 36.5056 34.5088 34.5088 0 0 0 35.1232-33.4848 35.1232 35.1232 0 0 0-34.6624-36.864z m-220.8768 70.5536a35.4304 35.4304 0 0 0 35.6864-33.792 35.584 35.584 0 1 0-71.2192-0.256 35.6864 35.6864 0 0 0 35.5328 34.048z m342.6304 330.8544c-30.0544-13.3632-57.7024-33.4336-87.0912-36.4544-29.2864-3.072-60.0576 13.824-90.6752 16.896-93.3376 9.5232-176.9472-16.384-245.8624-79.9744-131.1232-120.9856-112.384-306.432 39.2704-405.504 134.8096-88.1152 332.544-58.7776 427.6224 63.488 82.944 106.6496 73.216 248.2176-28.0576 337.8176-29.3376 25.9584-39.8848 47.2576-21.0432 81.4592 3.4304 6.2976 3.84 14.336 5.8368 22.272z'
							fill='currentColor'></path>
					</svg>
				</div>
			</PopoverButton>
			<PopoverPanel
				transition
				anchor={{
					to: responsive && responsive['small'] ? 'right' : 'bottom',
					gap: 10,
				}}
				className='rounded-xl bg-white/20 dark:bg-black/20 transition ease-in-out [--anchor-gap:var(--spacing-5)] sm:data-[closed]:-translate-x-1 data-[closed]:translate-x-0 data-[closed]:-translate-y-1 sm:data-[closed]:-translate-y-0 data-[closed]:opacity-0'>
				<p className='p-3'>
					<picture>
						<img
							src='https://oss.kinda.info/image/202407181443786.jpg'
							alt='陌上见花开'
							className='w-24'
						/>
					</picture>
				</p>
			</PopoverPanel>
		</Popover>
	);
}
