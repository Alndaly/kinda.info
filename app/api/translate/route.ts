import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';

const LANGUAGE_CODES = {
  en: 'en',
  zh: 'zh-CN',
} as const;

const ENDPOINT = 'https://translate.googleapis.com/translate_a/single';
/**
 * Google throttles this endpoint from Cloudflare's shared egress addresses, so
 * Workers AI — in the same runtime, no third party — takes over when it does.
 */
const AI_MODEL = '@cf/meta/m2m100-1.2b';
const AI_CONCURRENCY = 4;
/** The endpoint ignores bot-ish traffic from shared egress IPs; this UA is answered. */
const USER_AGENT = 'Mozilla/5.0 (compatible; Kinda.info/1.0)';
const REQUEST_TIMEOUT_MS = 15_000;

const MAX_TEXTS = 240;
const MAX_TOTAL_CHARACTERS = 48_000;
const MAX_BATCH_CHARACTERS = 2_800;

const AI_LANGUAGE_CODES = {
  en: 'en',
  zh: 'zh',
} as const;

type Language = keyof typeof LANGUAGE_CODES;

type AiBinding = {
  run(model: string, input: Record<string, unknown>): Promise<{ translated_text?: string }>;
};

function preserveBoundaryWhitespace(source: string, translated: string) {
  const leading = source.match(/^\s+/u)?.[0] ?? '';
  const trailing = source.match(/\s+$/u)?.[0] ?? '';
  return `${leading}${translated.trim()}${trailing}`;
}

function createBatches(items: Array<{ index: number; line: string }>) {
  const batches: Array<Array<{ index: number; line: string }>> = [];
  let current: Array<{ index: number; line: string }> = [];
  let currentLength = 0;

  for (const item of items) {
    const itemLength = item.line.length + 8;
    if (current.length && currentLength + itemLength > MAX_BATCH_CHARACTERS) {
      batches.push(current);
      current = [];
      currentLength = 0;
    }
    current.push(item);
    currentLength += itemLength;
  }

  if (current.length) batches.push(current);
  return batches;
}

/**
 * One request for a whole batch. Google answers with sentence segments rather
 * than one string per query, so the joined segments are split back on the line
 * breaks it preserved.
 */
async function translateLines(lines: string[], source: Language, target: Language) {
  const url = new URL(ENDPOINT);
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', LANGUAGE_CODES[source]);
  url.searchParams.set('tl', LANGUAGE_CODES[target]);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', lines.join('\n'));

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (response.status !== 200) {
    throw new Error(`Translation provider returned ${response.status}`);
  }

  const payload = await response.json() as Array<Array<[string]>>;
  const translated = payload[0]?.map((segment) => segment[0] ?? '').join('') ?? '';
  const parts = translated.split('\n');
  if (parts.length === lines.length + 1 && parts.at(-1) === '') parts.pop();
  if (parts.length !== lines.length) {
    throw new Error('Translation provider merged or split lines');
  }
  return parts;
}

async function translateAll(texts: string[], source: Language, target: Language) {
  const translations = [...texts];
  // Inputs travel as lines of one request and come back in that order, so a
  // translation cannot land on the wrong paragraph. A text spanning lines would
  // break the alignment, hence the flattening; boundary whitespace is restored
  // afterwards for callers that rely on it.
  const pending = texts.flatMap((text, index) => (
    text.trim() ? [{ index, line: text.replace(/\s+/gu, ' ').trim() }] : []
  ));

  for (const batch of createBatches(pending)) {
    try {
      const parts = await translateLines(batch.map((item) => item.line), source, target);
      batch.forEach((item, position) => {
        translations[item.index] = preserveBoundaryWhitespace(texts[item.index], parts[position]);
      });
      continue;
    } catch {
      // A batch the provider answered out of step is retried one text at a
      // time, where alignment cannot be lost.
    }

    for (const item of batch) {
      const [part] = await translateLines([item.line], source, target);
      translations[item.index] = preserveBoundaryWhitespace(texts[item.index], part);
    }
  }

  return translations;
}

async function translateWithWorkersAi(texts: string[], source: Language, target: Language) {
  const { env } = await getCloudflareContext({ async: true });
  const ai = (env as { AI?: AiBinding }).AI;
  if (!ai) throw new Error('Workers AI binding is not configured');

  const translations = [...texts];
  const pending = texts.flatMap((text, index) => (text.trim() ? [{ index, text }] : []));
  let cursor = 0;

  const translateNext = async () => {
    while (cursor < pending.length) {
      const item = pending[cursor];
      cursor += 1;
      const result = await ai.run(AI_MODEL, {
        text: item.text,
        source_lang: AI_LANGUAGE_CODES[source],
        target_lang: AI_LANGUAGE_CODES[target],
      });
      if (!result.translated_text) {
        throw new Error(`Workers AI returned nothing for text ${item.index}`);
      }
      translations[item.index] = preserveBoundaryWhitespace(item.text, result.translated_text);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(AI_CONCURRENCY, pending.length) }, () => translateNext()),
  );
  return translations;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Cross-origin translation is not allowed' }, { status: 403 });
  }

  try {
    const body = await request.json() as {
      sourceLanguage?: string;
      targetLanguage?: string;
      texts?: unknown;
    };
    const sourceLanguage = body.sourceLanguage as Language;
    const targetLanguage = body.targetLanguage as Language;
    const texts = body.texts;

    if (
      !(sourceLanguage in LANGUAGE_CODES) ||
      !(targetLanguage in LANGUAGE_CODES) ||
      sourceLanguage === targetLanguage ||
      !Array.isArray(texts) ||
      !texts.every((text) => typeof text === 'string') ||
      texts.length > MAX_TEXTS ||
      texts.reduce((total, text) => total + text.length, 0) > MAX_TOTAL_CHARACTERS
    ) {
      return NextResponse.json({ error: 'Invalid translation request' }, { status: 400 });
    }

    let translations: string[];
    let provider = 'google';
    try {
      translations = await translateAll(texts, sourceLanguage, targetLanguage);
    } catch (error) {
      console.warn('Google Translate unavailable, falling back to Workers AI', error);
      translations = await translateWithWorkersAi(texts, sourceLanguage, targetLanguage);
      provider = 'cloudflare-ai';
    }

    return NextResponse.json(
      { translations, provider },
      { headers: { 'Cache-Control': 'private, max-age=86400' } },
    );
  } catch (error) {
    console.error('Automatic translation failed', error);
    return NextResponse.json({ error: 'Translation is temporarily unavailable' }, { status: 502 });
  }
}
