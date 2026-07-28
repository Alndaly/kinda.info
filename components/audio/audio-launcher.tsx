'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useGlobalAudio } from '@/components/audio/global-audio-provider';
import { getBackgroundTracks } from '@/lib/audio';
import { localizeHref, type Locale } from '@/lib/i18n';

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
      className="audio-launcher"
      data-active={Boolean(currentTrack)}
      data-playing={isPlaying}
      data-loading={isLoading}
    >
      <button
        type="button"
        className="audio-launcher-toggle"
        onClick={handleToggle}
        aria-label={isPlaying ? labels.pause : labels.play}
        aria-pressed={isPlaying}
        aria-busy={isLoading}
        title={isPlaying ? labels.pause : labels.play}
      >
        <span className="audio-launcher-record" aria-hidden="true" />
        <span
          className="audio-launcher-glyph"
          data-icon={isPlaying ? 'pause' : 'play'}
          aria-hidden="true"
        />
      </button>

      <div className="audio-launcher-reveal" aria-live="polite">
        <span className="audio-launcher-copy">
          <small>{stateLabel}</small>
          <strong className="min-w-0 overflow-x-clip overflow-y-visible whitespace-nowrap text-ellipsis text-ink font-[family-name:var(--font-display)] text-[0.74rem] font-[620] leading-[1.3]">
            {visibleTrack.title || label}
          </strong>
        </span>
        <Link
          href={localizeHref(locale, '/player')}
          className="audio-launcher-link"
          aria-label={labels.open}
          title={labels.open}
        >
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
