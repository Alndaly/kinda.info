import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AudioPlayerPage } from '@/components/audio/audio-player-page';
import { getBackgroundTracks } from '@/lib/audio';
import { getDictionary, getLocaleAlternates, hasLocale } from '@/lib/i18n';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dictionary = getDictionary(lang).player;

  return {
    title: dictionary.metadataTitle,
    description: dictionary.description,
    alternates: getLocaleAlternates(lang, '/player'),
  };
}

export default async function PlayerPage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = getDictionary(lang).player;

  return (
    <AudioPlayerPage
      tracks={getBackgroundTracks(lang)}
      labels={dictionary}
    />
  );
}
