'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ListMusic,
  LoaderCircle,
  Maximize2,
  Pause,
  Play,
  SkipForward,
  X,
} from 'lucide-react';
import { AudioQueueSheet } from '@/components/audio/audio-queue-sheet';
import { AudioVinyl } from '@/components/audio/audio-vinyl';
import { useGlobalAudio } from '@/components/audio/global-audio-provider';
import { formatAudioTime, isPlayerPath } from '@/lib/audio';
import { localizeHref, type Locale } from '@/lib/i18n';

export function GlobalMiniPlayer({
  locale,
  labels,
}: {
  locale: Locale;
  labels: {
    queue: string;
    queueEmpty: string;
    clear: string;
    remove: string;
    playNow: string;
    recent: string;
    recentEmpty: string;
    nowPlaying: string;
    mini: {
      nowPlaying: string;
      openPlayer: string;
      play: string;
      pause: string;
      next: string;
      close: string;
      queue: string;
    };
  };
}) {
  const pathname = usePathname();
  const [queueOpen, setQueueOpen] = useState(false);
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

  if (!currentTrack || isPlayerPath(pathname)) return null;
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
        aria-label={labels.mini.openPlayer}
      >
        <small>{labels.mini.nowPlaying}</small>
        <strong className="mt-[0.1rem] min-w-0 overflow-x-clip overflow-y-visible whitespace-nowrap text-ellipsis font-[family-name:var(--font-display)] text-base leading-[1.3]">
          {currentTrack.title}
        </strong>
        <span>{currentTrack.artist}</span>
      </Link>

      <div className="global-mini-time">
        {formatAudioTime(currentTime)} / {duration ? formatAudioTime(duration) : '--:--'}
      </div>

      <div className="global-mini-actions">
        <button
          type="button"
          className="global-mini-queue"
          onClick={() => setQueueOpen(true)}
          aria-label={`${labels.mini.queue}: ${queue.length}`}
        >
          <ListMusic />
          {queue.length > 0 ? <span>{queue.length}</span> : null}
        </button>
        <button
          type="button"
          className="global-mini-play"
          onClick={() => void togglePlayback()}
          disabled={loading || !currentTrack.src}
          aria-label={playing ? labels.mini.pause : labels.mini.play}
        >
          {loading ? <LoaderCircle className="global-audio-loading" /> : playing ? <Pause /> : <Play />}
        </button>
        <button type="button" onClick={skipNext} aria-label={labels.mini.next}>
          <SkipForward />
        </button>
        <Link href={localizeHref(locale, '/player')} aria-label={labels.mini.openPlayer}>
          <Maximize2 />
        </Link>
        <button type="button" onClick={dismiss} aria-label={labels.mini.close}>
          <X />
        </button>
      </div>

      <AudioQueueSheet
        open={queueOpen}
        onOpenChange={setQueueOpen}
        labels={{
          queue: labels.queue,
          queueEmpty: labels.queueEmpty,
          clear: labels.clear,
          remove: labels.remove,
          playNow: labels.playNow,
          recent: labels.recent,
          recentEmpty: labels.recentEmpty,
          nowPlaying: labels.nowPlaying,
          close: labels.mini.close,
        }}
      />
    </aside>
  );
}
