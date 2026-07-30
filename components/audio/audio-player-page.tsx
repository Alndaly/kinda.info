'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpRight,
  Asterisk,
  Clock3,
  Disc3,
  Gauge,
  Library,
  ListMusic,
  LoaderCircle,
  Pause,
  Play,
  Plus,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { AudioQueueSheet } from '@/components/audio/audio-queue-sheet';
import { AudioVinyl } from '@/components/audio/audio-vinyl';
import { useGlobalAudio } from '@/components/audio/global-audio-provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatAudioTime, type AudioTrack } from '@/lib/audio';
import { localizeHref, type Locale } from '@/lib/i18n';
import {
  audioEmptyState,
  audioListRow,
  audioRemoveButton,
  audioScrollList,
  audioTrackRow,
} from '@/lib/ui-classes';
import { cn } from '@/lib/utils';

type PlayerLabels = {
  eyebrow: string;
  title: string;
  description: string;
  nowPlaying: string;
  idleTitle: string;
  idleDescription: string;
  play: string;
  pause: string;
  previous: string;
  next: string;
  volume: string;
  queue: string;
  queueEmpty: string;
  clear: string;
  remove: string;
  playNow: string;
  addQueue: string;
  inQueue: string;
  recent: string;
  recentEmpty: string;
  soundLibrary: string;
  soundLibraryDescription: string;
  generatedNarration: string;
  fieldRecording: string;
  backgroundMusic: string;
  returnToSource: string;
  mini: {
    close: string;
  };
};


/* ── App shell ────────────────────────────────────────────────────────── */

const appShell = [
  '[--audio-accent:#e25943] grid h-[100dvh] min-h-[36rem] grid-rows-[4.25rem_minmax(0,1fr)_6.15rem]',
  'overflow-hidden',
  'bg-[radial-gradient(circle_at_48%_28%,color-mix(in_srgb,var(--audio-accent),transparent_91%),transparent_30%)] bg-paper',
  'to-720:min-h-[32rem]',
  'to-720:grid-rows-[3.8rem_minmax(0,1fr)_7.4rem]',
].join(' ');

const appTopbar = [
  'relative z-[4] grid min-w-0 grid-cols-[minmax(13rem,1fr)_auto_minmax(13rem,1fr)] items-center gap-4',
  'border-b border-line bg-paper/[0.88] px-[clamp(1rem,2vw,1.75rem)]',
  'backdrop-blur-[22px] backdrop-saturate-[1.3]',
  'to-1180:grid-cols-[1fr_auto_1fr]',
  'to-980:grid-cols-[1fr_auto]',
  'to-480:px-[0.7rem]',
].join(' ');

const appBrand = [
  'flex w-max min-w-0 items-center gap-[0.7rem]',
  '[&>span]:grid [&>span]:h-9 [&>span]:w-9 [&>span]:flex-none [&>span]:place-items-center',
  '[&>span]:rounded-full [&>span]:bg-ink [&>span]:text-paper',
  '[&_svg]:h-4 [&_svg]:w-4',
  '[&>div]:grid [&>div]:min-w-0',
  '[&_strong]:font-display [&_strong]:text-[1.05rem] [&_strong]:leading-none',
  '[&_strong]:tracking-[-0.035em]',
  '[&_small]:mt-[0.22rem] [&_small]:text-[0.42rem] [&_small]:font-[750] [&_small]:uppercase',
  '[&_small]:tracking-[0.15em] [&_small]:text-muted-foreground',
  'to-720:[&_small]:hidden',
  'to-480:[&>span]:h-8 to-480:[&>span]:w-8',
  'to-480:[&_strong]:text-[0.9rem]',
].join(' ');

const appTabs = [
  'flex items-center gap-1 rounded-full border border-line bg-secondary/[0.52] p-1',
  '[&_button]:flex [&_button]:h-8 [&_button]:items-center [&_button]:gap-[0.4rem]',
  '[&_button]:rounded-full [&_button]:px-3 [&_button]:text-[0.55rem] [&_button]:font-bold',
  '[&_button]:text-muted-foreground',
  '[&_button]:transition-[color,background-color] [&_button]:duration-[180ms] [&_button]:ease-[ease]',
  '[&_button[data-active=true]]:bg-ink [&_button[data-active=true]]:text-paper',
  '[&_svg]:h-[0.72rem] [&_svg]:w-[0.72rem]',
  '[&_span]:grid [&_span]:h-4 [&_span]:min-w-4 [&_span]:place-items-center [&_span]:rounded-full',
  '[&_span]:bg-paper/[0.12] [&_span]:text-[0.42rem] [&_span]:text-inherit',
  'to-980:hidden',
].join(' ');

