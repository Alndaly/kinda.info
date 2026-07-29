'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useGlobalAudio } from '@/components/audio/global-audio-provider';
import { getBackgroundTracks } from '@/lib/audio';
import { localizeHref, type Locale } from '@/lib/i18n';


const launcherShell = [
  'group/launcher relative flex h-10 w-10 flex-none items-center overflow-hidden',
  'rounded-full border border-line bg-paper/[0.34] text-muted-foreground',
  'shadow-[inset_0_1px_0_hsl(var(--ink)/0.025)]',
  'transition-[width,color,border-color,background-color,box-shadow]',
  'duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
  'hover:w-[14.75rem] hover:border-ink/[0.72] hover:bg-card/[0.94]',
  'hover:shadow-[0_0.6rem_1.7rem_hsl(var(--ink)/0.11)]',
  'focus-within:w-[14.75rem] focus-within:border-ink/[0.72] focus-within:bg-card/[0.94]',
  'focus-within:shadow-[0_0.6rem_1.7rem_hsl(var(--ink)/0.11)]',
].join(' ');

const launcherToggle = [
  'relative order-2 grid aspect-square h-auto w-[calc(2.5rem-2px)] flex-none',
  'place-items-center self-center rounded-full text-paper isolate',
  'focus-visible:outline-2 focus-visible:-outline-offset-[3px] focus-visible:outline-accent/[0.76]',
].join(' ');

/** The little record that spins behind the play glyph. */
const launcherRecord = [
  'absolute inset-[10%] rounded-full transition-[filter] duration-[180ms] ease-[ease] will-change-transform',
  'bg-[radial-gradient(circle_at_36%_28%,hsl(var(--inverse-foreground)/0.09),transparent_31%),repeating-radial-gradient(circle_at_center,transparent_0_0.18rem,hsl(var(--inverse-foreground)/0.055)_0.2rem_0.215rem),conic-gradient(from_28deg,hsl(var(--inverse-background))_0_31%,hsl(54_9%_16%)_33%_48%,hsl(var(--inverse-background))_50%_78%,hsl(54_8%_14%)_80%_100%)]',
  'shadow-[inset_0_0_0_1px_hsl(var(--inverse-foreground)/0.045),0_0.15rem_0.42rem_hsl(var(--inverse-background)/0.28)]',
  'group-hover/launcher:brightness-[1.16]',
  'group-data-[playing=true]/launcher:animate-[slow-spin_3.8s_linear_infinite]',
  'group-data-[loading=true]/launcher:animate-[slow-spin_1.35s_linear_infinite]',
  'group-data-[loading=true]/launcher:opacity-[0.72]',
  'motion-reduce:animate-none!',
].join(' ');

const launcherGlyph = [
  'absolute left-1/2 top-1/2 z-[1] grid aspect-square w-[38%] -translate-x-1/2 -translate-y-1/2',
  'place-items-center text-inverse-foreground',
  'drop-shadow-[0_1px_2px_hsl(var(--inverse-background)/0.72)]',
  "before:h-[68%] before:w-[54%] before:translate-x-[9%] before:bg-current before:content-['']",
  'before:[clip-path:polygon(0_0,100%_50%,0_100%)]',
  'data-[icon=pause]:before:h-[66%] data-[icon=pause]:before:w-[58%]',
  'data-[icon=pause]:before:translate-x-0',
  'data-[icon=pause]:before:[background:linear-gradient(90deg,currentColor_0_34%,transparent_34%_66%,currentColor_66%_100%)]',
  'data-[icon=pause]:before:[clip-path:none]',
].join(' ');

