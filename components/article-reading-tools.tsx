'use client';

import { useEffect, useRef, useState } from 'react';
import { ListTree } from 'lucide-react';
import { useArticleLanguage } from '@/components/article-language-tools';
import { cn } from '@/lib/utils';

type OutlineItem = {
  id: string;
  level: 2 | 3;
  title: string;
};

function createHeadingId(title: string, index: number) {
  const slug = title
    .toLocaleLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-|-$/g, '');
  return slug || `section-${index + 1}`;
}


const readingRail = [
  'fixed left-[max(1.25rem,calc((100vw-1240px)/2))] top-[clamp(8rem,21vh,12rem)] z-20',
  'max-h-[min(60vh,34rem)] w-[8.75rem] overflow-x-hidden overflow-y-auto',
  'pointer-events-none translate-y-3 opacity-0 transition-[opacity,transform] duration-[220ms] ease-[ease]',
  'data-[visible=true]:pointer-events-auto data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100',
  'data-[collision=media]:-translate-x-3',
  '[@media(max-width:1180px)]:hidden',
].join(' ');

const readingRailLabel = [
  'mb-[1.1rem] flex items-center justify-between gap-3 pl-[0.8rem]',
  'text-[0.56rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground',
  '[&>strong]:font-display [&>strong]:text-[0.75rem] [&>strong]:font-medium',
  '[&>strong]:italic [&>strong]:tracking-normal',
].join(' ');

const readingRailNav = 'grid gap-[0.85rem] border-l border-line';

const readingRailLink = [
  'group/link relative grid min-w-0 grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-[0.35rem]',
  'pl-[0.8rem] text-[0.66rem] leading-[1.45] text-muted-foreground transition-colors duration-[180ms] ease-[ease]',
  'hover:text-ink aria-[current=location]:text-ink',
  '[&>i]:pt-[0.05rem] [&>i]:font-display [&>i]:text-[0.68rem] [&>i]:italic [&>i]:text-muted-foreground/[0.72]',
  'aria-[current=location]:[&>i]:text-accent',
].join(' ');

const mobileToc = [
  'mx-auto mt-8 hidden w-[min(100%-2rem,46rem)] border border-line',
  '[@media(max-width:1180px)]:block',
  '[&>summary]:flex [&>summary]:cursor-pointer [&>summary]:items-center [&>summary]:gap-[0.55rem]',
  '[&>summary]:px-4 [&>summary]:py-[0.9rem] [&>summary]:text-[0.68rem] [&>summary]:font-[750]',
  '[&>summary]:tracking-[0.08em]',
  '[&>summary>svg]:w-[0.9rem]',
  '[&>summary>span]:ml-auto [&>summary>span]:text-muted-foreground',
].join(' ');

const mobileTocNav = 'grid gap-[0.7rem] pb-4 pl-[2.45rem] pr-4';