const appTopActions = [
  'flex min-w-0 items-center justify-end gap-[0.4rem]',
  'to-480:gap-[0.24rem]',
].join(' ');

const appMobileAction = [
  'hidden h-9 w-9 place-items-center rounded-full border border-line text-muted-foreground',
  '[&>svg]:h-[0.85rem] [&>svg]:w-[0.85rem]',
].join(' ');

/** The library only collapses into a button on the narrowest layout. */
const appMobileActionLibrary = 'to-720:grid';
const appMobileActionQueue = 'to-980:grid';

const appExit = [
  'ml-[0.15rem] flex h-9 items-center gap-[0.45rem] rounded-full border border-line',
  'px-[0.8rem] text-[0.55rem] font-[720] text-muted-foreground',
  'transition-[color,border-color,background-color] duration-[180ms] ease-[ease]',
  'hover:border-ink hover:bg-ink hover:text-paper',
  '[&>svg]:h-[0.72rem] [&>svg]:w-[0.72rem]',
  'to-720:w-9 to-720:justify-center to-720:px-0',
  'to-720:[&>span]:hidden',
].join(' ');

const appWorkspace = [
  'grid min-h-0 min-w-0 gap-px overflow-hidden bg-line',
  'grid-cols-[clamp(15.5rem,19vw,19rem)_minmax(22rem,1fr)_clamp(18rem,22vw,22rem)]',
  'to-1180:grid-cols-[16rem_minmax(22rem,1fr)_18rem]',
  'to-980:grid-cols-[16rem_minmax(0,1fr)]',
  'to-720:grid-cols-[minmax(0,1fr)]',
].join(' ');

/** Library and side panel share their frame; the side panel is hidden sooner. */
const appColumn = 'flex min-h-0 min-w-0 flex-col overflow-hidden bg-paper p-5';
const appLibraryColumn = [
  'to-720:hidden',
  '[&>p]:mt-[0.85rem] [&>p]:flex-none [&>p]:text-[0.56rem] [&>p]:leading-[1.55]',
  '[&>p]:text-muted-foreground',
].join(' ');

const appPanelHeading = [
  'flex flex-none items-center justify-between gap-3',
  '[&>div]:min-w-0',
  '[&_span]:text-[0.45rem] [&_span]:font-extrabold [&_span]:uppercase',
  '[&_span]:tracking-[0.16em] [&_span]:text-[var(--audio-accent)]',
  '[&_h2]:mt-[0.32rem] [&_h2]:py-[0.06em] [&_h2]:font-display [&_h2]:text-[1.35rem]',
  '[&_h2]:font-semibold [&_h2]:leading-[1.16]! [&_h2]:tracking-[-0.035em]',
  '[&>button]:h-[2.1rem] [&>button]:w-[2.1rem] [&>button]:flex-none [&>button]:rounded-full',
  '[&>button]:shadow-none [&>button>svg]:h-[0.82rem] [&>button>svg]:w-[0.82rem]',
].join(' ');

const appLibraryAdd = [
  'grid h-[1.85rem] w-[1.85rem] place-items-center rounded-full text-muted-foreground',
  'transition-[color,background-color] duration-[150ms] ease-[ease]',
  'hover:bg-secondary hover:text-ink disabled:opacity-35',
  '[&>svg]:h-[0.72rem] [&>svg]:w-[0.72rem]',
].join(' ');

/* ── Stage ────────────────────────────────────────────────────────────── */

const appStage = [
  'relative min-h-0 min-w-0 overflow-hidden px-8 pb-[1.2rem] pt-[1.4rem]',
  'bg-[radial-gradient(circle_at_50%_35%,color-mix(in_srgb,var(--audio-accent),transparent_77%),transparent_26%),linear-gradient(145deg,hsl(var(--ink)/0.035),transparent_44%)] bg-secondary',
  "before:absolute before:inset-0 before:z-[1] before:content-['']",
  'before:bg-[repeating-linear-gradient(90deg,transparent_0_54px,hsl(var(--line)/0.12)_55px),repeating-linear-gradient(0deg,transparent_0_54px,hsl(var(--line)/0.08)_55px)]',
  'before:[mask-image:linear-gradient(to_bottom,black,transparent_78%)]',
  'to-720:px-4 to-720:pb-[0.9rem] to-720:pt-4',
].join(' ');