const launcherReveal = [
  'pointer-events-none order-1 grid w-0 min-w-0 flex-none grid-cols-[minmax(0,1fr)_auto]',
  'items-center gap-0 overflow-hidden pr-0 opacity-0 -translate-x-[0.45rem]',
  'transition-[opacity,transform,translate,scale,rotate] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
  'group-hover/launcher:pointer-events-auto group-hover/launcher:w-auto group-hover/launcher:flex-1',
  'group-hover/launcher:gap-[0.55rem] group-hover/launcher:overflow-visible',
  'group-hover/launcher:pr-[0.35rem] group-hover/launcher:translate-x-0 group-hover/launcher:opacity-100',
  'group-hover/launcher:delay-[55ms]',
  'group-focus-within/launcher:pointer-events-auto group-focus-within/launcher:w-auto',
  'group-focus-within/launcher:flex-1 group-focus-within/launcher:gap-[0.55rem]',
  'group-focus-within/launcher:overflow-visible group-focus-within/launcher:pr-[0.35rem]',
  'group-focus-within/launcher:translate-x-0 group-focus-within/launcher:opacity-100',
  'group-focus-within/launcher:delay-[55ms]',
].join(' ');

const launcherCopy = [
  'flex min-w-0 flex-col gap-[0.12rem] pl-[0.42rem]',
  '[&>small]:text-[0.46rem] [&>small]:font-extrabold [&>small]:uppercase',
  '[&>small]:leading-none [&>small]:tracking-[0.14em] [&>small]:text-accent',
].join(' ');

const launcherLink = [
  'grid h-7 w-7 flex-none place-items-center rounded-full border border-line text-muted-foreground',
  'transition-[color,border-color,background-color,transform,translate,scale,rotate] duration-[180ms] ease-[ease]',
  'hover:rotate-6 hover:border-ink hover:bg-ink hover:text-paper',
  'focus-visible:rotate-6 focus-visible:border-ink focus-visible:bg-ink focus-visible:text-paper',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/[0.72]',
  '[&>svg]:h-[0.72rem] [&>svg]:w-[0.72rem]',
].join(' ');

export function AudioLauncher({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const {
    currentTrack,
    status,
    playTrack,
    togglePlayback,
  } = useGlobalAudio();
  const fallbackTrack = getBackgroundTracks(locale)[0];
  const visibleTrack = currentTrack ?? fallbackTrack;
  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';
  const labels = locale === 'zh'
    ? {
        play: `播放${visibleTrack.title}`,
        pause: `暂停${visibleTrack.title}`,
        idle: '背景声音',
        playing: '正在播放',
        paused: '已暂停',
        loading: '正在准备',
        open: '进入声音播放器',
      }
    : {
        play: `Play ${visibleTrack.title}`,
        pause: `Pause ${visibleTrack.title}`,
        idle: 'Background sound',
        playing: 'Now playing',
        paused: 'Paused',
        loading: 'Preparing',
        open: 'Open audio player',
      };

  const stateLabel = isLoading
    ? labels.loading
    : isPlaying
      ? labels.playing
      : currentTrack
        ? labels.paused
        : labels.idle;

  const handleToggle = () => {
    if (!currentTrack) {
      playTrack(fallbackTrack);
      return;
    }
    void togglePlayback();
  };

  return (
    <div
      className={launcherShell}
      data-active={Boolean(currentTrack)}
      data-playing={isPlaying}
      data-loading={isLoading}
    >
      <button
        type="button"
        className={launcherToggle}
        onClick={handleToggle}
        aria-label={isPlaying ? labels.pause : labels.play}
        aria-pressed={isPlaying}
        aria-busy={isLoading}
        title={isPlaying ? labels.pause : labels.play}
      >
        <span className={launcherRecord} aria-hidden="true" />
        <span
          className={launcherGlyph}
          data-icon={isPlaying ? 'pause' : 'play'}
          aria-hidden="true"
        />
      </button>

      <div className={launcherReveal} aria-live="polite">
        <span className={launcherCopy}>
          <small>{stateLabel}</small>
          <strong className="min-w-0 overflow-x-clip overflow-y-visible whitespace-nowrap text-ellipsis text-ink font-display text-[0.74rem] font-[620] leading-[1.3]">
            {visibleTrack.title || label}
          </strong>
        </span>
        <Link
          href={localizeHref(locale, '/player')}
          className={launcherLink}
          aria-label={labels.open}
          title={labels.open}
        >
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
