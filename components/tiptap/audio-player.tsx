'use client';

import { useMemo, type ChangeEvent } from 'react';
import { usePathname } from 'next/navigation';
import {
  AudioLines,
  CircleAlert,
  Download,
  LoaderCircle,
  ListPlus,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useGlobalAudio } from '@/components/audio/global-audio-provider';
import { formatAudioTime, type AudioTrack } from '@/lib/audio';
import { cn } from '@/lib/utils';

const WAVEFORM = [
  34, 58, 42, 76, 52, 88, 63, 45,
  72, 96, 57, 81, 48, 68, 39, 74,
  91, 61, 46, 79, 54, 86, 66, 43,
  70, 94, 59, 83, 50, 73, 41, 64,
];


const audioShell = [
  'group/audio relative ml-[50%] my-14 w-[min(100vw-2rem,58rem)] -translate-x-1/2',
  'overflow-hidden rounded-[0.8rem] border border-line',
  'bg-[radial-gradient(circle_at_86%_-20%,hsl(var(--accent)/0.11),transparent_34%)] bg-card',
  'shadow-[0_1.5rem_4rem_hsl(var(--ink)/0.07)]',
  "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-accent before:content-['']",
  '[&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-[3px]',
  '[&_button:focus-visible]:outline-accent',
  '[&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-[3px] [&_a:focus-visible]:outline-accent',
  'to-520:my-11 to-520:w-[min(100vw-1.25rem,58rem)]',
].join(' ');

const audioHeader = [
  'flex min-h-[2.75rem] items-center justify-between gap-4 border-b border-line',
  'py-[0.65rem] pl-[1.15rem] pr-4 font-sans',
  'to-520:px-[0.85rem]',
].join(' ');

const audioKicker = [
  'flex min-w-0 items-center gap-[0.55rem] text-[0.56rem] font-[750] uppercase',
  'tracking-[0.14em] text-muted-foreground',
  '[&>svg]:h-[0.85rem] [&>svg]:w-[0.85rem] [&>svg]:flex-none [&>svg]:text-accent',
  'to-520:text-[0.5rem] to-520:tracking-[0.1em]',
].join(' ');

const audioFormat = [
  'flex-none rounded-full border border-line px-2 py-[0.28rem] font-mono',
  'text-[0.5rem] font-bold leading-none tracking-[0.1em] text-muted-foreground',
].join(' ');

const audioBody = [
  'grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[0.8rem_1.35rem]',
  'pb-[1.6rem] pl-[1.75rem] pr-[1.6rem] pt-6',
  "[grid-template-areas:'play_copy_actions'_'play_timeline_timeline'_'._error_error']",
  "to-768:[grid-template-areas:'play_copy_actions'_'timeline_timeline_timeline'_'error_error_error']",
  'to-768:gap-[1rem_0.9rem] to-768:p-5',
  'to-520:px-[0.9rem] to-520:pb-[1.2rem] to-520:pt-[1.1rem]',
].join(' ');

const audioPlay = [
  'grid h-17 w-17 place-items-center rounded-full bg-ink text-paper [grid-area:play]',
  'shadow-[0_0.7rem_1.8rem_hsl(var(--ink)/0.16)]',
  'transition-[color,background-color,transform,translate,scale,rotate] duration-[180ms] ease-[ease]',
  'hover:scale-[1.04] hover:bg-accent hover:text-white',
  'group-data-[state=playing]/audio:bg-accent group-data-[state=playing]/audio:text-white',
  'group-data-[state=loading]/audio:bg-accent group-data-[state=loading]/audio:text-white',
  'disabled:cursor-wait disabled:opacity-55 disabled:transform-none',
  '[&>svg]:h-[1.35rem] [&>svg]:w-[1.35rem] [&>svg.lucide-play]:ml-[0.12rem]',
  'group-data-[state=loading]/audio:[&>svg]:animate-spinner',
  'to-768:h-14 to-768:w-14',
  'to-520:h-[3.15rem] to-520:w-[3.15rem]',
].join(' ');