const appBackdrop = [
  'absolute inset-[-2rem] z-0 overflow-hidden bg-secondary',
  "after:absolute after:inset-0 after:backdrop-blur-[1px] after:content-['']",
  'after:bg-[linear-gradient(to_bottom,hsl(var(--secondary)/0.34),hsl(var(--secondary)/0.78)),radial-gradient(circle_at_center,transparent_8%,hsl(var(--secondary)/0.72)_78%)]',
  '[&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:opacity-[0.42]',
  '[&_img]:[filter:saturate(0.72)_contrast(0.92)]',
  '[&_img]:animate-[backdrop-enter_1.2s_ease_both,backdrop-drift_18s_ease-in-out_infinite_alternate]',
  'motion-reduce:[&_img]:animate-none!',
].join(' ');

const appOrbit = [
  'absolute left-1/2 top-1/2 z-[2] aspect-square w-[min(31rem,65vh,68%)]',
  '-translate-x-1/2 -translate-y-1/2 rounded-full border border-line',
  "before:absolute before:inset-[8%] before:rounded-full before:border before:border-line/[0.58] before:content-['']",
  "after:absolute after:inset-[19%] after:rounded-full after:border after:border-line/[0.36] after:content-['']",
  'to-720:w-[min(24rem,75vw,54vh)]',
  '[@media(max-height:800px)_and_(min-width:721px)]:w-[min(31rem,55vh,68%)]',
].join(' ');

const appDisc = [
  'absolute left-1/2 top-1/2 z-[3] grid min-h-0 -translate-x-1/2 -translate-y-1/2 place-items-center',
  'cursor-pointer rounded-full',
  'focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[var(--audio-accent)]',
].join(' ');

/** Vinyl sizing lives here because the stage decides how much room it gets. */
const appDiscVinyl = [
  'w-[min(25rem,54vh,36vw)]',
  'shadow-[0_2.8rem_5rem_hsl(var(--ink)/0.26),0_0_0_1px_hsl(var(--ink)/0.16)]',
  'to-1180:w-[min(21rem,51vh,32vw)]',
  'to-720:w-[min(19rem,67vw,45vh)]',
  'to-480:w-[min(16.5rem,65vw,41vh)]',
  '[@media(max-height:800px)_and_(min-width:721px)]:w-[min(25rem,43vh,36vw)]',
].join(' ');

const appTonearm = [
  'absolute -top-4 right-[-3.25rem] h-64 w-[4.5rem] rotate-[-14deg] [transform-origin:78%_8%]',
  'transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
  'data-[playing=true]:rotate-2',
  "before:absolute before:right-0 before:top-0 before:aspect-square before:w-[2.8rem] before:content-['']",
  'before:rounded-full before:border before:border-line',
  'before:bg-[radial-gradient(circle,var(--audio-accent)_0_8%,hsl(var(--paper))_9%_18%,hsl(var(--ink))_19%_35%,hsl(var(--secondary))_36%_100%)]',
  'before:shadow-[0_0.75rem_1.5rem_hsl(var(--ink)/0.16),inset_0_0_0_0.28rem_hsl(var(--paper)/0.42)]',
  '[&>i]:absolute [&>i]:right-[1.16rem] [&>i]:top-9 [&>i]:h-[11.25rem] [&>i]:w-[0.28rem]',
  '[&>i]:rotate-[-6deg] [&>i]:[transform-origin:top] [&>i]:rounded-full',
  '[&>i]:border [&>i]:border-paper/[0.32]',
  '[&>i]:bg-[linear-gradient(90deg,hsl(var(--ink)/0.78),hsl(var(--paper)/0.72)_48%,hsl(var(--ink)/0.92))]',
  '[&>i]:shadow-[0.18rem_0.3rem_0.8rem_hsl(var(--ink)/0.12)]',
  '[&>span]:absolute [&>span]:bottom-[0.42rem] [&>span]:right-[0.02rem] [&>span]:h-[1.05rem]',
  '[&>span]:w-[2.15rem] [&>span]:rotate-[-8deg] [&>span]:rounded-[0.18rem_0.18rem_0.34rem_0.34rem]',
  '[&>span]:border [&>span]:border-line',
  '[&>span]:bg-[linear-gradient(155deg,hsl(var(--paper)/0.5),transparent_52%)] [&>span]:bg-ink',
  '[&>span]:shadow-[0_0.55rem_1rem_hsl(var(--ink)/0.16)]',
  '[&>span]:[clip-path:polygon(12%_0,92%_0,100%_72%,83%_100%,13%_91%,0_28%)]',
  'to-720:right-[-2.1rem] to-720:scale-[0.76]',
].join(' ');

