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

const WAVEFORM = [
  34, 58, 42, 76, 52, 88, 63, 45,
  72, 96, 57, 81, 48, 68, 39, 74,
  91, 61, 46, 79, 54, 86, 66, 43,
  70, 94, 59, 83, 50, 73, 41, 64,
];

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
    artist: isEnglish ? 'Field recording · July' : '现场录音 · 七月',
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
      className="tiptap-audio"
      data-state={status}
      aria-label={isEnglish ? `Audio player: ${name}` : `音频播放器：${name}`}
    >
      <div className="tiptap-audio-header">
        <div className="tiptap-audio-kicker">
          <AudioLines aria-hidden="true" />
          <span>{isEnglish ? 'Sound object / Field note' : '声音切片 / 现场记录'}</span>
        </div>
        <span className="tiptap-audio-format">{format}</span>
      </div>

      <div className="tiptap-audio-player">
        <button
          type="button"
          className="tiptap-audio-play"
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

        <div className="tiptap-audio-copy">
          <strong className="block min-w-0 overflow-x-clip overflow-y-visible whitespace-nowrap text-ellipsis font-[family-name:var(--font-display)] text-[1.15rem] font-semibold leading-[1.3] min-[769px]:text-[1.35rem]">
            {name}
          </strong>
          <span>{isEnglish ? 'Audio note' : '音频笔记'}</span>
        </div>

        <div className="tiptap-audio-actions">
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

        <div className="tiptap-audio-timeline">
          <div className="tiptap-audio-wave">
            <div className="tiptap-audio-wave-layer" aria-hidden="true">
              {WAVEFORM.map((height, index) => (
                <i key={`base-${index}`} style={{ height: `${height}%` }} />
              ))}
            </div>
            <div
              className="tiptap-audio-wave-layer tiptap-audio-wave-active"
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
          <div className="tiptap-audio-time">
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
          <div className="tiptap-audio-error" role="alert">
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
