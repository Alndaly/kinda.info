import { createHash, randomBytes } from 'node:crypto';
import WebSocket, { type RawData } from 'ws';

const EDGE_SPEECH_URL = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1';
const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const CHROMIUM_FULL_VERSION = '143.0.3650.75';
const SEC_MS_GEC_VERSION = `2-${CHROMIUM_FULL_VERSION}`;
const OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
const INACTIVITY_TIMEOUT_MS = 30_000;
const WINDOWS_FILE_TIME_EPOCH = BigInt(11_644_473_600);

// Sec-MS-GEC v2 is CS64-SHA256 over this prefix, the rounded Windows file
// time, and Edge's trusted client token. Algorithm adapted from the MIT-licensed
// implementation at https://github.com/SchneeHertz/node-edge-tts/blob/master/src/drm.ts.
const GEC_PREFIX = Buffer.from(
  'Q29weXJpZ2h0IChDKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQu',
  'base64',
);
const GEC_COEFFICIENTS: ReadonlyArray<readonly [number, number]> = [
  [0xe82e91b1, 0xb32700d0],
  [0x44de24c6, 0x88dff51d],
  [0x3beb65bc, 0x29514038],
  [0xc89c5933, 0xb328cbdf],
  [0x8d1ec211, 0xd405b4d5],
  [0x314ef5d5, 0x26e55f3c],
  [0xe92491b1, 0x607801c6],
  [0xf0a5b9d5, 0x82b2c1fb],
  [0x06064cf3, 0xfa51a3da],
  [0xda79fa60, 0x207cc464],
  [0xbed20560, 0x3c3c74f3],
  [0x89f9c9f8, 0xd2d14b61],
  [0x35fa38c6, 0xbb04a2c1],
  [0xcb49e3c6, 0xc5626167],
];

const rotateLeft16 = (value: number) => ((value << 16) | (value >>> 16)) >>> 0;

function cs64Digest(data: Buffer, shaDigest: Buffer) {
  const keyA = (shaDigest.readUInt32LE(0) | 1) >>> 0;
  const keyB = (shaDigest.readUInt32LE(4) | 1) >>> 0;
  const factors = [
    Math.imul(keyA, 0x82893933) >>> 0,
    Math.imul(keyB, 0x82893933) >>> 0,
  ];
  const terms = GEC_COEFFICIENTS.map(([coefficient], index) =>
    Math.imul(coefficient, factors[index % 2]) >>> 0,
  );
  const offsets = GEC_COEFFICIENTS.map(([, offset]) => offset);
  const padded = Buffer.alloc(Math.ceil((data.length + 1) / 8) * 8);
  padded.set(data, 1);

  for (let index = 0; index < padded.length / 4; index += 1) {
    const word = padded.readUInt32LE(index * 4);
    let term = Math.imul(word, index % 2 === 0 ? keyA : keyB);
    let offset = Math.imul(
      rotateLeft16(word),
      index % 2 === 0 ? 0xef0569fb : 0xc31713db,
    );

    if (index === 0) {
      term = (term + Math.imul(0xf2f90b1a, factors[0])) >>> 0;
      offset = (offset + 0x0b1a0000) >>> 0;
    }
    terms.push(term >>> 0);
    offsets.push(offset >>> 0);
  }

  let swapAcc = 0;
  let swapLast = 0;
  let state = 0;
  let acc = 0;

  for (let index = 0; index < terms.length; index += 2) {
    const x = terms[index];
    const y = terms[index + 1];
    let value = rotateLeft16((offsets[index] + x) >>> 0);
    let product = Math.imul(value, 0x76f50f34);
    swapAcc += (Math.imul(rotateLeft16(product), 0xc3efea97) + product) >>> 0;

    value = rotateLeft16((offsets[index + 1] + y) >>> 0);
    product = Math.imul(value, 0x1881ce3c);
    swapLast = (Math.imul(rotateLeft16(product), 0x35bd1ec9) + product) >>> 0;
    swapAcc = (swapAcc + swapLast) >>> 0;

    state = (Math.imul(state, keyA) + x) >>> 0;
    for (const coefficient of [0xcf98b111, 0x87085b9f, 0x12ceb96d, 0x257e1d83]) {
      state = Math.imul(rotateLeft16(state), coefficient) >>> 0;
    }
    acc += state;

    value = (Math.imul(state, keyB) + y) >>> 0;
    value = Math.imul(rotateLeft16(value), 0xa27416f5) >>> 0;
    value = Math.imul(rotateLeft16(value), 0xd38396ff) >>> 0;
    state = Math.imul(
      rotateLeft16(Math.imul(rotateLeft16(value), 0x7c932b89)),
      0xbfa49f69,
    ) >>> 0;
    acc = (acc + state) >>> 0;
  }

  const result = Buffer.allocUnsafe(8);
  result.writeUInt32LE((swapLast ^ state) >>> 0, 0);
  result.writeUInt32LE((swapAcc ^ acc) >>> 0, 4);
  return result;
}