const appStageCopy = [
  'absolute bottom-[1.2rem] left-8 right-8 z-[4] mx-auto max-w-[35rem] text-center',
  '[&>small]:text-[0.46rem] [&>small]:font-extrabold [&>small]:uppercase',
  '[&>small]:tracking-[0.16em] [&>small]:text-[var(--audio-accent)]',
  '[&_h1]:mt-[0.32rem] [&_h1]:font-display [&_h1]:text-[clamp(2rem,3.7vw,3.6rem)]',
  '[&_h1]:font-[560] [&_h1]:leading-[0.95] [&_h1]:tracking-[-0.055em]',
  '[&>p]:mt-[0.55rem] [&>p]:text-[0.58rem] [&>p]:leading-[1.55] [&>p]:text-muted-foreground',
  '[&>a]:mt-[0.55rem] [&>a]:inline-flex [&>a]:items-center [&>a]:gap-[0.35rem]',
  '[&>a]:text-[0.48rem] [&>a]:text-muted-foreground',
  '[&>a]:transition-colors [&>a]:duration-[150ms] [&>a]:ease-[ease] [&>a:hover]:text-ink',
  '[&>a>svg]:h-[0.62rem] [&>a>svg]:w-[0.62rem]',
  'to-720:[&_h1]:text-[clamp(2rem,9vw,3.1rem)]',
  'to-720:[&>p]:hidden',
  'to-480:[&>a]:hidden',
].join(' ');

/* ── Player bar ───────────────────────────────────────────────────────── */

const appPlayerbar = [
  'relative z-[5] grid min-w-0 items-center gap-5',
  'grid-cols-[minmax(12rem,0.8fr)_minmax(25rem,1.4fr)_minmax(12rem,0.8fr)]',
  'border-t border-line bg-paper/[0.96] px-[clamp(1rem,2vw,1.75rem)]',
  'shadow-[0_-1.5rem_3rem_hsl(var(--ink)/0.05)] backdrop-blur-[22px] backdrop-saturate-[1.3]',
  'to-980:grid-cols-[minmax(11rem,0.7fr)_minmax(22rem,1.3fr)_auto]',
  'to-720:grid-cols-[auto_minmax(0,1fr)_auto] to-720:gap-3',
  'to-720:px-3',
  'to-480:grid-cols-[minmax(0,1fr)_auto]',
].join(' ');

const appCurrent = [
  'flex min-w-0 items-center gap-3',
  '[&>div]:grid [&>div]:min-w-0',
  '[&_strong]:overflow-hidden [&_strong]:whitespace-nowrap [&_strong]:text-ellipsis',
  '[&_strong]:font-display [&_strong]:text-[0.9rem] [&_strong]:font-[620]',
  '[&_span]:mt-[0.22rem] [&_span]:overflow-hidden [&_span]:whitespace-nowrap',
  '[&_span]:text-ellipsis [&_span]:text-[0.46rem] [&_span]:text-muted-foreground',
  'to-720:[&>div]:hidden',
  'to-480:hidden',
].join(' ');

const appCurrentVinyl = [
  'w-[3.45rem] flex-none to-720:w-[2.85rem]',
].join(' ');

const appTransport = [
  'flex items-center justify-center gap-[0.65rem]',
  '[&>button]:grid [&>button]:h-[1.9rem] [&>button]:w-[1.9rem] [&>button]:place-items-center',
  '[&>button]:rounded-full [&>button]:text-muted-foreground',
  '[&>button:hover]:bg-secondary [&>button:hover]:text-ink',
  '[&_svg]:h-[0.88rem] [&_svg]:w-[0.88rem]',
].join(' ');

const appPrimary = [
  'h-[2.7rem]! w-[2.7rem]! bg-memo! text-[#171713]!',
  'shadow-[0_0.45rem_1.2rem_hsl(var(--memo-raw)/0.22)]',
  'hover:brightness-[0.96]',
  '[&>svg]:fill-current',
].join(' ');

/** Range inputs paint their own progress through --audio-progress. */
const appRange = [
  '[&_input]:h-[3px] [&_input]:w-full [&_input]:cursor-pointer [&_input]:appearance-none',
  '[&_input]:rounded-full',
  '[&_input]:bg-[linear-gradient(to_right,var(--audio-accent)_var(--audio-progress,0%),hsl(var(--line))_var(--audio-progress,0%))]',
  '[&_input::-webkit-slider-thumb]:h-[0.68rem] [&_input::-webkit-slider-thumb]:w-[0.68rem]',
  '[&_input::-webkit-slider-thumb]:appearance-none [&_input::-webkit-slider-thumb]:rounded-full',
  '[&_input::-webkit-slider-thumb]:border-2 [&_input::-webkit-slider-thumb]:border-paper',
  '[&_input::-webkit-slider-thumb]:bg-[var(--audio-accent)]',
  '[&_input::-webkit-slider-thumb]:shadow-[0_0_0_1px_var(--audio-accent)]',
].join(' ');

