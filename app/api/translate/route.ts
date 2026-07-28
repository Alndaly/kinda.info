import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

export const runtime = 'nodejs';

const LANGUAGE_CODES = {
  en: 'en',
  zh: 'zh-CN',
} as const;

const MAX_TEXTS = 240;
const MAX_TOTAL_CHARACTERS = 48_000;
const MAX_BATCH_CHARACTERS = 2_800;

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

function preserveBoundaryWhitespace(source: string, translated: string) {
  const leading = source.match(/^\s+/u)?.[0] ?? '';
  const trailing = source.match(/\s+$/u)?.[0] ?? '';
  return `${leading}${translated.trim()}${trailing}`;
}

function createBatches(texts: string[]) {
  const batches: Array<Array<{ index: number; text: string }>> = [];
  let current: Array<{ index: number; text: string }> = [];
  let currentLength = 0;

  texts.forEach((text, index) => {
    if (!text.trim()) return;
    const itemLength = text.length + 48;
    if (current.length && currentLength + itemLength > MAX_BATCH_CHARACTERS) {
      batches.push(current);
      current = [];
      currentLength = 0;
    }
    current.push({ index, text });
    currentLength += itemLength;
  });

  if (current.length) batches.push(current);
  return batches;
}

async function translateBatch(
  batch: Array<{ index: number; text: string }>,
  sourceLanguage: keyof typeof LANGUAGE_CODES,
  targetLanguage: keyof typeof LANGUAGE_CODES,
) {
  const html = batch
    .map(({ index, text }) => (
      `<span data-kinda-id="${index}">${escapeHtml(text)}</span>`
    ))
    .join('');
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', LANGUAGE_CODES[sourceLanguage]);
  url.searchParams.set('tl', LANGUAGE_CODES[targetLanguage]);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', html);

  const proxyUrl = process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY;
  const response = await axios.get(url.toString(), {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Kinda.info/1.0)' },
    httpsAgent: proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined,
    proxy: false,
    timeout: 15_000,
  });

  const payload = response.data as [Array<[string]>];
  const translatedHtml = payload[0]?.map((segment) => segment[0] ?? '').join('') ?? '';
  const translations = new Map<number, string>();
  const sourceByIndex = new Map(batch.map((item) => [item.index, item.text]));
  const pattern = /<span data-kinda-id="(\d+)">([\s\S]*?)<\/span>/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(translatedHtml))) {
    const index = Number(match[1]);
    const source = sourceByIndex.get(index) ?? '';
    translations.set(
      index,
      preserveBoundaryWhitespace(source, decodeHtml(match[2])),
    );
  }
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
    const sourceLanguage = body.sourceLanguage as keyof typeof LANGUAGE_CODES;
    const targetLanguage = body.targetLanguage as keyof typeof LANGUAGE_CODES;
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

    const translated = [...texts];
    const batches = createBatches(texts);
    const results = [];
    for (const batch of batches) {
      const result = await translateBatch(batch, sourceLanguage, targetLanguage);
      const missing = batch.filter((item) => !result.has(item.index));
      for (const item of missing) {
        const retry = await translateBatch([item], sourceLanguage, targetLanguage);
        const value = retry.get(item.index);
        if (value !== undefined) result.set(item.index, value);
        if (!result.has(item.index)) {
          throw new Error(`Translation provider omitted segment ${item.index}`);
        }
      }
      results.push(result);
    }
    for (const result of results) {
      for (const [index, value] of result) translated[index] = value;
    }

    return NextResponse.json(
      { translations: translated, provider: 'google' },
      { headers: { 'Cache-Control': 'private, max-age=86400' } },
    );
  } catch (error) {
    console.error('Automatic translation failed', error);
    return NextResponse.json({ error: 'Translation is temporarily unavailable' }, { status: 502 });
  }
}
