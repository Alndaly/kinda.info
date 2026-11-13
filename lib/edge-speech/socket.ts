/**
 * Edge TTS speaks WebSocket, and the two runtimes this site runs on open one
 * differently:
 *
 * - workerd has no TCP sockets. A connection is opened with a `fetch` carrying
 *   `Upgrade: websocket`; the socket comes back already open (no `open` event),
 *   accepts messages immediately, and delivers binary frames as `Blob`s.
 * - Node — the dev server and `pnpm test` — has to go through the `ws` package,
 *   the only client that lets us send the User-Agent the endpoint demands.
 *
 * The runtime is chosen once, from a global only workerd defines, so the `ws`
 * branch is never reached (and never loaded) on Cloudflare.
 */

export type SpeechFrame =
  | { kind: 'text'; text: string }
  | { kind: 'binary'; bytes: Uint8Array };

export type SpeechConnection = {
  send(message: string): void;
  close(): void;
  /** Frames in arrival order. Ends when the server closes the connection. */
  frames: AsyncIterable<SpeechFrame>;
};

/**
 * The workerd `fetch`-upgrade socket. DOM's `WebSocket` lacks `accept()` and
 * `@cloudflare/workers-types` cannot be pulled into this app without fighting
 * the DOM lib, so only the members used here are described.
 */
type UpgradeSocketEvents = {
  message: { data: unknown };
  close: { code: number; reason: string };
  error: unknown;
};

type UpgradeSocket = {
  accept(): void;
  send(message: string): void;
  close(code?: number, reason?: string): void;
  addEventListener<Type extends keyof UpgradeSocketEvents>(
    type: Type,
    listener: (event: UpgradeSocketEvents[Type]) => void,
  ): void;
};

type FrameQueue = AsyncIterable<SpeechFrame> & {
  push(frame: SpeechFrame): void;
  fail(error: Error): void;
  end(): void;
};

/**
 * Frames can arrive before the consumer reaches them, so they are buffered
 * until read. `fail` surfaces a transport error at the point the caller is
 * waiting, instead of swallowing it the way a socket callback would.
 */
function createFrameQueue(): FrameQueue {
  const pending: SpeechFrame[] = [];
  let failure: Error | undefined;
  let ended = false;
  let wake: (() => void) | undefined;

  const settle = () => {
    const resume = wake;
    wake = undefined;
    resume?.();
  };

  return {
    push(frame) {
      pending.push(frame);
      settle();
    },
    fail(error) {
      failure ??= error;
      ended = true;
      settle();
    },
    end() {
      ended = true;
      settle();
    },
    async *[Symbol.asyncIterator]() {
      while (true) {
        const frame = pending.shift();
        if (frame) {
          yield frame;
          continue;
        }
        if (failure) throw failure;
        if (ended) return;
        const { promise, resolve } = Promise.withResolvers<void>();
        wake = resolve;
        await promise;
      }
    },
  };
}

function closeError(code: number, reason: string) {
  const detail = reason.length ? `: ${reason}` : '';
  return new Error(`Edge speech connection closed before completion (${code})${detail}`);
}

async function connectInWorkers(url: string, userAgent: string): Promise<SpeechConnection> {
  const response = await fetch(url.replace(/^wss:/, 'https:'), {
    headers: { Upgrade: 'websocket', 'User-Agent': userAgent },
  });
  const socket = (response as Response & { webSocket?: UpgradeSocket }).webSocket;
  if (!socket) {
    throw new Error(`Edge speech handshake failed (${response.status})`);
  }

  const queue = createFrameQueue();
  socket.accept();

  // Binary frames arrive as Blobs, so decoding awaits. Chaining the handler
  // keeps audio chunks in arrival order, which a concurrent await would lose.
  let decoding = Promise.resolve();
  socket.addEventListener('message', (event) => {
    const data = event.data;
    if (typeof data === 'string') {
      decoding = decoding.then(() => queue.push({ kind: 'text', text: data }));
      return;
    }
    decoding = decoding.then(async () => {
      const bytes = data instanceof Blob
        ? new Uint8Array(await data.arrayBuffer())
        : new Uint8Array(data as ArrayBuffer);
      queue.push({ kind: 'binary', bytes });
    });
  });
  socket.addEventListener('close', (event) => queue.fail(closeError(event.code, event.reason)));
  socket.addEventListener('error', () => queue.fail(new Error('Edge speech WebSocket error')));

  return {
    send: (message) => socket.send(message),
    close: () => socket.close(),
    frames: queue,
  };
}

async function connectInNode(url: string, userAgent: string): Promise<SpeechConnection> {
  // Static import would pull `ws` into the workerd bundle, where it cannot load.
  const { default: WebSocket } = await import('ws');

  const socket = new WebSocket(url, { headers: { 'User-Agent': userAgent } });
  const handshake = Promise.withResolvers<void>();
  socket.once('open', () => handshake.resolve());
  socket.once('unexpected-response', (_request, response) => {
    handshake.reject(new Error(`Edge speech handshake failed (${response.statusCode})`));
  });
  socket.once('error', handshake.reject);
  await handshake.promise;

  const queue = createFrameQueue();
  socket.on('message', (data, isBinary) => {
    if (isBinary) {
      queue.push({ kind: 'binary', bytes: toBytes(data) });
      return;
    }
    queue.push({ kind: 'text', text: Buffer.concat(asBuffers(data)).toString('utf8') });
  });
  socket.on('close', (code, reason) => queue.fail(closeError(code, reason.toString())));

  return {
    send: (message) => socket.send(message),
    close: () => socket.close(),
    frames: queue,
  };
}

type RawData = string | Buffer | Buffer[] | ArrayBuffer;

function asBuffers(data: RawData): Buffer[] {
  if (Array.isArray(data)) return data;
  return [typeof data === 'string' ? Buffer.from(data) : Buffer.from(data as ArrayBuffer)];
}

function toBytes(data: RawData): Uint8Array {
  if (typeof data === 'string') return new TextEncoder().encode(data);
  const buffers = asBuffers(data);
  if (buffers.length === 1) return new Uint8Array(buffers[0]);
  return new Uint8Array(Buffer.concat(buffers));
}

export function connectSpeechSocket(url: string, userAgent: string): Promise<SpeechConnection> {
  return 'WebSocketPair' in globalThis
    ? connectInWorkers(url, userAgent)
    : connectInNode(url, userAgent);
}
