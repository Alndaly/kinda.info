import type { Locale } from '@/lib/i18n';

export type AudioTrackKind = 'bgm' | 'narration' | 'recording';

export type AudioTrack = {
  id: string;
  title: string;
  artist: string;
  src: string;
  kind: AudioTrackKind;
  subtitle?: string;
  href?: string;
  accent?: string;
  ephemeral?: boolean;
};

type LocalizedTrack = Omit<AudioTrack, 'title' | 'artist' | 'subtitle'> & {
  title: Record<Locale, string>;
  artist: Record<Locale, string>;
  subtitle: Record<Locale, string>;
};

const backgroundTracks: LocalizedTrack[] = [
  {
    id: 'bgm:morning-room',
    title: {
      zh: '晨光经过桌面',
      en: 'Morning Light on the Desk',
    },
    artist: {
      zh: '七月 · 环境声景',
      en: 'July · Ambient Studies',
    },
    subtitle: {
      zh: '柔和、清醒，适合阅读与缓慢开始',
      en: 'Soft and clear, made for reading and slow beginnings',
    },
    src: '/audio/bgm/morning-room.ogg',
    kind: 'bgm',
    accent: '#d9a441',
  },
  {
    id: 'bgm:darkroom-rain',
    title: {
      zh: '雨落在暗房',
      en: 'Rain in the Darkroom',
    },
    artist: {
      zh: '七月 · 环境声景',
      en: 'July · Ambient Studies',
    },
    subtitle: {
      zh: '低饱和的雨夜底色，留给照片和长句',
      en: 'A muted rainy-night bed for photographs and long sentences',
    },
    src: '/audio/bgm/darkroom-rain.ogg',
    kind: 'bgm',
    accent: '#547a8c',
  },
  {
    id: 'bgm:after-hours-build',
    title: {
      zh: '深夜仍在构建',
      en: 'Still Building After Hours',
    },
    artist: {
      zh: '七月 · 环境声景',
      en: 'July · Ambient Studies',
    },
    subtitle: {
      zh: '克制的脉冲与低频，陪一段专注时间',
      en: 'Restrained pulses and low tones for a focused stretch',
    },
    src: '/audio/bgm/after-hours-build.ogg',
    kind: 'bgm',
    accent: '#8b6b9f',
  },
];

export function getBackgroundTracks(locale: Locale): AudioTrack[] {
  return backgroundTracks.map((track) => ({
    ...track,
    title: track.title[locale],
    artist: track.artist[locale],
    subtitle: track.subtitle[locale],
  }));
}

export function formatAudioTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function canPersistTrack(track: AudioTrack) {
  return !track.ephemeral && Boolean(track.src) && !track.src.startsWith('blob:');
}
