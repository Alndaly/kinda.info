'use client';

import Link from 'next/link';
import { Disc3, Music2 } from 'lucide-react';
import { useGlobalAudio } from '@/components/audio/global-audio-provider';
import { localizeHref, type Locale } from '@/lib/i18n';

export function AudioLauncher({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const { currentTrack, status } = useGlobalAudio();

  return (
    <Link
      href={localizeHref(locale, '/player')}
      className="audio-launcher"
      data-active={Boolean(currentTrack)}
      data-playing={status === 'playing'}
      aria-label={label}
      title={currentTrack?.title ?? label}
    >
      {currentTrack ? <Disc3 /> : <Music2 />}
      <span>{currentTrack?.title ?? label}</span>
      {currentTrack ? <i aria-hidden="true" /> : null}
    </Link>
  );
}
