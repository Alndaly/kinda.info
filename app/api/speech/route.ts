import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech } from '@/lib/edge-speech';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_CHARACTERS = 24_000;
const CHUNK_CHARACTERS = 3_200;
const VOICES = {
  en: 'en-US-AriaNeural',
  zh: 'zh-CN-XiaoxiaoNeural',
} as const;

function splitForSpeech(text: string) {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[。！？.!?])\s*/)
    .filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if (current && current.length + sentence.length > CHUNK_CHARACTERS) {
      chunks.push(current);
      current = '';
    }
    if (sentence.length > CHUNK_CHARACTERS) {
      for (let index = 0; index < sentence.length; index += CHUNK_CHARACTERS) {
        const part = sentence.slice(index, index + CHUNK_CHARACTERS);
        if (current) {
          chunks.push(current);
          current = '';
        }
        chunks.push(part);
      }
    } else {
      current += sentence;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Cross-origin speech synthesis is not allowed' }, { status: 403 });
  }

  try {
    const body = await request.json() as { text?: unknown; locale?: unknown };
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const locale = body.locale === 'en' || body.locale === 'zh' ? body.locale : null;

    if (!text || !locale || text.length > MAX_CHARACTERS) {
      return NextResponse.json({ error: 'Invalid speech request' }, { status: 400 });
    }

    const audioChunks: Buffer[] = [];
    for (const chunk of splitForSpeech(text)) {
      audioChunks.push(
        await synthesizeSpeech(chunk, VOICES[locale], locale === 'en' ? 'en-US' : 'zh-CN'),
      );
    }
    const audio = Buffer.concat(audioChunks);

    return new Response(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audio.length),
        'Cache-Control': 'private, max-age=86400',
        'X-Speech-Provider': 'microsoft-edge',
      },
    });
  } catch (error) {
    console.error('Edge speech synthesis failed', error);
    return NextResponse.json({ error: 'Speech synthesis is temporarily unavailable' }, { status: 502 });
  }
}
