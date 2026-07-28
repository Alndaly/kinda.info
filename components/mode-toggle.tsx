'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Locale } from '@/lib/i18n';

export function ModeToggle({ locale }: { locale: Locale }) {
	const { setTheme } = useTheme();
	const labels = locale === 'zh'
		? { toggle: '切换主题', light: '浅色', dark: '深色', system: '跟随系统' }
		: { toggle: 'Change theme', light: 'Light', dark: 'Dark', system: 'System' };

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='outline'
					size='icon'
					className='relative rounded-full border-line bg-transparent shadow-none outline-none'
				>
					<Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
					<Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
					<span className='sr-only'>{labels.toggle}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuItem onClick={() => setTheme('light')}>
					{labels.light}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('dark')}>
					{labels.dark}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('system')}>
					{labels.system}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
