'use client';

import { ExternalLink, MessageCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n';
import {
  commentsError,
  commentsHeading,
  commentsNotice,
  commentsSection,
  siteContainer,
} from '@/lib/ui-classes';
import { cn } from '@/lib/utils';

type CommentLabels = {
  eyebrow: string;
  title: string;
  description: string;
  loading: string;
  error: string;
  direct: string;
};

const UTTERANCES_ORIGIN = 'https://utteranc.es';

function utterancesTheme(theme?: string) {
  return theme === 'dark' ? 'github-dark' : 'github-light';
}

/**
 * utterances starts listening for `set-theme` only once its iframe document has
 * loaded, so a message posted before that is silently dropped. Post on the frame's
 * first load and remember it, so later switches apply immediately.
 */
function pushTheme(frame: HTMLIFrameElement, theme?: string) {
  const send = () => frame.contentWindow?.postMessage(
    { type: 'set-theme', theme: utterancesTheme(theme) },
    UTTERANCES_ORIGIN,
  );

  if (frame.dataset.listening === 'true') {
    send();
    return;
  }

  frame.addEventListener('load', () => {
    frame.dataset.listening = 'true';
    send();
  }, { once: true });
}

export function Comments({
  locale,
  type,
  slug,
  repo,
  labels,
}: {
  locale: Locale;
  type: 'note' | 'photo' | 'project';
  slug: string;
  repo: `${string}/${string}`;
  labels: CommentLabels;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const themeReady = resolvedTheme !== undefined;
  const issueTerm = `kinda:${type}:${slug}`;
  const discussionUrl = useMemo(() => (
    `https://github.com/${repo}/issues?q=${encodeURIComponent(`is:issue "${issueTerm}"`)}`
  ), [issueTerm, repo]);

  // Built once per thread, seeded with the theme that is live right now. Later theme
  // switches are pushed into the running iframe: rebuilding it would reload the thread,
  // so `resolvedTheme` is deliberately absent from the dependency list.
  useEffect(() => {
    if (!themeReady) return;
    const container = containerRef.current;
    if (!container) return;
    setState('loading');
    container.replaceChildren();

    const observer = new MutationObserver(() => {
      if (container.querySelector('iframe.utterances-frame')) setState('ready');
    });
    observer.observe(container, { childList: true, subtree: true });

    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('repo', repo);
    script.setAttribute('issue-term', issueTerm);
    script.setAttribute('theme', utterancesTheme(resolvedTheme));
    script.setAttribute('lang', locale === 'zh' ? 'zh-cn' : 'en');
    script.onerror = () => setState('error');
    container.append(script);

    return () => {
      observer.disconnect();
      container.replaceChildren();
    };
  }, [issueTerm, locale, repo, themeReady]);

  useEffect(() => {
    const frame = containerRef.current?.querySelector<HTMLIFrameElement>(
      'iframe.utterances-frame',
    );
    if (frame) pushTheme(frame, resolvedTheme);
  }, [resolvedTheme, state]);

  return (
    <section
      className={cn(siteContainer, commentsSection)}
      data-comments
      aria-labelledby="comments-title"
    >
      <header className={commentsHeading}>
        <span><MessageCircle aria-hidden="true" /> {labels.eyebrow}</span>
        <h2 id="comments-title">{labels.title}</h2>
        <p>{labels.description}</p>
      </header>
      <div className="relative mt-8 min-h-44" data-state={state}>
        {state === 'loading' ? (
          <div className={commentsNotice} role="status">
            <span className="h-[0.65rem] w-[0.65rem] animate-[slow-spin_900ms_linear_infinite] rounded-full border border-accent border-t-transparent" />
            {labels.loading}
          </div>
        ) : null}
        {state === 'error' ? (
          <div className={cn(commentsNotice, commentsError)} role="alert">
            <p>{labels.error}</p>
            <a href={discussionUrl} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" /> {labels.direct}
            </a>
          </div>
        ) : null}
        <div
          ref={containerRef}
          className="min-h-36 [&_.utterances]:max-w-none"
          data-issue-term={issueTerm}
        />
      </div>
    </section>
  );
}
