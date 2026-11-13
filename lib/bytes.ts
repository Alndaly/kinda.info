/**
 * Byte chunks arrive from streamed sources and have to be handed to a Response
 * as one buffer. `Buffer.concat` would tie callers to Node.
 */
export function concatBytes(chunks: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const joined = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.length;
  }
  return joined;
}
