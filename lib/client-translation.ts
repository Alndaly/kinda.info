'use client';

export type TranslationState = 'idle' | 'loading' | 'ready' | 'error';

type TranslationCache = {
  source: string[];
  translated: string[];
};

export async function translateTexts(
  texts: string[],
  sourceLanguage = 'zh',
  targetLanguage = 'en',
) {
  if (!texts.length) return [];

  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceLanguage,
      targetLanguage,
      texts,
    }),
  });

  if (!response.ok) {
    throw new Error(`Translation request failed with ${response.status}`);
  }

  const result = await response.json() as { translations?: string[] };
  if (!Array.isArray(result.translations) || result.translations.length !== texts.length) {
    throw new Error('Translation response did not match the source document');
  }

  return result.translations;
}

export function readTranslationCache(cacheKey: string, source: string[]) {
  try {
    const raw = window.sessionStorage.getItem(`kinda:translation:${cacheKey}`);
    if (!raw) return null;
    const cached = JSON.parse(raw) as TranslationCache;
    if (
      !Array.isArray(cached.source) ||
      !Array.isArray(cached.translated) ||
      cached.source.length !== source.length ||
      cached.translated.length !== source.length ||
      cached.source.some((value, index) => value !== source[index])
    ) {
      return null;
    }
    return cached.translated;
  } catch {
    return null;
  }
}

export function writeTranslationCache(
  cacheKey: string,
  source: string[],
  translated: string[],
) {
  try {
    window.sessionStorage.setItem(
      `kinda:translation:${cacheKey}`,
      JSON.stringify({ source, translated } satisfies TranslationCache),
    );
  } catch {
    // Translation remains usable when private browsing or storage quotas block caching.
  }
}
