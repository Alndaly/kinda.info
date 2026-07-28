'use client';

import type { CSSProperties } from 'react';
import { AudioLines } from 'lucide-react';
import type { AudioTrack } from '@/lib/audio';
import { cn } from '@/lib/utils';

export function AudioVinyl({
  track,
  playing,
  compact = false,
  className,
}: {
  track: AudioTrack | null;
  playing: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn('audio-vinyl', compact && 'audio-vinyl-compact', className)}
      data-playing={playing}
      style={{ '--audio-accent': track?.accent ?? '#e25943' } as CSSProperties}
      aria-hidden="true"
    >
      <div className="audio-vinyl-grooves" />
      <div className="audio-vinyl-label">
        <AudioLines />
        <span>KINDA</span>
        <small>
          {!track
            ? 'ARCHIVE'
            : track.kind === 'bgm'
              ? 'BGM'
              : track.kind === 'narration'
                ? 'READ'
              : 'FIELD'}
        </small>
      </div>
    </div>
  );
}
