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
  Library,
  ListMusic,
  LoaderCircle,
  Pause,
  Play,
  Plus,
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
        collection: '声音资料库',
        workspace: '播放器',
        trackCount: '首开放版权曲目',
        libraryDescription: '为阅读、影像与专注时刻挑选。',
      }
    : {
        back: 'Back to site',
        collection: 'Sound library',
        workspace: 'Player',
        trackCount: 'openly licensed tracks',
        libraryDescription: 'Selected for reading, photographs, and focused time.',
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

  const libraryRows = (inSheet = false) => (
    tracks.length ? (
      <div className={inSheet ? 'audio-app-library-list in-sheet' : 'audio-app-library-list'}>
        {tracks.map((track, index) => {
          const active = currentTrack?.id === track.id;
          const queued = queuedIds.has(track.id);
          return (
            <article key={track.id} data-active={active}>
              <button
                type="button"
                className="audio-app-library-track"
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
                className="audio-app-library-add"
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
      <div className="audio-app-library-empty">
        <Disc3 />
        <p>{labels.idleDescription}</p>
      </div>
    )
  );

  return (
    <div
      data-audio-app=""
      className="audio-app"
      style={{ '--audio-accent': visibleTrack?.accent ?? '#e25943' } as CSSProperties}
    >
      <header className="audio-app-topbar">
        <Link className="audio-app-brand" href={localizeHref(locale, '/')}>
          <span><Asterisk /></span>
          <div>
            <strong>Kinda Audio</strong>
            <small>{ui.workspace} / No. 07</small>
          </div>
        </Link>

        <nav className="audio-app-tabs" aria-label={labels.queue}>
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

        <div className="audio-app-top-actions">
          <button
            type="button"
            className="audio-app-mobile-action"
            onClick={() => setLibraryOpen(true)}
            aria-label={labels.soundLibrary}
          >
            <Library />
          </button>
          <button
            type="button"
            className="audio-app-mobile-action"
            onClick={() => setQueueOpen(true)}
            aria-label={labels.queue}
          >
            <ListMusic />
          </button>
          <LanguageSwitcher
            locale={locale}
            className="h-9 w-9 min-w-9 [@media(max-width:720px)]:hidden"
          />
          <ModeToggle
            locale={locale}
            className="h-9 w-9 min-w-9 [@media(max-width:480px)]:hidden"
          />
          <Link
            className="audio-app-exit"
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

      <div className="audio-app-workspace">
        <aside className="audio-app-library">
          <div className="audio-app-panel-heading">
            <div>
              <span>01 / LIBRARY</span>
              <h2>{ui.collection}</h2>
            </div>
            <Button type="button" size="icon" variant="outline" onClick={playAll}>
              <Play />
              <span className="sr-only">{labels.play}</span>
            </Button>
          </div>
          <p>{tracks.length} {ui.trackCount} · {ui.libraryDescription}</p>
          {libraryRows()}
          <small className="audio-app-license">CC BY 4.0 · SOURCE CREDITED</small>
        </aside>

        <section className="audio-app-stage">
          {activeArtwork ? (
            <div className="audio-app-backdrop" aria-hidden="true">
              <img key={activeArtwork} src={activeArtwork} alt="" />
            </div>
          ) : null}
          <div className="audio-app-stage-orbit" aria-hidden="true" />
          <div className="audio-app-stage-disc">
            <AudioVinyl
              track={visibleTrack}
              playing={Boolean(currentTrack && playing)}
            />
            <div className="audio-app-tonearm" data-playing={playing}>
              <i />
              <span />
            </div>
          </div>

          <div className="audio-app-stage-copy">
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

        <aside className="audio-app-sidepanel">
          <div className="audio-app-panel-heading">
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

          <div className="audio-app-panel-list">
            {panelTracks.length ? (
              <ol>
                {panelTracks.map((track, index) => (
                  <li key={`${panel}-${track.id}-${index}`}>
                    <button
                      type="button"
                      className="audio-app-panel-track"
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
                        className="audio-app-panel-remove"
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
              <div className="audio-app-panel-empty">
                {panel === 'queue' ? <ListMusic /> : <Clock3 />}
                <p>{panelEmpty}</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <footer className="audio-app-playerbar">
        <div className="audio-app-current">
          <AudioVinyl track={visibleTrack} playing={playing} compact />
          <div>
            <strong>{visibleTrack?.title ?? labels.idleTitle}</strong>
            <span>{visibleTrack?.artist ?? labels.idleDescription}</span>
          </div>
        </div>

        <div className="audio-app-playback">
          <div className="audio-app-transport">
            <button type="button" onClick={skipPrevious} aria-label={labels.previous}>
              <SkipBack />
            </button>
            <button
              type="button"
              className="audio-app-primary"
              onClick={toggleMainPlayback}
              disabled={loading && !currentTrack?.src}
              aria-label={playing ? labels.pause : labels.play}
            >
              {loading
                ? <LoaderCircle className="global-audio-loading" />
                : playing
                  ? <Pause />
                  : <Play />}
            </button>
            <button type="button" onClick={skipNext} aria-label={labels.next}>
              <SkipForward />
            </button>
          </div>
          <div className="audio-app-timeline">
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

        <div className="audio-app-utilities">
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
            className="audio-app-queue-button"
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
          className="audio-library-sheet"
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