const audioActions = [
  'flex gap-[0.4rem] [grid-area:actions]',
  '[&>*]:grid [&>*]:h-[2.2rem] [&>*]:w-[2.2rem] [&>*]:place-items-center',
  '[&>*]:rounded-full [&>*]:border [&>*]:border-line [&>*]:text-muted-foreground',
  '[&>*]:transition-[color,border-color,background-color] [&>*]:duration-[160ms] [&>*]:ease-[ease]',
  '[&>*:hover]:border-ink [&>*:hover]:bg-ink [&>*:hover]:text-paper',
  '[&>button:disabled]:cursor-not-allowed [&>button:disabled]:opacity-[0.42]',
  '[&_svg]:h-[0.9rem] [&_svg]:w-[0.9rem]',
  'to-520:gap-1 to-520:[&>*]:h-8 to-520:[&>*]:w-8',
].join(' ');

const audioWave = [
  'relative h-10 rounded-[0.25rem]',
  'has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-4',
  'has-[input:focus-visible]:outline-accent',
  '[&_input]:absolute [&_input]:inset-0 [&_input]:z-[2] [&_input]:h-full [&_input]:w-full',
  '[&_input]:cursor-pointer [&_input]:opacity-0 [&_input:disabled]:cursor-not-allowed',
].join(' ');

const audioWaveLayer = [
  'absolute inset-0 grid grid-cols-[repeat(32,minmax(1px,1fr))] items-center gap-[3px]',
  '[&>i]:min-w-px [&>i]:max-h-full [&>i]:rounded-full [&>i]:bg-ink/[0.16]',
  'to-520:gap-[2px]',
].join(' ');

const audioTime = [
  'mt-[0.35rem] grid grid-cols-[3.25rem_1fr_3.25rem] items-center gap-[0.6rem]',
  'font-mono text-[0.52rem] tabular-nums text-muted-foreground',
  '[&>span]:overflow-hidden [&>span]:text-ellipsis [&>span]:whitespace-nowrap',
  '[&>span]:text-center [&>span]:uppercase [&>span]:tracking-[0.1em]',
  '[&>time:last-child]:text-right',
].join(' ');

const audioError = [
  'flex min-w-0 items-center justify-between gap-3 border-t border-accent/[0.28]',
  'pt-3 font-sans text-[0.65rem] text-accent [grid-area:error]',
  '[&>span]:flex [&>span]:items-center [&>span]:gap-[0.4rem]',
  '[&>button]:flex [&>button]:flex-none [&>button]:items-center [&>button]:gap-[0.4rem]',
  '[&>button]:rounded-full [&>button]:border [&>button]:border-accent/45',
  '[&>button]:px-2 [&>button]:py-[0.35rem] [&>button]:text-[0.56rem] [&>button]:font-bold',
  '[&>button]:uppercase [&>button]:tracking-[0.08em]',
  '[&>button:hover]:bg-accent [&>button:hover]:text-white',
  '[&_svg]:h-[0.8rem] [&_svg]:w-[0.8rem]',
].join(' ');

