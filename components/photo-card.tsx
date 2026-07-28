import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Entry } from '@/.velite';

export function PhotoCard({
  entry,
  priority = false,
  className = '',
  frameIndex,
  viewLabel,
}: {
  entry: Entry;
  priority?: boolean;
  className?: string;
  frameIndex?: number;
  viewLabel?: string;
}) {
  return (
    <Link href={entry.href} className={`photo-card group ${className}`}>
      <figure>
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
          <span className="photo-number">
            FRAME / {entry.date.slice(2, 10).replaceAll('-', '')}
          </span>
          {frameIndex !== undefined ? (
            <span className="photo-sequence" aria-hidden="true">
              {String(frameIndex + 1).padStart(2, '0')}
            </span>
          ) : null}
        </div>
        <figcaption className="photo-caption">
          <div>
            <h2 className="font-display">{entry.title}</h2>
            <span>{entry.location}</span>
          </div>
          {viewLabel ? (
            <span className="photo-view-label">
              {viewLabel}
              <ArrowUpRight aria-hidden="true" />
            </span>
          ) : null}
        </figcaption>
      </figure>
    </Link>
  );
}
