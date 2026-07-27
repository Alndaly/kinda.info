import Link from 'next/link';
import { Asterisk } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

const navigation = [
  { href: '/notes', label: '笔记', index: '01' },
  { href: '/photography', label: '摄影', index: '02' },
  { href: '/projects', label: '作品', index: '03' },
  { href: '/about', label: '关于', index: '04' },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-container flex h-[74px] items-center justify-between gap-5">
        <Link href="/" className="group flex items-center gap-2" aria-label="Kinda 首页">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-paper transition-transform duration-500 group-hover:rotate-90">
            <Asterisk className="h-5 w-5" strokeWidth={1.7} />
          </span>
          <span className="font-display text-2xl font-semibold tracking-[-0.04em]">
            Kinda.
          </span>
        </Link>

        <nav
          aria-label="主导航"
          className="hidden items-center gap-1 rounded-full border border-line/80 bg-paper/75 p-1 backdrop-blur-xl md:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-pill group"
            >
              <span className="mr-1.5 text-[9px] opacity-45">{item.index}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="mailto:1142704468@qq.com"
            className="hidden text-xs font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-55 sm:block"
          >
            Say hello
          </Link>
          <ModeToggle />
        </div>
      </div>

      <nav
        aria-label="移动端导航"
        className="site-container flex gap-1 overflow-x-auto border-t border-line/70 py-2 md:hidden"
      >
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} className="nav-pill shrink-0">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
