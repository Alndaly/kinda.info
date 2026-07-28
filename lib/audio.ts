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
  artwork?: string[];
  ephemeral?: boolean;
};

type LocalizedTrack = Omit<AudioTrack, 'title' | 'artist' | 'subtitle'> & {
  title: Record<Locale, string>;
  artist: Record<Locale, string>;
  subtitle: Record<Locale, string>;
};

const backgroundTracks: LocalizedTrack[] = [
  {
    id: 'bgm:a-kind-of-hope',
    title: {
      zh: 'A Kind Of Hope',
      en: 'A Kind Of Hope',
    },
    artist: {
      zh: 'Scott Buckley · CC BY 4.0',
      en: 'Scott Buckley · CC BY 4.0',
    },
    subtitle: {
      zh: '苦甜的钢琴、弦乐与氛围合成器，适合安静阅读',
      en: 'Bittersweet piano, strings, and ambient synth for quiet reading',
    },
    src: '/audio/bgm/a-kind-of-hope.mp3',
    kind: 'bgm',
    href: 'https://www.scottbuckley.com.au/library/a-kind-of-hope/',
    accent: '#cf9d4f',
  },
  {
    id: 'bgm:childhood',
    title: {
      zh: 'Childhood',
      en: 'Childhood',
    },
    artist: {
      zh: 'Scott Buckley · CC BY 4.0',
      en: 'Scott Buckley · CC BY 4.0',
    },
    subtitle: {
      zh: '简单的钢琴与弦乐，留给照片、回忆和缓慢的片刻',
      en: 'Simple piano and strings for photographs, memories, and slow moments',
    },
    src: '/audio/bgm/childhood.mp3',
    kind: 'bgm',
    href: 'https://www.scottbuckley.com.au/library/childhood/',
    accent: '#a87972',
  },
  {
    id: 'bgm:borealis',
    title: {
      zh: 'Borealis',
      en: 'Borealis',
    },
    artist: {
      zh: 'Scott Buckley · CC BY 4.0',
      en: 'Scott Buckley · CC BY 4.0',
    },
    subtitle: {
      zh: '缓慢、沉思而略带明亮感的氛围音乐，适合深夜专注',
      en: 'Slow, contemplative ambience with a subtle lift for late-night focus',
    },
    src: '/audio/bgm/borealis.mp3',
    kind: 'bgm',
    href: 'https://www.scottbuckley.com.au/library/borealis/',
    accent: '#62829c',
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
