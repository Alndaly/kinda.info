import { createHash } from 'node:crypto';

/**
 * Edge's public trusted client token. Every Sec-MS-GEC token is derived from
 * it, so it is a constant of the protocol rather than a secret.
 */
export const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';

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
