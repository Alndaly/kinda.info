import Image from 'next/image';
import Link from 'next/link';
import type { Entry } from '@/.velite';

export function PhotoCard({
  entry,
  priority = false,
  className = '',
}: {
  entry: Entry;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link href={entry.href} className={`photo-card group ${className}`}>
      <div className="photo-frame">
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
        <span className="photo-number">FRAME / {entry.date.slice(2, 10).replaceAll('-', '')}</span>
      </div>
      <div className="flex items-baseline justify-between gap-4 pt-3">
        <h2 className="font-display text-xl tracking-[-0.025em]">{entry.title}</h2>
        <span className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {entry.location}
        </span>
      </div>
    </Link>
  );
}