export function AudioPlayer({
  src,
  name,
  mime = '',
  isEnglish = false,
}: {
  src: string;
  name: string;
  mime?: string;
  isEnglish?: boolean;
}) {
  const pathname = usePathname();
  const {
    currentTrack,
    status: globalStatus,
    currentTime: globalCurrentTime,
    duration: globalDuration,
    muted,
    playTrack,
    togglePlayback,
    seek: seekGlobal,
    toggleMuted,
    enqueue,
  } = useGlobalAudio();
  const track = useMemo<AudioTrack>(() => ({
    id: `recording:${src}`,
    title: name,
    artist: isEnglish ? 'Field recording · Kinda' : '现场录音 · 七月',
    subtitle: isEnglish ? 'Audio note from the archive' : '来自个人档案的声音切片',
    src,
    kind: 'recording',
    href: pathname,
    accent: '#e25943',
  }), [isEnglish, name, pathname, src]);
  const active = currentTrack?.id === track.id;
  const status = active ? globalStatus : 'idle';
  const currentTime = active ? globalCurrentTime : 0;
  const duration = active ? globalDuration : 0;
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const format = mime.split('/').at(-1)?.toUpperCase() || 'AUDIO';
  const isPlaying = status === 'playing';

  const playAudio = async () => {
    if (!src) return;
    if (active) {
      await togglePlayback();
    } else {
      playTrack(track);
    }
  };

  const seek = (event: ChangeEvent<HTMLInputElement>) => {
    if (!active) return;
    seekGlobal(Number(event.currentTarget.value));
  };

  const retry = () => {
    playTrack(track);
  };

  return (
    <div
      className={audioShell}
      data-node="audio"
      data-state={status}
      aria-label={isEnglish ? `Audio player: ${name}` : `音频播放器：${name}`}
    >
      <div className={audioHeader}>
        <div className={audioKicker}>
          <AudioLines aria-hidden="true" />
          <span>{isEnglish ? 'Sound object / Field note' : '声音切片 / 现场记录'}</span>
        </div>
        <span className={audioFormat}>{format}</span>
      </div>

      <div className={audioBody}>
        <button
          type="button"
          className={audioPlay}
          onClick={playAudio}
          disabled={!src || status === 'loading'}
          aria-label={
            isPlaying
              ? (isEnglish ? `Pause ${name}` : `暂停 ${name}`)
              : (isEnglish ? `Play ${name}` : `播放 ${name}`)
          }
        >
          {status === 'loading'
            ? <LoaderCircle aria-hidden="true" />
            : isPlaying
              ? <Pause aria-hidden="true" />
              : <Play aria-hidden="true" />}
        </button>

        <div className="col-[copy] min-w-0 [grid-area:copy]">
          <strong className="block min-w-0 overflow-x-clip overflow-y-visible whitespace-nowrap text-ellipsis font-[family-name:var(--font-display)] text-[1.15rem] font-semibold leading-[1.3] min-[769px]:text-[1.35rem]">
            {name}
          </strong>
          <span className="mt-[0.3rem] block font-sans text-[0.62rem] tracking-[0.04em] text-muted-foreground">
            {isEnglish ? 'Audio note' : '音频笔记'}
          </span>
        </div>

        <div className={audioActions}>
          <button
            type="button"
            onClick={toggleMuted}
            disabled={!src || !active}
            aria-label={muted
              ? (isEnglish ? 'Unmute' : '取消静音')
              : (isEnglish ? 'Mute' : '静音')}
          >
            {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => enqueue(track)}
            disabled={!src || active}
            aria-label={isEnglish ? `Add ${name} to queue` : `将 ${name} 加入播放队列`}
          >
            <ListPlus aria-hidden="true" />
          </button>
          {src ? (
            <a
              href={src}
              download={name}
              aria-label={isEnglish ? `Download ${name}` : `下载 ${name}`}
            >
              <Download aria-hidden="true" />
            </a>
          ) : null}
        </div>

        <div className="min-w-0 [grid-area:timeline]">
          <div className={audioWave}>
            <div className={audioWaveLayer} aria-hidden="true">
              {WAVEFORM.map((height, index) => (
                <i key={`base-${index}`} style={{ height: `${height}%` }} />
              ))}
            </div>
            <div
              className={cn(audioWaveLayer, 'overflow-hidden [&>i]:bg-accent')}
              style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
              aria-hidden="true"
            >
              {WAVEFORM.map((height, index) => (
                <i key={`active-${index}`} style={{ height: `${height}%` }} />
              ))}
            </div>
            <input
              type="range"
              min="0"
              max={duration || 1}
              step="0.1"
              value={Math.min(currentTime, duration || 0)}
              onChange={seek}
              disabled={!duration || status === 'error'}
              aria-label={isEnglish ? `Seek ${name}` : `调整 ${name} 的播放进度`}
            />
          </div>
          <div className={audioTime}>
            <time>{formatAudioTime(currentTime)}</time>
            <span>{status === 'error'
              ? (isEnglish ? 'Unavailable' : '暂不可用')
              : isPlaying
                ? (isEnglish ? 'Playing' : '播放中')
                : (isEnglish ? 'Ready to play' : '等待播放')}</span>
            <time>{duration > 0 ? formatAudioTime(duration) : '--:--'}</time>
          </div>
        </div>

        {status === 'error' ? (
          <div className={audioError} role="alert">
            <span>
              <CircleAlert aria-hidden="true" />
              {isEnglish ? 'This recording could not be loaded.' : '这段录音暂时无法加载。'}
            </span>
            <button type="button" onClick={retry}>
              <RotateCcw aria-hidden="true" />
              {isEnglish ? 'Retry' : '重试'}
            </button>
          </div>
        ) : null}
      </div>

    </div>
  );
}
