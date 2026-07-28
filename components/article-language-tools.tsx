'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AudioLines,
  CircleAlert,
  Languages,
  LoaderCircle,
  Pause,
  Play,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGlobalAudio } from '@/components/audio/global-audio-provider';
import { formatAudioTime } from '@/lib/audio';
import {
  readTranslationCache,
  translateTexts,
  type TranslationState,
  writeTranslationCache,
} from '@/lib/client-translation';
import type { Locale } from '@/lib/i18n';
import { siteConfig } from '@/site.config';

type ArticleLanguageContextValue = {
  automatic: boolean;
  cacheKey: string;
  sourceLanguage: Locale;
  targetLanguage: Locale;
  title: string;
  summary: string;
  tags: string[];
  additionalTexts: string[];
  status: TranslationState;
  setBodyStatus: (state: TranslationState) => void;
};

const ArticleLanguageContext = createContext<ArticleLanguageContextValue | null>(null);

export function useArticleLanguage() {
  return useContext(ArticleLanguageContext);
}

export function ArticleLanguageProvider({
  automatic,
  cacheKey,
  sourceLanguage,
  targetLanguage,
  title,
  summary,
  tags,
  additionalTexts,
  children,
}: {
  automatic: boolean;
  cacheKey: string;
  sourceLanguage: Locale;
  targetLanguage: Locale;
  title: string;
  summary: string;
  tags: string[];
  additionalTexts: string[];
  children: ReactNode;
}) {
  const [translatedFields, setTranslatedFields] = useState([
    title,
    summary,
    ...tags,
    ...additionalTexts,
  ]);
  const [headerStatus, setHeaderStatus] = useState<TranslationState>(
    automatic ? 'idle' : 'ready',
  );
  const [bodyStatus, setBodyStatusValue] = useState<TranslationState>(
    automatic ? 'idle' : 'ready',
  );
  const setBodyStatus = useCallback((state: TranslationState) => {
    setBodyStatusValue(state);
  }, []);

  useEffect(() => {
    if (!automatic) {
      setTranslatedFields([title, summary, ...tags, ...additionalTexts]);
      setHeaderStatus('ready');
      return;
    }

    let active = true;
    const source = [title, summary, ...tags, ...additionalTexts];
    const cached = readTranslationCache(`${cacheKey}:header`, source);
    if (cached) {
      setTranslatedFields(cached);
      setHeaderStatus('ready');
      return;
    }

    setHeaderStatus('loading');
    void translateTexts(source, sourceLanguage, targetLanguage)
      .then((translated) => {
        if (!active) return;
        setTranslatedFields(translated);
        writeTranslationCache(`${cacheKey}:header`, source, translated);
        setHeaderStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setTranslatedFields(source);
        setHeaderStatus('error');
      });

    return () => {
      active = false;
    };
  }, [
    additionalTexts,
    automatic,
    cacheKey,
    sourceLanguage,
    summary,
    tags,
    targetLanguage,
    title,
  ]);

  const status = !automatic
    ? 'ready'
    : headerStatus === 'error' || bodyStatus === 'error'
      ? 'error'
      : headerStatus === 'ready' && bodyStatus === 'ready'
        ? 'ready'
        : 'loading';
  useEffect(() => {
    if (!automatic || headerStatus !== 'ready') return;
    const updateMetadata = () => {
      document.title = `${translatedFields[0] ?? title} — ${siteConfig.shortTitle}`;
      document
        .querySelector<HTMLMetaElement>('meta[name="description"]')
        ?.setAttribute('content', translatedFields[1] ?? summary);
    };
    updateMetadata();
    const timeout = window.setTimeout(updateMetadata, 1_000);
    return () => window.clearTimeout(timeout);
  }, [
    automatic,
    headerStatus,
    summary,
    title,
    translatedFields,
  ]);
  const value = useMemo<ArticleLanguageContextValue>(() => ({
    automatic,
    cacheKey,
    sourceLanguage,
    targetLanguage,
    title: translatedFields[0] ?? title,
    summary: translatedFields[1] ?? summary,
    tags: translatedFields.slice(2, 2 + tags.length),
    additionalTexts: translatedFields.slice(2 + tags.length),
    status,
    setBodyStatus,
  }), [
    automatic,
    additionalTexts,
    cacheKey,
    setBodyStatus,
    sourceLanguage,
    status,
    summary,
    targetLanguage,
    tags,
    title,
    translatedFields,
  ]);

  return (
    <ArticleLanguageContext.Provider value={value}>
      {children}
    </ArticleLanguageContext.Provider>
  );
}

export function ArticleTranslatedText({
  index,
  fallback,
}: {
  index: number;
  fallback: string;
}) {
  const language = useArticleLanguage();
  return language?.additionalTexts[index] || fallback;
}

export function ArticleTranslatedTags() {
  const language = useArticleLanguage();
  if (!language) return null;

  return language.tags.map((tag) => <Badge key={tag}>{tag}</Badge>);
}

