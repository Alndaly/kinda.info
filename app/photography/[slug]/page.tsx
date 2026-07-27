import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { TiptapContent } from '@/components/tiptap/tiptap-content';
import { formatDate, getEntry, photos } from '@/lib/content';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return photos.map((photo) => ({ slug: photo.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const photo = getEntry('photo', (await params).slug);
  if (!photo) return {};
  return {
    title: photo.title,
    description: photo.summary,
    alternates: { canonical: photo.href },
    openGraph: {
      title: photo.title,
      description: photo.summary,
      url: photo.href,
      images: photo.cover ? [photo.cover] : ['/og.png'],
    },
  };
}

export default async function PhotoPage({ params }: Props) {
  const photo = getEntry('photo', (await params).slug);
  if (!photo) notFound();

  return (
    <article className="photo-detail">
      <div className="site-container">
        <Link href="/photography" className="back-link"><ArrowLeft /> 回到暗房</Link>
        <header>
          <span>{photo.location} · {formatDate(photo.date)}</span>
          <h1>{photo.title}</h1>
          <p>{photo.summary}</p>
        </header>
      </div>
      {photo.cover && (
        <div className="photo-detail-hero">
          <Image
            src={photo.cover}
            alt={photo.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="mdx-prose mdx-prose-photo">
        <TiptapContent content={photo.content} fallbackHtml={photo.html} />
      </div>
    </article>
  );
}
