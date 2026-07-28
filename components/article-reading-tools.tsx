'use client';

import { useEffect, useRef, useState } from 'react';
import { ListTree } from 'lucide-react';
import { useArticleLanguage } from '@/components/article-language-tools';

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
    const prose = document.querySelector<HTMLElement>('.mdx-prose');
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
        ? [...prose.querySelectorAll<HTMLElement>('.tiptap-figure')].some((figure) => {
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
        className="reading-progress"
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
            className="article-reading-rail"
            aria-label={contentsLabel}
            data-collision={isRailColliding ? 'media' : 'none'}
            data-visible={progress > 0.01 && isArticleActive && !isRailColliding}
          >
            <span className="article-reading-label">
              <span>{contentsLabel}</span>
              <strong>{String(outline.length).padStart(2, '0')}</strong>
            </span>
            <nav>
              {outline.map((item, index) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={item.level === 3 ? 'is-nested' : undefined}
                  aria-current={activeId === item.id ? 'location' : undefined}
                >
                  <span className="article-reading-marker" />
                  <i aria-hidden="true">{String(index + 1).padStart(2, '0')}</i>
                  <span className="article-reading-title">{item.title}</span>
                </a>
              ))}
            </nav>
          </aside>

          <details className="article-mobile-toc">
            <summary>
              <ListTree aria-hidden="true" />
              {contentsLabel}
              <span>{String(outline.length).padStart(2, '0')}</span>
            </summary>
            <nav>
              {outline.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={item.level === 3 ? 'is-nested' : undefined}
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