export function ArticleTranslatedHeading() {
  const language = useArticleLanguage();
  if (!language) return null;

  return (
    <>
      <h1 data-document-title>{language.title}</h1>
      <p className="article-deck" data-document-summary>{language.summary}</p>
    </>
  );
}

export function AutomaticTranslationNotice({
  labels,
}: {
  labels: {
    title: string;
    description: string;
    translating: string;
    error: string;
  };
}) {
  const language = useArticleLanguage();
  if (!language?.automatic) return null;
  const failed = language.status === 'error';

  return (
    <aside className="translation-notice site-container" data-state={language.status}>
      {failed ? <CircleAlert aria-hidden="true" /> : <Languages aria-hidden="true" />}
      <div>
        <strong>{failed ? labels.error : labels.title}</strong>
        <p>{language.status === 'loading' ? labels.translating : labels.description}</p>
      </div>
      <span>Google Translate</span>
    </aside>
  );
}

function getSpeechText() {
  const title = document.querySelector(
    '[data-document-title], .article-header h1, .photo-detail h1, .project-detail h1',
  )?.textContent ?? '';
  const summary = document.querySelector(
    '[data-document-summary], .article-deck',
  )?.textContent ?? '';
  const reader = document.querySelector('.mdx-prose .tiptap-prosemirror, .mdx-prose .tiptap-fallback');
  if (!reader) return [title, summary].filter(Boolean).join('. ');

  const clone = reader.cloneNode(true) as HTMLElement;
  clone.querySelectorAll([
    'pre',
    'button',
    'iframe',
    'audio',
    'video',
    '.tiptap-mermaid',
    '.tiptap-embed',
    '.tiptap-map',
    '.tiptap-file',
    '.tiptap-audio',
    '.tiptap-code-header',
  ].join(',')).forEach((element) => element.remove());

  return [title, summary, clone.textContent ?? '']
    .join('. ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getArticleArtwork() {
  const articleImages = Array.from(
    document.querySelectorAll<HTMLImageElement>(
      '[data-document-cover] img, .article-header img, .article-cover img, .mdx-prose img',
    ),
    (image) => image.currentSrc || image.src,
  );
  const fallbackCover = document.querySelector<HTMLMetaElement>(
    'meta[property="og:image"]',
  )?.content;
  const sources = [
    ...articleImages,
    ...(fallbackCover ? [fallbackCover] : []),
  ];

  return [...new Set(sources)].slice(0, 8);
}

export function ArticleAudioPlayer({
  labels,
  source,
}: {
  labels: {
    listen: string;
    preparing: string;
    pause: string;
    resume: string;
    error: string;
    provider: string;
  };
  source?: {
    id: string;
    title: string;
    summary?: string;
    locale: Locale;
    accent?: string;
  };
}) {
  const language = useArticleLanguage();
  const {
    currentTrack,
    status,
    currentTime,
    duration,
    prepareTrack,
    togglePlayback,
  } = useGlobalAudio();
  const speechLocale = language?.automatic && language.status === 'error'
    ? language.sourceLanguage
    : language?.targetLanguage ?? source?.locale ?? 'zh';
  const sourceId = language?.cacheKey ?? source?.id ?? 'article';
  const trackId = `narration:${sourceId}:${speechLocale}`;
  const active = currentTrack?.id === trackId;
  const audioState = active ? status : 'idle';

  const play = async () => {
    if (active && currentTrack.src) {
      await togglePlayback();
      return;
    }

    await prepareTrack({
      id: trackId,
      title: language?.title ?? source?.title ?? labels.listen,
      artist: labels.provider,
      subtitle: language?.summary ?? source?.summary,
      kind: 'narration',
      href: window.location.pathname,
      accent: source?.accent ?? '#e25943',
      artwork: getArticleArtwork(),
      ephemeral: true,
    }, async () => {
      const text = getSpeechText();
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, locale: speechLocale }),
      });
      if (!response.ok) throw new Error(`Speech request failed with ${response.status}`);
      return response.blob();
    });
  };

  const disabled = language?.automatic && language.status === 'loading';
  const label = audioState === 'loading'
    ? labels.preparing
    : audioState === 'playing'
      ? labels.pause
      : audioState === 'paused'
        ? labels.resume
        : labels.listen;
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  return (
    <div className="article-audio" data-state={audioState}>
      <button type="button" onClick={play} disabled={disabled || audioState === 'loading'}>
        <span className="article-audio-icon">
          {audioState === 'loading'
            ? <LoaderCircle aria-hidden="true" />
            : audioState === 'playing'
              ? <Pause aria-hidden="true" />
              : <Play aria-hidden="true" />}
        </span>
        <span>
          <strong>{label}</strong>
          <small><AudioLines aria-hidden="true" /> {labels.provider}</small>
        </span>
      </button>
      <span className="article-audio-progress" aria-hidden="true">
        <i style={{ transform: `scaleX(${progress})` }} />
      </span>
      {audioState === 'playing' || audioState === 'paused' ? (
        <time>{formatAudioTime(currentTime)} / {formatAudioTime(duration)}</time>
      ) : null}
      {audioState === 'error' ? <p role="alert">{labels.error}</p> : null}
    </div>
  );
}
