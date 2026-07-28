'use client';

import type { CSSProperties } from 'react';
import { AudioLines } from 'lucide-react';
import type { AudioTrack } from '@/lib/audio';
import { cn } from '@/lib/utils';


const vinylShell = [
  '[--audio-accent:#e25943] relative grid aspect-square flex-none place-items-center',
  'overflow-hidden rounded-full text-[#f3eee2]',
  'bg-[radial-gradient(circle,transparent_0_4%,#151512_4.2%_7%,transparent_7.2%_100%),repeating-radial-gradient(circle,transparent_0_4px,rgba(255,255,255,.045)_5px,transparent_6px),conic-gradient(from_45deg,#080808,#292824,#0b0b0a,#25241f,#090909,#302e28,#080808)]',
  'shadow-[0_2.5rem_5rem_rgba(20,18,13,0.24),inset_0_0_0_1px_rgba(255,255,255,0.08)]',
  'data-[playing=true]:animate-[slow-spin_9s_linear_infinite] motion-reduce:animate-none!',
  "after:absolute after:inset-[5%] after:rounded-full after:border after:border-white/[0.07] after:content-['']",
].join(' ');

const vinylCompact = 'w-[3.7rem] shadow-[0_0.65rem_1.4rem_rgba(20,18,13,0.24)]';

const vinylLabel = [
  'relative z-[1] grid aspect-square w-[35%] place-items-center rounded-full text-[#171713]',
  'bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,.34),transparent_30%),var(--audio-accent)]',
  'shadow-[inset_0_0_0_1px_rgba(0,0,0,.16)]',
  '[&>svg]:h-[1.05rem] [&>svg]:w-[1.05rem]',
  '[&>span]:-my-2 [&>span]:font-display [&>span]:text-[clamp(0.85rem,2vw,1.35rem)]',
  '[&>span]:font-bold [&>span]:tracking-[-0.03em]',
  '[&>small]:font-mono [&>small]:text-[0.44rem] [&>small]:font-extrabold [&>small]:tracking-[0.18em]',
].join(' ');

/** The compact disc is too small for the label copy. */
const vinylLabelCompact = 'w-[38%] [&>svg]:hidden [&>span]:hidden [&>small]:hidden';

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
      className={cn(vinylShell, compact ? vinylCompact : 'w-[min(23rem,72vw)]', className)}
      data-playing={playing}
      style={{ '--audio-accent': track?.accent ?? '#e25943' } as CSSProperties}
      aria-hidden="true"
    >
      <div
        className={cn(
          'absolute inset-[10%] rounded-full border border-white/[0.08]',
          'shadow-[0_0_0_1.35rem_rgba(255,255,255,.02),0_0_0_2.7rem_rgba(255,255,255,.025),0_0_0_4.05rem_rgba(255,255,255,.018)]',
          compact && 'hidden',
        )}
      />
      <div className={cn(vinylLabel, compact && vinylLabelCompact)}>
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