export function generateSecMsGecTokenV2(unixSeconds = Date.now() / 1000): string {
  if (!Number.isFinite(unixSeconds)) {
    throw new TypeError('unixSeconds must be a finite number');
  }

  const epochSeconds = BigInt(Math.floor(unixSeconds)) + WINDOWS_FILE_TIME_EPOCH;
  const roundedSeconds = epochSeconds - (epochSeconds % BigInt(300));
  const ticks = roundedSeconds * BigInt(10_000_000);
  const data = Buffer.from(`${ticks}${TRUSTED_CLIENT_TOKEN}`, 'ascii');
  const shaDigest = createHash('sha256').update(GEC_PREFIX).update(data).digest();
  const cs64 = cs64Digest(data, shaDigest);
  return `${cs64.toString('hex').toUpperCase()}-${shaDigest.toString('hex').toUpperCase()}`;
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function protocolMessage(headers: Record<string, string>, body: string) {
  const header = Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}\r\n`)
    .join('');
  return `${header}\r\n${body}`;
}

function parseProtocolHeaders(value: string) {
  const headers = new Map<string, string>();
  for (const line of value.split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    headers.set(line.slice(0, separator).trim().toLowerCase(), line.slice(separator + 1).trim());
  }
  return headers;
}

function toBuffer(data: RawData) {
  if (Buffer.isBuffer(data)) return data;
  if (Array.isArray(data)) return Buffer.concat(data);
  return Buffer.from(data);
}

export function synthesizeSpeech(
  text: string,
  voice: string,
  locale: string,
  rate = '-4%',
): Promise<Buffer> {
  const connectionId = randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    ConnectionId: connectionId,
    TrustedClientToken: TRUSTED_CLIENT_TOKEN,
    'Sec-MS-GEC': generateSecMsGecTokenV2(),
    'Sec-MS-GEC-Version': SEC_MS_GEC_VERSION,
  });
  const timestamp = new Date().toString();
  const config = protocolMessage(
    {
      'Content-Type': 'application/json; charset=utf-8',
      Path: 'speech.config',
      'X-Timestamp': timestamp,
    },
    JSON.stringify({
      context: {
        synthesis: {
          audio: {
            metadataoptions: { sentenceBoundaryEnabled: false, wordBoundaryEnabled: false },
            outputFormat: OUTPUT_FORMAT,
          },
        },
      },
    }),
  );
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${escapeXml(locale)}"><voice name="${escapeXml(voice)}"><prosody pitch="+0Hz" rate="${escapeXml(rate)}" volume="+0%">${escapeXml(text)}</prosody></voice></speak>`;
  const request = protocolMessage(
    {
      'Content-Type': 'application/ssml+xml',
      Path: 'ssml',
      'X-RequestId': connectionId,
      'X-Timestamp': timestamp,
    },
    ssml,
  );

  const { promise, resolve, reject } = Promise.withResolvers<Buffer>();
  const socket = new WebSocket(`${EDGE_SPEECH_URL}?${params}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'en-US,en;q=0.9',
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
      Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
      Cookie: `muid=${randomBytes(16).toString('hex').toUpperCase()};`,
    },
  });
  const audioChunks: Buffer[] = [];
  let settled = false;
  let timer: NodeJS.Timeout | undefined;

  const cleanup = () => {
    clearTimeout(timer);
    timer = undefined;
  };
  const fail = (error: Error) => {
    if (settled) return;
    settled = true;
    cleanup();
    socket.terminate();
    reject(error);
  };
  const armTimeout = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fail(new Error('Edge speech synthesis timed out'));
    }, INACTIVITY_TIMEOUT_MS);
  };

  socket.once('open', () => {
    armTimeout();
    try {
      socket.send(config);
      socket.send(request);
    } catch (error) {
      fail(error instanceof Error ? error : new Error(String(error)));
    }
  });

  socket.on('message', (data, isBinary) => {
    if (settled) return;
    armTimeout();
    const message = toBuffer(data);

    if (isBinary) {
      if (message.length < 2) {
        fail(new Error('Edge speech returned a malformed binary frame'));
        return;
      }
      const headerLength = message.readUInt16BE(0);
      if (headerLength + 2 > message.length) {
        fail(new Error('Edge speech returned a truncated binary frame'));
        return;
      }
      const headers = parseProtocolHeaders(message.subarray(2, headerLength + 2).toString('utf8'));
      if (headers.get('path') === 'audio' && message.length > headerLength + 2) {
        audioChunks.push(message.subarray(headerLength + 2));
      }
      return;
    }

    const messageText = message.toString('utf8');
    const separator = messageText.search(/\r?\n\r?\n/);
    const headerText = separator === -1 ? messageText : messageText.slice(0, separator);
    const body = separator === -1 ? '' : messageText.slice(separator).trim();
    const headers = parseProtocolHeaders(headerText);
    const path = headers.get('path') ?? '';

    if (path.includes('error')) {
      fail(new Error(`Edge speech service error${body ? `: ${body}` : ''}`));
    } else if (path === 'turn.end') {
      if (audioChunks.length === 0) {
        fail(new Error('Edge speech completed without audio data'));
        return;
      }
      settled = true;
      cleanup();
      const audio = Buffer.concat(audioChunks);
      socket.close();
      resolve(audio);
    }
  });

  socket.once('error', (error) => {
    fail(new Error(`Edge speech WebSocket error: ${error.message}`));
  });
  socket.once('close', (code, reason) => {
    if (settled) return;
    const detail = reason.length ? `: ${reason.toString()}` : '';
    fail(new Error(`Edge speech WebSocket closed before completion (${code})${detail}`));
  });
  armTimeout();
  return promise;
}