export function ArticleReadingTools({
  contentsLabel,
  progressLabel,
}: {
  contentsLabel: string;
  progressLabel: string;
}) {
  const language = useArticleLanguage();
  const translationStatus = language?.status ?? 'ready';
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const [progress, setProgress] = useState(0);
  const [isArticleActive, setIsArticleActive] = useState(false);
  const [isRailColliding, setIsRailColliding] = useState(false);
  const railRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prose = document.querySelector<HTMLElement>('[data-prose]');
    if (!prose) return;

    let headingObserver: IntersectionObserver | undefined;
    let layoutFrame = 0;

    const collectOutline = () => {
      const usedIds = new Set<string>();
      const headings = [...prose.querySelectorAll<HTMLHeadingElement>('h2, h3')];
      const items = headings.map((heading, index) => {
        const title = heading.textContent?.trim() || `Section ${index + 1}`;
        const generatedId = heading.dataset.readingGeneratedId === 'true';
        const baseId = !heading.id || generatedId
          ? createHeadingId(title, index)
          : heading.id;
        let id = baseId;
        let duplicate = 2;
        while (usedIds.has(id)) id = `${baseId}-${duplicate++}`;
        usedIds.add(id);
        if (!heading.id || generatedId) heading.dataset.readingGeneratedId = 'true';
        heading.id = id;
        return {
          id,
          level: Number(heading.tagName.slice(1)) as 2 | 3,
          title,
        };
      });

      setOutline(items);
      headingObserver?.disconnect();
      headingObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible[0]?.target.id) setActiveId(visible[0].target.id);
        },
        { rootMargin: '-20% 0px -68% 0px' },
      );
      headings.forEach((heading) => headingObserver?.observe(heading));
    };

    const updateProgress = () => {
      const rect = prose.getBoundingClientRect();
      const start = window.scrollY + rect.top - window.innerHeight * 0.22;
      const distance = Math.max(prose.offsetHeight - window.innerHeight * 0.55, 1);
      const nextProgress = Math.min(Math.max((window.scrollY - start) / distance, 0), 1);
      const rail = railRef.current;
      const collisionPadding = 12;
      const railBounds = rail && rail.offsetWidth && rail.offsetHeight
        ? {
            left: rail.offsetLeft - collisionPadding,
            right: rail.offsetLeft + rail.offsetWidth + collisionPadding,
            top: rail.offsetTop - collisionPadding,
            bottom: rail.offsetTop + rail.offsetHeight + collisionPadding,
          }
        : null;
      const collidesWithWideMedia = railBounds
        ? [...prose.querySelectorAll<HTMLElement>('[data-node="figure"]')].some((figure) => {
            const figureBounds = figure.getBoundingClientRect();
            return (
              figureBounds.left < railBounds.right &&
              figureBounds.right > railBounds.left &&
              figureBounds.top < railBounds.bottom &&
              figureBounds.bottom > railBounds.top
            );
          })
        : false;

      setProgress(nextProgress);
      setIsArticleActive(
        rect.top < window.innerHeight * 0.78 &&
        rect.bottom > window.innerHeight * 0.32,
      );
      setIsRailColliding(collidesWithWideMedia);
    };

    const scheduleLayoutUpdate = () => {
      window.cancelAnimationFrame(layoutFrame);
      layoutFrame = window.requestAnimationFrame(updateProgress);
    };

    collectOutline();
    updateProgress();
    scheduleLayoutUpdate();
    const mutationObserver = new MutationObserver(() => {
      collectOutline();
      scheduleLayoutUpdate();
    });
    mutationObserver.observe(prose, {
      characterData: true,
      childList: true,
      subtree: true,
    });
    const resizeObserver = new ResizeObserver(updateProgress);
    resizeObserver.observe(prose);
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      headingObserver?.disconnect();
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      window.cancelAnimationFrame(layoutFrame);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [translationStatus]);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-0.5 overflow-hidden [&>span]:block [&>span]:h-full [&>span]:w-full [&>span]:origin-left [&>span]:bg-accent [&>span]:transition-transform [&>span]:duration-[90ms] [&>span]:ease-linear"
        role="progressbar"
        aria-label={progressLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      {outline.length > 1 ? (
        <>
          <aside
            ref={railRef}
            className={readingRail}
            aria-label={contentsLabel}
            data-collision={isRailColliding ? 'media' : 'none'}
            data-visible={progress > 0.01 && isArticleActive && !isRailColliding}
          >
            <span className={readingRailLabel}>
              <span>{contentsLabel}</span>
              <strong>{String(outline.length).padStart(2, '0')}</strong>
            </span>
            <nav className={readingRailNav}>
              {outline.map((item, index) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={cn(readingRailLink, item.level === 3 && 'text-[0.61rem]')}
                  aria-current={activeId === item.id ? 'location' : undefined}
                >
                  <span className="absolute bottom-[0.15rem] left-[-1px] top-[0.15rem] w-0.5 bg-transparent transition-colors duration-[180ms] ease-[ease] group-aria-[current=location]/link:bg-accent" />
                  <i aria-hidden="true">{String(index + 1).padStart(2, '0')}</i>
                  <span className="line-clamp-2 min-w-0">{item.title}</span>
                </a>
              ))}
            </nav>
          </aside>

          <details className={mobileToc}>
            <summary>
              <ListTree aria-hidden="true" />
              {contentsLabel}
              <span>{String(outline.length).padStart(2, '0')}</span>
            </summary>
            <nav className={mobileTocNav}>
              {outline.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={cn(
                    'text-[0.74rem] text-muted-foreground',
                    item.level === 3 && 'pl-3',
                  )}
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </details>
        </>
      ) : null}
    </>
  );
}
