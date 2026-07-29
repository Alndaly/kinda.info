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


const miniShell = [
  'fixed bottom-[clamp(1rem,1.6vw,1.5rem)] right-[clamp(1rem,1.6vw,1.75rem)] z-[75]',
  'grid w-[min(35rem,calc(100vw-2rem))] grid-cols-[auto_minmax(0,1fr)_auto]',
  "[grid-template-areas:'disc_copy_actions'_'disc_time_actions']",
  'items-center gap-[0.15rem_0.85rem] overflow-hidden rounded-[0.9rem]',
  'border border-inverse-line/90 px-[0.8rem] py-[0.72rem] text-inverse-foreground',
  'bg-[radial-gradient(circle_at_0_0,hsl(var(--accent)/0.16),transparent_32%)] bg-[hsl(54_10%_9%/0.94)]',
  'shadow-[0_1.4rem_4rem_rgba(20,18,13,0.3),inset_0_1px_rgba(255,255,255,.05)]',
  'to-820:shadow-[0_0.5rem_1.5rem_rgba(20,18,13,0.18),inset_0_1px_rgba(255,255,255,.05)]',
  'backdrop-blur-[22px] backdrop-saturate-[1.3]',
  'to-820:bottom-[0.65rem] to-820:right-[0.65rem]',
  'to-820:w-[calc(100vw-1.3rem)]',
  'to-560:rounded-xl to-560:px-[0.6rem] to-560:py-[0.55rem]',
].join(' ');

const miniProgress = [
  'absolute inset-x-0 top-0 h-0.5 bg-inverse-line',
  '[&>i]:block [&>i]:h-full [&>i]:w-full [&>i]:origin-left [&>i]:bg-accent',
  '[&>input]:absolute [&>input]:inset-y-[-0.4rem] [&>input]:inset-x-0 [&>input]:w-full',
  '[&>input]:cursor-pointer [&>input]:opacity-0',
].join(' ');

const miniCopy = [
  'grid min-w-0 [grid-area:copy]',
  '[&>small]:text-[0.45rem] [&>small]:font-extrabold [&>small]:uppercase',
  '[&>small]:tracking-[0.17em] [&>small]:text-inverse-muted',
].join(' ');

const miniTime = [
  'font-mono text-[0.45rem] tabular-nums text-inverse-muted [grid-area:time]',
  'to-820:hidden',
].join(' ');

const miniActions = [
  'flex items-center gap-[0.2rem] [grid-area:actions]',
  '[&>*]:relative [&>*]:grid [&>*]:h-8 [&>*]:w-8 [&>*]:place-items-center [&>*]:rounded-full',
  '[&>*]:text-inverse-muted [&>*]:transition-[color,background-color] [&>*]:duration-[150ms] [&>*]:ease-[ease]',
  '[&>*:hover]:bg-inverse-line [&>*:hover]:text-inverse-foreground',
  '[&>button:disabled]:opacity-45',
  '[&_svg]:h-[0.85rem] [&_svg]:w-[0.85rem]',
  'to-560:[&>*]:h-[1.9rem] to-560:[&>*]:w-[1.9rem]',
].join(' ');

const miniQueueButton = [
  '[&>span]:absolute [&>span]:-right-[0.05rem] [&>span]:-top-[0.05rem] [&>span]:grid',
  '[&>span]:h-[0.85rem] [&>span]:min-w-[0.85rem] [&>span]:place-items-center [&>span]:rounded-full',
  '[&>span]:bg-accent [&>span]:text-[0.43rem] [&>span]:font-extrabold [&>span]:text-white',
].join(' ');

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
    <aside className={miniShell} data-state={status}>
      <div className={miniProgress}>
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

      <AudioVinyl
        track={currentTrack}
        playing={playing}
        compact
        className="[grid-area:disc] to-560:w-[3.1rem]"
      />

      <Link
        className={miniCopy}
        href={localizeHref(locale, '/player')}
        aria-label={labels.mini.openPlayer}
      >
        <small>{labels.mini.nowPlaying}</small>
        <strong className="mt-[0.1rem] min-w-0 overflow-x-clip overflow-y-visible whitespace-nowrap text-ellipsis font-display text-base leading-[1.3]">
          {currentTrack.title}
        </strong>
        <span className="mt-[0.1rem] overflow-hidden text-ellipsis whitespace-nowrap text-[0.52rem] text-inverse-muted to-560:hidden">
          {currentTrack.artist}
        </span>
      </Link>

      <div className={miniTime}>
        {formatAudioTime(currentTime)} / {duration ? formatAudioTime(duration) : '--:--'}
      </div>

      <div className={miniActions}>
        <button
          type="button"
          className={miniQueueButton}
          onClick={() => setQueueOpen(true)}
          aria-label={`${labels.mini.queue}: ${queue.length}`}
        >
          <ListMusic />
          {queue.length > 0 ? <span>{queue.length}</span> : null}
        </button>
        <button
          type="button"
          className="text-[#171713]! bg-memo!"
          onClick={() => void togglePlayback()}
          disabled={loading || !currentTrack.src}
          aria-label={playing ? labels.mini.pause : labels.mini.play}
        >
          {loading ? <LoaderCircle className="animate-spinner" /> : playing ? <Pause /> : <Play />}
        </button>
        <button
          type="button"
          onClick={skipNext}
          aria-label={labels.mini.next}
        >
          <SkipForward />
        </button>
        <Link
          href={localizeHref(locale, '/player')}
          aria-label={labels.mini.openPlayer}
          className="to-820:hidden"
        >
          <Maximize2 />
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label={labels.mini.close}
        >
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
