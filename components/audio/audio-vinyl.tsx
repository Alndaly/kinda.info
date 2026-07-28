'use client';

import type { CSSProperties } from 'react';
import { AudioLines } from 'lucide-react';
import type { AudioTrack } from '@/lib/audio';

export function AudioVinyl({
  track,
  playing,
  compact = false,
}: {
  track: AudioTrack | null;
  playing: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`audio-vinyl ${compact ? 'audio-vinyl-compact' : ''}`}
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
