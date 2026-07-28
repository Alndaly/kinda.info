'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import {
  AudioLines,
  CircleAlert,
  Download,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';

const WAVEFORM = [
  34, 58, 42, 76, 52, 88, 63, 45,
  72, 96, 57, 81, 48, 68, 39, 74,
  91, 61, 46, 79, 54, 86, 66, 43,
  70, 94, 59, 83, 50, 73, 41, 64,
];

type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<AudioState>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const format = mime.split('/').at(-1)?.toUpperCase() || 'AUDIO';
  const isPlaying = status === 'playing';

  const playAudio = async () => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    setStatus('loading');
    try {
      await audio.play();
      setStatus('playing');
    } catch {
      setStatus('error');
    }
  };

  const seek = (event: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextTime = Number(event.currentTarget.value);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const toggleMuted = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  };

  const retry = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setStatus('idle');
    audio.load();
    void playAudio();
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
          <strong>{name}</strong>
          <span>{isEnglish ? 'Audio note' : '音频笔记'}</span>
        </div>

        <div className="tiptap-audio-actions">
          <button
            type="button"
            onClick={toggleMuted}
            disabled={!src}
            aria-label={muted
              ? (isEnglish ? 'Unmute' : '取消静音')
              : (isEnglish ? 'Mute' : '静音')}
          >
            {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
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
            <time>{formatTime(currentTime)}</time>
            <span>{status === 'error'
              ? (isEnglish ? 'Unavailable' : '暂不可用')
              : isPlaying
                ? (isEnglish ? 'Playing' : '播放中')
                : (isEnglish ? 'Ready to play' : '等待播放')}</span>
            <time>{duration > 0 ? formatTime(duration) : '--:--'}</time>
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

      <audio
        ref={audioRef}
        className="tiptap-audio-native"
        preload="metadata"
        src={src}
        onLoadedMetadata={(event) => {
          const nextDuration = event.currentTarget.duration;
          setDuration(Number.isFinite(nextDuration) ? nextDuration : 0);
          setStatus((current) => current === 'error' ? current : 'idle');
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setStatus('playing')}
        onPause={(event) => {
          if (!event.currentTarget.ended) {
            setStatus((current) => current === 'error' ? current : 'paused');
          }
        }}
        onWaiting={() => setStatus('loading')}
        onEnded={(event) => {
          setCurrentTime(event.currentTarget.duration || 0);
          setStatus('paused');
        }}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
        onError={() => setStatus('error')}
      />
    </div>
  );
}
