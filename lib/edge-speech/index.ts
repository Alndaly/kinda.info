import { concatBytes } from '../bytes.ts';
import { generateSecMsGecTokenV2 } from './gec.ts';
import { connectSpeechSocket, type SpeechFrame } from './socket.ts';
import {
  USER_AGENT,
  speechConfigMessage,
  speechRequestMessage,
  speechUrl,
  splitBinaryFrame,
  splitTextFrame,
} from './wire.ts';

export { generateSecMsGecTokenV2 };

/**
 * The endpoint streams audio as it synthesizes. A connection that stays silent
 * for this long has stalled and is torn down rather than held open.
 */
const INACTIVITY_TIMEOUT_MS = 30_000;

/**
 * Fails the read, rather than the whole request, when the next frame does not
 * arrive within the inactivity window.
 */
async function* withInactivityTimeout(
  frames: AsyncIterable<SpeechFrame>,
  timeoutMs: number,
): AsyncGenerator<SpeechFrame> {
  const iterator = frames[Symbol.asyncIterator]();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    while (true) {
      const next = iterator.next();
      const expired = Promise.withResolvers<never>();
      timer = setTimeout(
        () => expired.reject(new Error('Edge speech synthesis timed out')),
        timeoutMs,
      );
      const result = await Promise.race([next, expired.promise]);
      clearTimeout(timer);
      timer = undefined;
      if (result.done) return;
      yield result.value;
    }
  } finally {
    clearTimeout(timer);
    await iterator.return?.();
  }
}

export async function synthesizeSpeech(
  text: string,
  voice: string,
  locale: string,
  rate = '-4%',
): Promise<Uint8Array> {
  const connectionId = crypto.randomUUID().replaceAll('-', '');
  const timestamp = new Date().toString();
  const connection = await connectSpeechSocket(
    speechUrl(connectionId, generateSecMsGecTokenV2()),
    USER_AGENT,
  );

  const audioChunks: Uint8Array[] = [];
  try {
    connection.send(speechConfigMessage(timestamp));
    connection.send(
      speechRequestMessage({ connectionId, timestamp, text, voice, locale, rate }),
    );

    for await (const frame of withInactivityTimeout(connection.frames, INACTIVITY_TIMEOUT_MS)) {
      if (frame.kind === 'binary') {
        const { headers, audio } = splitBinaryFrame(frame.bytes);
        if (headers.get('path') === 'audio' && audio.length) audioChunks.push(audio);
        continue;
      }

      const { headers, body } = splitTextFrame(frame.text);
      const path = headers.get('path') ?? '';
      if (path.includes('error')) {
        throw new Error(`Edge speech service error${body ? `: ${body}` : ''}`);
      }
      if (path === 'turn.end') break;
    }
  } finally {
    connection.close();
  }

  if (!audioChunks.length) {
    throw new Error('Edge speech completed without audio data');
  }
  return concatBytes(audioChunks);
}