const appTimeline = [
  appRange,
  'grid min-w-0 grid-cols-[2.8rem_minmax(0,1fr)_2.8rem] items-center gap-[0.65rem]',
  '[&>time]:font-mono [&>time]:text-[0.44rem] [&>time]:tabular-nums [&>time]:text-muted-foreground',
  '[&>time:last-child]:text-right',
  'to-480:grid-cols-[2.25rem_minmax(0,1fr)_2.25rem] to-480:gap-[0.4rem]',
].join(' ');

const appUtilities = [
  appRange,
  'grid min-w-0 grid-cols-[auto_minmax(4rem,9rem)_auto_auto] items-center justify-end gap-[0.7rem]',
  '[&_input]:[--audio-progress:var(--audio-volume)]',
  '[&>button]:relative [&>button]:grid [&>button]:h-8 [&>button]:w-8 [&>button]:place-items-center',
  '[&>button]:rounded-full [&>button]:text-muted-foreground',
  '[&>button:hover]:bg-secondary [&>button:hover]:text-ink',
  '[&_svg]:h-[0.82rem] [&_svg]:w-[0.82rem]',
  'to-980:grid-cols-[auto_auto_auto] to-980:[&_input]:hidden',
  'to-720:flex to-720:[&>button:first-child]:hidden',
].join(' ');

const appSpeedButton = [
  'flex! w-auto! items-center gap-[0.3rem] px-[0.55rem]! font-mono text-[0.5rem] tabular-nums',
].join(' ');

const appQueueButton = [
  '[&>span]:absolute [&>span]:-right-[0.05rem] [&>span]:-top-[0.05rem] [&>span]:grid',
  '[&>span]:h-[0.85rem] [&>span]:min-w-[0.85rem] [&>span]:place-items-center [&>span]:rounded-full',
  '[&>span]:bg-accent [&>span]:text-[0.42rem] [&>span]:font-extrabold [&>span]:text-white',
].join(' ');

const SEEK_STEP = 15;
const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;

function trackKindLabel(track: AudioTrack, labels: PlayerLabels) {
  if (track.kind === 'narration') return labels.generatedNarration;
  if (track.kind === 'recording') return labels.fieldRecording;
  return labels.backgroundMusic;
}

