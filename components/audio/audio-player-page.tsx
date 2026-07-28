'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import {
  ArrowDownToLine,
  ArrowUpRight,
  Clock3,
  Disc3,
  ListMusic,
  LoaderCircle,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipBack,
  SkipForward,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { AudioVinyl } from '@/components/audio/audio-vinyl';
import { useGlobalAudio } from '@/components/audio/global-audio-provider';
import { formatAudioTime, type AudioTrack } from '@/lib/audio';

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
};

function trackKindLabel(track: AudioTrack, labels: PlayerLabels) {
  if (track.kind === 'narration') return labels.generatedNarration;
  if (track.kind === 'recording') return labels.fieldRecording;
  return labels.backgroundMusic;
}

export function AudioPlayerPage({
  tracks,
  labels,
}: {
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
  } = useGlobalAudio();
  const playing = status === 'playing';
  const loading = status === 'loading';
  const queuedIds = new Set(queue.map((track) => track.id));

  const playAll = () => {
    const [first, ...rest] = tracks;
    if (!first) return;
    clearQueue();
    if (currentTrack?.id !== first.id || !playing) playTrack(first);
    rest.forEach(enqueue);
  };

  return (
    <div className="audio-page">
      <header className="audio-page-intro site-container">
        <div>
          <span>{labels.eyebrow}</span>
          <h1>{labels.title}</h1>
        </div>
        <p>{labels.description}</p>
      </header>

      <section
        className="audio-deck site-container"
        style={{ '--audio-accent': currentTrack?.accent ?? '#e25943' } as CSSProperties}
      >
        <div className="audio-deck-art">
          <span className="audio-deck-index">A / 07</span>
          <AudioVinyl track={currentTrack} playing={playing} />
          <div className="audio-tonearm" data-playing={playing}>
            <i />
            <span />
          </div>
        </div>

        <div className="audio-deck-controls">
          <div className="audio-now-label">
            <span>{labels.nowPlaying}</span>
            <i data-playing={playing} />
          </div>
          <div className="audio-now-copy">
            <small>{currentTrack ? trackKindLabel(currentTrack, labels) : 'KINDA AUDIO ARCHIVE'}</small>
            <h2>{currentTrack?.title ?? labels.idleTitle}</h2>
            <p>{currentTrack?.subtitle ?? currentTrack?.artist ?? labels.idleDescription}</p>
          </div>

          <div className="audio-main-timeline">
            <input
              type="range"
              min="0"
              max={duration || 1}
              step="0.1"
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => seek(Number(event.currentTarget.value))}
              disabled={!duration}
              aria-label={currentTrack?.title ?? labels.nowPlaying}
              style={{ '--audio-progress': `${duration ? (currentTime / duration) * 100 : 0}%` } as CSSProperties}
            />
            <div>
              <time>{formatAudioTime(currentTime)}</time>
              <span>{status === 'error' ? 'ERROR' : playing ? 'PLAYING' : loading ? 'BUFFERING' : 'PAUSED'}</span>
              <time>{duration ? formatAudioTime(duration) : '--:--'}</time>
            </div>
          </div>

          <div className="audio-transport">
            <button type="button" onClick={skipPrevious} aria-label={labels.previous}>
              <SkipBack />
            </button>
            <button
              type="button"
              className="audio-transport-primary"
              onClick={() => {
                if (!currentTrack) {
                  playAll();
                } else {
                  void togglePlayback();
                }
              }}
              disabled={loading && !currentTrack?.src}
              aria-label={playing ? labels.pause : labels.play}
            >
              {loading ? <LoaderCircle className="global-audio-loading" /> : playing ? <Pause /> : <Play />}
            </button>
            <button type="button" onClick={skipNext} aria-label={labels.next}>
              <SkipForward />
            </button>
          </div>

          <div className="audio-volume">
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
            <span>{String(Math.round((muted ? 0 : volume) * 100)).padStart(2, '0')}</span>
          </div>

          {currentTrack?.href ? (
            <Link
              className="audio-source-link"
              href={currentTrack.href}
              target={currentTrack.href.startsWith('http') ? '_blank' : undefined}
              rel={currentTrack.href.startsWith('http') ? 'noreferrer' : undefined}
            >
              {labels.returnToSource} <ArrowUpRight />
            </Link>
          ) : null}
        </div>
      </section>

      <section className="audio-library site-container">
        <div className="audio-section-heading">
          <div>
            <span>01 / BGM</span>
            <h2>{labels.soundLibrary}</h2>
          </div>
          <p>{labels.soundLibraryDescription}</p>
          <button type="button" onClick={playAll}>
            <Play /> {labels.play}
          </button>
        </div>
        <div className="audio-library-grid">
          {tracks.map((track, index) => {
            const active = currentTrack?.id === track.id;
            const queued = queuedIds.has(track.id);
            return (
              <article
                key={track.id}
                className="audio-library-card"
                data-active={active}
                style={{ '--audio-accent': track.accent } as CSSProperties}
              >
                <button
                  type="button"
                  className="audio-library-play"
                  onClick={() => playTrack(track)}
                  aria-label={`${labels.playNow}: ${track.title}`}
                >
                  <span>
                    <Disc3 />
                    <i>{String(index + 1).padStart(2, '0')}</i>
                  </span>
                  {active && playing ? <Pause /> : <Play />}
                </button>
                <div>
                  <small>
                    {track.href ? (
                      <Link href={track.href} target="_blank" rel="noreferrer">
                        {track.artist} <ArrowUpRight />
                      </Link>
                    ) : track.artist}
                  </small>
                  <h3>{track.title}</h3>
                  <p>{track.subtitle}</p>
                </div>
                <button
                  type="button"
                  className="audio-queue-add"
                  onClick={() => enqueue(track)}
                  disabled={queued || active}
                >
                  {queued ? <ListMusic /> : <Plus />}
                  {queued ? labels.inQueue : labels.addQueue}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <div className="audio-lists site-container">
        <section className="audio-list-panel">
          <div className="audio-list-heading">
            <div>
              <ListMusic />
              <span>02</span>
              <h2>{labels.queue}</h2>
            </div>
            {queue.length ? (
              <button type="button" onClick={clearQueue}>
                <Trash2 /> {labels.clear}
              </button>
            ) : null}
          </div>
          {queue.length ? (
            <ol className="audio-track-list">
              {queue.map((track, index) => (
                <li key={track.id}>
                  <button type="button" onClick={() => playFromQueue(index)}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <strong>{track.title}</strong>
                      <small>{track.artist}</small>
                    </div>
                    <Play />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromQueue(track.id)}
                    aria-label={`${labels.remove}: ${track.title}`}
                  >
                    <X />
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <div className="audio-list-empty">
              <ArrowDownToLine />
              <p>{labels.queueEmpty}</p>
            </div>
          )}
        </section>

        <section className="audio-list-panel">
          <div className="audio-list-heading">
            <div>
              <Clock3 />
              <span>03</span>
              <h2>{labels.recent}</h2>
            </div>
            {recent.length ? (
              <button type="button" onClick={clearRecent}>
                <RotateCcw /> {labels.clear}
              </button>
            ) : null}
          </div>
          {recent.length ? (
            <ol className="audio-track-list audio-recent-list">
              {recent.map((track, index) => (
                <li key={`${track.id}-${index}`}>
                  <button type="button" onClick={() => playTrack(track)}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <strong>{track.title}</strong>
                      <small>{trackKindLabel(track, labels)} · {track.artist}</small>
                    </div>
                    <Play />
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <div className="audio-list-empty">
              <Clock3 />
              <p>{labels.recentEmpty}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
