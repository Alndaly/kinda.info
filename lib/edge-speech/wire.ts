import { TRUSTED_CLIENT_TOKEN } from './gec.ts';

/**
 * Edge's read-aloud endpoint and the constants that make a request acceptable
 * to it. Everything here is protocol, not configuration.
 */
export const EDGE_SPEECH_URL =
  'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1';
export const SEC_MS_GEC_VERSION = '2-143.0.3650.75';
export const OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';

/**
 * The endpoint refuses handshakes that arrive without a User-Agent. The value
 * itself does not matter; the Edge client's own is used so nothing looks
 * unusual on their side.
 */
export const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0';

export type EdgeHeaders = Map<string, string>;

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function speechConfigMessage(timestamp: string) {
  const header = Object.entries({
    'Content-Type': 'application/json; charset=utf-8',
    Path: 'speech.config',
    'X-Timestamp': timestamp,
  })
    .map(([key, value]) => `${key}: ${value}\r\n`)
    .join('');
  const body = JSON.stringify({
    context: {
      synthesis: {
        audio: {
          metadataoptions: { sentenceBoundaryEnabled: false, wordBoundaryEnabled: false },
          outputFormat: OUTPUT_FORMAT,
        },
      },
    },
  });
  return `${header}\r\n${body}`;
}

export function speechRequestMessage(options: {
  connectionId: string;
  timestamp: string;
  text: string;
  voice: string;
  locale: string;
  rate: string;
}) {
  const header = Object.entries({
    'Content-Type': 'application/ssml+xml',
    Path: 'ssml',
    'X-RequestId': options.connectionId,
    'X-Timestamp': options.timestamp,
  })
    .map(([key, value]) => `${key}: ${value}\r\n`)
    .join('');
  const ssml =
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"` +
    ` xml:lang="${escapeXml(options.locale)}">` +
    `<voice name="${escapeXml(options.voice)}">` +
    `<prosody pitch="+0Hz" rate="${escapeXml(options.rate)}" volume="+0%">` +
    `${escapeXml(options.text)}</prosody></voice></speak>`;
  return `${header}\r\n${ssml}`;
}

function parseHeaders(value: string): EdgeHeaders {
  const headers: EdgeHeaders = new Map();
  for (const line of value.split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    headers.set(line.slice(0, separator).trim().toLowerCase(), line.slice(separator + 1).trim());
  }
  return headers;
}

/** A text frame is a header block, a blank line, then the JSON body. */
export function splitTextFrame(text: string) {
  const separator = text.search(/\r?\n\r?\n/);
  if (separator === -1) return { headers: parseHeaders(text), body: '' };
  const body = text.slice(separator).trim();
  return { headers: parseHeaders(text.slice(0, separator)), body };
}

/** A binary frame prefixes the same header block with its length. */
export function splitBinaryFrame(bytes: Uint8Array) {
  if (bytes.length < 2) {
    throw new Error('Edge speech returned a malformed binary frame');
  }
  const headerLength = (bytes[0] << 8) | bytes[1];
  if (headerLength + 2 > bytes.length) {
    throw new Error('Edge speech returned a truncated binary frame');
  }
  const headers = parseHeaders(new TextDecoder().decode(bytes.subarray(2, headerLength + 2)));
  return { headers, audio: bytes.subarray(headerLength + 2) };
}

export function speechUrl(connectionId: string, gecToken: string) {
  const params = new URLSearchParams({
    ConnectionId: connectionId,
    TrustedClientToken: TRUSTED_CLIENT_TOKEN,
    'Sec-MS-GEC': gecToken,
    'Sec-MS-GEC-Version': SEC_MS_GEC_VERSION,
  });
  return `${EDGE_SPEECH_URL}?${params}`;
}
