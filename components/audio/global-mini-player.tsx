'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  ListMusic,
  LoaderCircle,
  Pause,
  Play,
  SkipForward,
  X,
} from 'lucide-react';
import { AudioVinyl } from '@/components/audio/audio-vinyl';
import { useGlobalAudio } from '@/components/audio/global-audio-provider';
import { formatAudioTime } from '@/lib/audio';
import { localizeHref, type Locale } from '@/lib/i18n';

export function GlobalMiniPlayer({
  locale,
  labels,
}: {
  locale: Locale;
  labels: {
    nowPlaying: string;
    openPlayer: string;
    play: string;
    pause: string;
    next: string;
    close: string;
    queue: string;
  };
}) {
  const pathname = usePathname();
  const {
    currentTrack,
    queue,
    status,
    currentTime,
    duration,
    togglePlayback,
    seek,
    skipNext,
    dismiss,
  } = useGlobalAudio();

  if (!currentTrack || /\/player\/?$/.test(pathname)) return null;
  const playing = status === 'playing';
  const loading = status === 'loading';

  return (
    <aside className="global-mini-player" data-state={status}>
      <div className="global-mini-progress">
        <i style={{ transform: `scaleX(${duration ? currentTime / duration : 0})` }} />
        <input
          type="range"
          min="0"
          max={duration || 1}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => seek(Number(event.currentTarget.value))}
          disabled={!duration}
          aria-label={currentTrack.title}
        />
      </div>

      <AudioVinyl track={currentTrack} playing={playing} compact />

      <Link
        className="global-mini-copy"
        href={localizeHref(locale, '/player')}
        aria-label={labels.openPlayer}
      >
        <small>{labels.nowPlaying}</small>
        <strong>{currentTrack.title}</strong>
        <span>{currentTrack.artist}</span>
      </Link>

      <div className="global-mini-time">
        {formatAudioTime(currentTime)} / {duration ? formatAudioTime(duration) : '--:--'}
      </div>

      <div className="global-mini-actions">
        <Link
          href={localizeHref(locale, '/player')}
          className="global-mini-queue"
          aria-label={`${labels.queue}: ${queue.length}`}
        >
          <ListMusic />
          {queue.length > 0 ? <span>{queue.length}</span> : null}
        </Link>
        <button
          type="button"
          onClick={() => void togglePlayback()}
          disabled={loading || !currentTrack.src}
          aria-label={playing ? labels.pause : labels.play}
        >
          {loading ? <LoaderCircle className="global-audio-loading" /> : playing ? <Pause /> : <Play />}
        </button>
        <button type="button" onClick={skipNext} aria-label={labels.next}>
          <SkipForward />
        </button>
        <Link href={localizeHref(locale, '/player')} aria-label={labels.openPlayer}>
          <ChevronRight />
        </Link>
        <button type="button" onClick={dismiss} aria-label={labels.close}>
          <X />
        </button>
      </div>
    </aside>
  );
}
