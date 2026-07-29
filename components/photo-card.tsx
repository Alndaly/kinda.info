import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Entry } from '@/.velite';
import { cn } from '@/lib/utils';

export function PhotoCard({
  entry,
  priority = false,
  className = '',
  frameClassName = '',
  frameIndex,
  viewLabel,
  tone = 'default',
}: {
  entry: Entry;
  priority?: boolean;
  className?: string;
  /** Frames are sized by whichever grid they sit in. */
  frameClassName?: string;
  frameIndex?: number;
  viewLabel?: string;
  tone?: 'default' | 'inverse';
}) {
  const inverse = tone === 'inverse';

  return (
    <Link
      href={entry.href}
      className={cn(
        'group block',
        inverse ? 'text-inverse-foreground' : 'text-inherit',
        className,
      )}
    >
      <figure className="m-0">
        <div className={cn('relative min-h-60 overflow-hidden bg-[#24241f]', frameClassName)}>
          {entry.cover ? (
            <Image
              src={entry.cover}
              alt={entry.title}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
          <span className="absolute bottom-[0.8rem] left-[0.8rem] z-[2] bg-black/[0.54] px-[0.48rem] py-[0.38rem] text-[0.5rem] font-bold tracking-[0.18em] text-white backdrop-blur-[10px]">
            FRAME / {entry.date.slice(2, 10).replaceAll('-', '')}
          </span>
          {frameIndex !== undefined ? (
            <span
              className="absolute -bottom-[0.22em] right-[0.8rem] z-[2] font-display text-[clamp(4.5rem,10vw,8rem)] font-light leading-none tracking-[-0.08em] text-white/[0.76] mix-blend-screen"
              aria-hidden="true"
            >
              {String(frameIndex + 1).padStart(2, '0')}
            </span>
          ) : null}
        </div>
        <figcaption className="flex items-end justify-between gap-6 pt-[0.9rem] to-520:items-start">
          <div>
            <h2 className="font-display text-[clamp(1.35rem,2.5vw,2rem)] leading-none! tracking-[-0.025em]">
              {entry.title}
            </h2>
            <span
              className={cn(
                'mt-[0.4rem] block text-[0.58rem] uppercase tracking-[0.16em]',
                inverse ? 'text-inverse-muted' : 'text-muted-foreground',
              )}
            >
              {entry.location}
            </span>
          </div>
          {viewLabel ? (
            <span className="inline-flex shrink-0 items-center gap-[0.35rem] border-b border-current pb-[0.22rem] transition-colors duration-[180ms] ease-[ease] group-hover:text-accent to-520:text-[0px] [&>svg]:w-[0.8rem] to-520:[&>svg]:w-4 [&>svg]:transition-transform [&>svg]:duration-[180ms] [&>svg]:ease-[ease] group-hover:[&>svg]:translate-x-[2px] group-hover:[&>svg]:-translate-y-[2px]">
              {viewLabel}
              <ArrowUpRight aria-hidden="true" />
            </span>
          ) : null}
        </figcaption>
      </figure>
    </Link>
  );
}
