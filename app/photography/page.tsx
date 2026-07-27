import type { Metadata } from 'next';
import { PhotoCard } from '@/components/photo-card';
import { photos } from '@/lib/content';

export const metadata: Metadata = {
  title: '摄影',
  description: '一些被光照亮，也被我记住的瞬间。',
};

export default function PhotographyPage() {
  return (
    <div className="site-container page-top">
      <header className="archive-header archive-header-split">
        <div>
          <span className="section-index">Index / 02</span>
          <h1>暗房</h1>
        </div>
        <div>
          <p>我拍照，不是为了证明去过哪里。只是有些光、有些表情，如果不按下快门，就会永远消失。</p>
          <span className="mt-6 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            An ongoing visual diary · Since 2022
          </span>
        </div>
      </header>
      <div className="photo-archive-grid">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.slug}
            entry={photo}
            priority={index < 2}
            className={index % 3 === 0 ? 'photo-archive-wide' : ''}
          />
        ))}
      </div>
    </div>
  );
}