export function AudioPlayerPage({
  locale,
  tracks,
  labels,
}: {
  locale: Locale;
  tracks: AudioTrack[];
  labels: PlayerLabels;
}) {
  const {
    currentTrack,
    queue,
    recent,
    status,
    currentTime,
    duration,
    volume,
    muted,
    playTrack,
    togglePlayback,
    seek,
    setVolume,
    toggleMuted,
    enqueue,
    playFromQueue,
    removeFromQueue,
    clearQueue,
    skipNext,
    skipPrevious,
    clearRecent,
    previousPath,
    seekBy,
    playbackRate,
    setPlaybackRate,
  } = useGlobalAudio();
  const router = useRouter();
  const [panel, setPanel] = useState<'queue' | 'recent'>('queue');
  const [queueOpen, setQueueOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [artworkIndex, setArtworkIndex] = useState(0);
  const playing = status === 'playing';
  const loading = status === 'loading';
  const visibleTrack = currentTrack ?? tracks[0] ?? null;
  const artwork = visibleTrack?.artwork ?? [];
  const activeArtwork = artwork[artworkIndex % Math.max(artwork.length, 1)];
  const queuedIds = new Set(queue.map((track) => track.id));
  const panelTracks = panel === 'queue' ? queue : recent;
  const panelEmpty = panel === 'queue' ? labels.queueEmpty : labels.recentEmpty;
  const ui = locale === 'zh'
    ? {
        back: '返回网站',
        brand: '七月 · 声音',
        collection: '声音资料库',
        workspace: '播放器',
        trackCount: '首开放版权曲目',
        libraryDescription: '为阅读、影像与专注时刻挑选。',
        back15: '后退 15 秒',
        forward15: '快进 15 秒',
        speed: '播放速度',
        toggleHint: '空格键播放 / 暂停',
      }
    : {
        back: 'Back to site',
        brand: 'Kinda Audio',
        collection: 'Sound library',
        workspace: 'Player',
        trackCount: 'openly licensed tracks',
        libraryDescription: 'Selected for reading, photographs, and focused time.',
        back15: 'Back 15 seconds',
        forward15: 'Forward 15 seconds',
        speed: 'Playback speed',
        toggleHint: 'Space to play or pause',
      };

  useEffect(() => {
    setArtworkIndex(0);
  }, [visibleTrack?.id]);

  useEffect(() => {
    if (artwork.length < 2) return;
    const interval = window.setInterval(() => {
      setArtworkIndex((index) => (index + 1) % artwork.length);
    }, 9_000);
    return () => window.clearInterval(interval);
  }, [artwork.length, visibleTrack?.id]);

  const playAll = () => {
    const [first, ...rest] = tracks;
    if (!first) return;
    clearQueue();
    if (currentTrack?.id !== first.id || !playing) playTrack(first);
    rest.forEach(enqueue);
  };

  const toggleMainPlayback = () => {
    if (!currentTrack) {
      playAll();
      return;
    }
    void togglePlayback();
  };

  // Space toggles playback, arrows nudge by 15s — unless the reader is typing
  // or has a control focused, where those keys already mean something.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (typeof target?.closest === 'function'
        && target.closest('input, textarea, select, button, a, [contenteditable]')) return;

      if (event.code === 'Space') {
        event.preventDefault();
        toggleMainPlayback();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        seekBy(-SEEK_STEP);
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        seekBy(SEEK_STEP);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [seekBy, toggleMainPlayback]);

  const libraryRows = (inSheet = false) => (
    tracks.length ? (
      <div
        className={cn(
          audioScrollList,
          'mt-[1.2rem]',
          inSheet && 'h-[calc(100dvh-9rem)] mt-6',
        )}
      >
        {tracks.map((track, index) => {
          const active = currentTrack?.id === track.id;
          const queued = queuedIds.has(track.id);
          return (
            <article
              key={track.id}
              data-active={active}
              className={cn(
                audioListRow,
                'data-[active=true]:bg-[color-mix(in_srgb,var(--audio-accent),transparent_92%)]',
              )}
            >
              <button
                type="button"
                className={cn(audioTrackRow, 'px-[0.35rem] py-[0.82rem]')}
                onClick={() => {
                  playTrack(track);
                  if (inSheet) setLibraryOpen(false);
                }}
                aria-label={`${labels.playNow}: ${track.title}`}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong className="min-w-0 overflow-x-clip overflow-y-visible whitespace-nowrap text-ellipsis font-[family-name:var(--font-display)] text-[0.82rem] font-[620] leading-[1.3]">
                    {track.title}
                  </strong>
                  <small>{track.artist}</small>
                </div>
                {active && playing ? <Pause /> : <Play />}
              </button>
              <button
                type="button"
                className={appLibraryAdd}
                onClick={() => enqueue(track)}
                disabled={active || queued}
                aria-label={`${labels.addQueue}: ${track.title}`}
              >
                {queued ? <ListMusic /> : <Plus />}
              </button>
            </article>
          );
        })}
      </div>
    ) : (
      <div className={cn(audioEmptyState, 'min-h-0 flex-1 [&>svg]:h-5 [&>svg]:w-5')}>
        <Disc3 />
        <p>{labels.idleDescription}</p>
      </div>
    )
  );

  return (
    <div
      data-audio-app=""
      className={appShell}
      style={{ '--audio-accent': visibleTrack?.accent ?? '#e25943' } as CSSProperties}
    >
      <header className={appTopbar}>
        <Link className={appBrand} href={localizeHref(locale, '/')}>
          <span><Asterisk /></span>
          <div>
            <strong>{ui.brand}</strong>
            <small>{ui.workspace} / No. 07</small>
          </div>
        </Link>

        <nav className={appTabs} aria-label={labels.queue}>
          <button
            type="button"
            data-active={panel === 'queue'}
            onClick={() => setPanel('queue')}
          >
            <ListMusic /> {labels.queue} <span>{queue.length}</span>
          </button>
          <button
            type="button"
            data-active={panel === 'recent'}
            onClick={() => setPanel('recent')}
          >
            <Clock3 /> {labels.recent} <span>{recent.length}</span>
          </button>
        </nav>

        <div className={appTopActions}>
          <button
            type="button"
            className={cn(appMobileAction, appMobileActionLibrary)}
            onClick={() => setLibraryOpen(true)}
            aria-label={labels.soundLibrary}
          >
            <Library />
          </button>
          <button
            type="button"
            className={cn(appMobileAction, appMobileActionQueue)}
            onClick={() => setQueueOpen(true)}
            aria-label={labels.queue}
          >
            <ListMusic />
          </button>
          <LanguageSwitcher
            locale={locale}
            className="h-9 w-9 min-w-9 to-720:hidden"
          />
          <ModeToggle
            locale={locale}
            className="h-9 w-9 min-w-9 to-480:hidden"
          />
          <Link
            className={appExit}
            href={previousPath ?? localizeHref(locale, '/')}
            onClick={(event) => {
              // Step back through history when we know the reader came from the site,
              // so they land where they left off instead of on a fresh page.
              if (!previousPath || event.metaKey || event.ctrlKey || event.shiftKey) return;
              event.preventDefault();
              router.back();
            }}
          >
            <ArrowLeft /> <span>{ui.back}</span>
          </Link>
        </div>
      </header>

      <div className={appWorkspace}>
        <aside className={cn(appColumn, appLibraryColumn)}>
          <div className={appPanelHeading}>
            <div>
              <span>01 / LIBRARY</span>
              <h2>{ui.collection}</h2>
            </div>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={toggleMainPlayback}
              aria-pressed={playing}
              aria-busy={loading}
            >
              {loading ? (
                <LoaderCircle className="animate-spinner" />
              ) : playing ? (
                <Pause />
              ) : (
                <Play />
              )}
              <span className="sr-only">{playing ? labels.pause : labels.play}</span>
            </Button>
          </div>
          <p>{tracks.length} {ui.trackCount} · {ui.libraryDescription}</p>
          {libraryRows()}
          <small className="mt-auto flex-none pt-4 font-mono text-[0.42rem] tracking-[0.1em] text-muted-foreground">CC BY 4.0 · SOURCE CREDITED</small>
        </aside>

        <section className={appStage}>
          {activeArtwork ? (
            <div className={appBackdrop} aria-hidden="true">
              <img key={activeArtwork} src={activeArtwork} alt="" />
            </div>
          ) : null}
          <div className={appOrbit} aria-hidden="true" />
          <button
            type="button"
            className={appDisc}
            onClick={toggleMainPlayback}
            aria-label={`${playing ? labels.pause : labels.play} · ${ui.toggleHint}`}
            title={ui.toggleHint}
          >
            <AudioVinyl
              track={visibleTrack}
              playing={Boolean(currentTrack && playing)}
              className={appDiscVinyl}
            />
            <div className={appTonearm} data-playing={playing}>
              <i />
              <span />
            </div>
          </button>

          <div className={appStageCopy}>
            <small>
              {visibleTrack ? trackKindLabel(visibleTrack, labels) : labels.nowPlaying}
            </small>
            <h1>{visibleTrack?.title ?? labels.idleTitle}</h1>
            <p>{visibleTrack?.subtitle ?? labels.idleDescription}</p>
            {visibleTrack?.href ? (
              <Link href={visibleTrack.href} target="_blank" rel="noreferrer">
                {visibleTrack.artist} <ArrowUpRight />
              </Link>
            ) : null}
          </div>
        </section>

        <aside className={cn(appColumn, 'pb-0 to-980:hidden')}>
          <div className={appPanelHeading}>
            <div>
              <span>{panel === 'queue' ? '02 / UP NEXT' : '03 / HISTORY'}</span>
              <h2>{panel === 'queue' ? labels.queue : labels.recent}</h2>
            </div>
            {panelTracks.length ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={panel === 'queue' ? clearQueue : clearRecent}
              >
                <Trash2 />
                <span className="sr-only">{labels.clear}</span>
              </Button>
            ) : null}
          </div>

          <div className={cn(audioScrollList, 'mt-[1.1rem] flex flex-1 flex-col [&_ol]:list-none')}>
            {panelTracks.length ? (
              <ol>
                {panelTracks.map((track, index) => (
                  <li className={audioListRow} key={`${panel}-${track.id}-${index}`}>
                    <button
                      type="button"
                      className={cn(audioTrackRow, 'px-[0.2rem] py-[0.88rem]')}
                      onClick={() => {
                        if (panel === 'queue') playFromQueue(index);
                        else playTrack(track);
                      }}
                    >
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <strong className="min-w-0 overflow-x-clip overflow-y-visible whitespace-nowrap text-ellipsis font-[family-name:var(--font-display)] text-[0.82rem] font-[620] leading-[1.3]">
                          {track.title}
                        </strong>
                        <small>{track.artist}</small>
                      </div>
                      <Play />
                    </button>
                    {panel === 'queue' ? (
                      <button
                        type="button"
                        className={audioRemoveButton}
                        onClick={() => removeFromQueue(track.id)}
                        aria-label={`${labels.remove}: ${track.title}`}
                      >
                        <X />
                      </button>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <div className={cn(audioEmptyState, 'min-h-0 flex-1')}>
                {panel === 'queue' ? <ListMusic /> : <Clock3 />}
                <p>{panelEmpty}</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <footer className={appPlayerbar}>
        <div className={appCurrent}>
          <AudioVinyl
            track={visibleTrack}
            playing={playing}
            compact
            className={appCurrentVinyl}
          />
          <div>
            <strong>{visibleTrack?.title ?? labels.idleTitle}</strong>
            <span>{visibleTrack?.artist ?? labels.idleDescription}</span>
          </div>
        </div>

        <div className="grid min-w-0 gap-[0.48rem]">
          <div className={appTransport}>
            <button type="button" onClick={skipPrevious} aria-label={labels.previous}>
              <SkipBack />
            </button>
            <button
              type="button"
              onClick={() => seekBy(-SEEK_STEP)}
              disabled={!duration}
              aria-label={ui.back15}
              title={ui.back15}
            >
              <RotateCcw />
            </button>
            <button
              type="button"
              className={appPrimary}
              onClick={toggleMainPlayback}
              disabled={loading && !currentTrack?.src}
              aria-label={playing ? labels.pause : labels.play}
            >
              {loading
                ? <LoaderCircle className="animate-spinner" />
                : playing
                  ? <Pause />
                  : <Play />}
            </button>
            <button
              type="button"
              onClick={() => seekBy(SEEK_STEP)}
              disabled={!duration}
              aria-label={ui.forward15}
              title={ui.forward15}
            >
              <RotateCw />
            </button>
            <button type="button" onClick={skipNext} aria-label={labels.next}>
              <SkipForward />
            </button>
          </div>
          <div className={appTimeline}>
            <time>{formatAudioTime(currentTime)}</time>
            <input
              type="range"
              min="0"
              max={duration || 1}
              step="0.1"
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => seek(Number(event.currentTarget.value))}
              disabled={!duration}
              aria-label={visibleTrack?.title ?? labels.nowPlaying}
              style={{
                '--audio-progress': `${duration ? (currentTime / duration) * 100 : 0}%`,
              } as CSSProperties}
            />
            <time>{duration ? formatAudioTime(duration) : '--:--'}</time>
          </div>
        </div>

        <div className={appUtilities}>
          <button type="button" onClick={toggleMuted} aria-label={labels.volume}>
            {muted || volume === 0 ? <VolumeX /> : <Volume2 />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={(event) => setVolume(Number(event.currentTarget.value))}
            aria-label={labels.volume}
            style={{ '--audio-volume': `${(muted ? 0 : volume) * 100}%` } as CSSProperties}
          />
          <button
            type="button"
            className={appSpeedButton}
            onClick={() => {
              const next = SPEEDS[(SPEEDS.indexOf(playbackRate as typeof SPEEDS[number]) + 1) % SPEEDS.length];
              setPlaybackRate(next ?? 1);
            }}
            aria-label={`${ui.speed}: ${playbackRate}×`}
            title={ui.speed}
          >
            <Gauge />
            <span>{playbackRate}×</span>
          </button>
          <button
            type="button"
            className={appQueueButton}
            onClick={() => setQueueOpen(true)}
            aria-label={`${labels.queue}: ${queue.length}`}
          >
            <ListMusic />
            {queue.length ? <span>{queue.length}</span> : null}
          </button>
        </div>
      </footer>

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

      <Sheet open={libraryOpen} onOpenChange={setLibraryOpen}>
        <SheetContent
          side="left"
          className={cn(
            'w-[min(27rem,100vw)] p-6',
            '[&>div:first-child]:pr-12',
            '[&>div:first-child>span]:text-[0.48rem] [&>div:first-child>span]:font-extrabold',
            '[&>div:first-child>span]:uppercase [&>div:first-child>span]:tracking-[0.16em]',
            '[&>div:first-child>span]:text-accent',
          )}
          closeLabel={labels.mini.close}
        >
          <SheetHeader>
            <span>01 / LIBRARY</span>
            <SheetTitle>{labels.soundLibrary}</SheetTitle>
            <SheetDescription>{labels.soundLibraryDescription}</SheetDescription>
          </SheetHeader>
          {libraryRows(true)}
        </SheetContent>
      </Sheet>
    </div>
  );
}
