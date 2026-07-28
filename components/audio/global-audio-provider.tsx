'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import { canPersistTrack, isPlayerPath, type AudioTrack } from '@/lib/audio';

type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

type GeneratedTrack = Omit<AudioTrack, 'src'> & { src?: string };

type GlobalAudioContextValue = {
  currentTrack: AudioTrack | null;
  queue: AudioTrack[];
  recent: AudioTrack[];
  status: AudioStatus;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playTrack: (track: AudioTrack) => void;
  prepareTrack: (track: GeneratedTrack, resolve: () => Promise<Blob>) => Promise<void>;
  togglePlayback: () => Promise<void>;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMuted: () => void;
  enqueue: (track: AudioTrack) => void;
  playFromQueue: (index: number) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  clearRecent: () => void;
  dismiss: () => void;
  /** Last non-player page visited in this session; null when the player was opened directly. */
  previousPath: string | null;
};

const STORAGE_KEY = 'kinda:global-audio:v2';
const GlobalAudioContext = createContext<GlobalAudioContextValue | null>(null);

type PersistedAudioState = {
  currentTrack: AudioTrack | null;
  queue: AudioTrack[];
  recent: AudioTrack[];
  volume: number;
};

function dedupeTracks(tracks: AudioTrack[]) {
  return tracks.filter(
    (track, index) => tracks.findIndex((candidate) => candidate.id === track.id) === index,
  );
}

export function GlobalAudioProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<AudioTrack | null>(null);
  const queueRef = useRef<AudioTrack[]>([]);
  const recentRef = useRef<AudioTrack[]>([]);
  const requestRef = useRef(0);
  const shouldAutoplayRef = useRef(false);
  const playbackIntentRef = useRef(false);
  const hydratedRef = useRef(false);
  const objectUrlsRef = useRef(new Set<string>());
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [queue, setQueue] = useState<AudioTrack[]>([]);
  const [recent, setRecent] = useState<AudioTrack[]>([]);
  const [status, setStatus] = useState<AudioStatus>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.72);
  const [muted, setMuted] = useState(false);
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  useEffect(() => {
    // Remember where the reader came from so the player can send them back there.
    // Kept in memory on purpose: a direct hit on /player has nothing to return to.
    if (isPlayerPath(pathname)) return;
    setPreviousPath(pathname);
  }, [pathname]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    recentRef.current = recent;
  }, [recent]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<PersistedAudioState>;
        const storedQueue = Array.isArray(parsed.queue)
          ? parsed.queue.filter(canPersistTrack)
          : [];
        const storedRecent = Array.isArray(parsed.recent)
          ? parsed.recent.filter(canPersistTrack)
          : [];
        const storedCurrent = parsed.currentTrack && canPersistTrack(parsed.currentTrack)
          ? parsed.currentTrack
          : null;
        const storedVolume = typeof parsed.volume === 'number'
          ? Math.min(1, Math.max(0, parsed.volume))
          : 0.72;

        setQueue(dedupeTracks(storedQueue));
        setRecent(dedupeTracks(storedRecent).slice(0, 12));
        setCurrentTrack(storedCurrent);
        setVolumeState(storedVolume);
        setStatus(storedCurrent ? 'paused' : 'idle');
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      hydratedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const persisted: PersistedAudioState = {
      currentTrack: currentTrack && canPersistTrack(currentTrack) ? currentTrack : null,
      queue: queue.filter(canPersistTrack),
      recent: recent.filter(canPersistTrack),
      volume,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  }, [currentTrack, queue, recent, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.src) return;

    setCurrentTime(0);
    setDuration(0);
    const autoplay = shouldAutoplayRef.current;
    audio.load();
    setStatus(autoplay ? 'loading' : 'paused');
  }, [currentTrack?.id, currentTrack?.src]);

  useEffect(() => () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const remember = useCallback((track: AudioTrack) => {
    setRecent((items) => [track, ...items.filter((item) => item.id !== track.id)].slice(0, 12));
  }, []);

  const startTrack = useCallback((track: AudioTrack) => {
    requestRef.current += 1;
    shouldAutoplayRef.current = true;
    playbackIntentRef.current = true;
    setCurrentTrack(track);
    remember(track);
  }, [remember]);

  const playTrack = useCallback((track: AudioTrack) => {
    const audio = audioRef.current;
    if (currentTrackRef.current?.id === track.id && audio) {
      if (audio.paused) {
        playbackIntentRef.current = true;
        if (audio.error) audio.load();
        void audio.play().catch(() => setStatus('error'));
      } else {
        playbackIntentRef.current = false;
        audio.pause();
      }
      return;
    }
    startTrack(track);
  }, [startTrack]);

  const prepareTrack = useCallback(async (
    track: GeneratedTrack,
    resolve: () => Promise<Blob>,
  ) => {
    const audio = audioRef.current;
    if (currentTrackRef.current?.id === track.id && currentTrackRef.current.src && audio) {
      if (audio.paused) {
        playbackIntentRef.current = true;
        await audio.play().catch(() => setStatus('error'));
      } else {
        playbackIntentRef.current = false;
        audio.pause();
      }
      return;
    }

    const requestId = ++requestRef.current;
    playbackIntentRef.current = true;
    setCurrentTrack({ ...track, src: '' });
    setCurrentTime(0);
    setDuration(0);
    setStatus('loading');

    try {
      const blob = await resolve();
      if (requestId !== requestRef.current) return;
      const src = URL.createObjectURL(blob);
      objectUrlsRef.current.add(src);
      const resolvedTrack: AudioTrack = { ...track, src, ephemeral: true };
      shouldAutoplayRef.current = true;
      setCurrentTrack(resolvedTrack);
      remember(resolvedTrack);
    } catch {
      if (requestId === requestRef.current) setStatus('error');
    }
  }, [remember]);

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrackRef.current?.src) return;
    if (audio.paused) {
      playbackIntentRef.current = true;
      await audio.play().catch(() => setStatus('error'));
    } else {
      playbackIntentRef.current = false;
      audio.pause();
    }
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time)) return;
    audio.currentTime = Math.min(Math.max(time, 0), audio.duration || time);
    setCurrentTime(audio.currentTime);
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    const normalized = Math.min(1, Math.max(0, nextVolume));
    setVolumeState(normalized);
    if (normalized > 0) setMuted(false);
  }, []);

  const toggleMuted = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  }, []);

  const enqueue = useCallback((track: AudioTrack) => {
    if (currentTrackRef.current?.id === track.id) return;
    setQueue((items) => (
      items.some((item) => item.id === track.id) ? items : [...items, track]
    ));
  }, []);

  const playFromQueue = useCallback((index: number) => {
    const track = queueRef.current[index];
    if (!track) return;
    setQueue((items) => items.filter((_, itemIndex) => itemIndex !== index));
    startTrack(track);
  }, [startTrack]);

  const removeFromQueue = useCallback((id: string) => {
    setQueue((items) => items.filter((item) => item.id !== id));
  }, []);

  const clearQueue = useCallback(() => setQueue([]), []);

  const skipNext = useCallback(() => {
    const next = queueRef.current[0];
    if (!next) {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setCurrentTime(0);
      playbackIntentRef.current = false;
      setStatus(currentTrackRef.current ? 'paused' : 'idle');
      return;
    }
    setQueue((items) => items.slice(1));
    startTrack(next);
  }, [startTrack]);

  const skipPrevious = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 5) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const previous = recentRef.current.find(
      (item) => item.id !== currentTrackRef.current?.id,
    );
    if (previous) startTrack(previous);
  }, [startTrack]);

  const clearRecent = useCallback(() => {
    setRecent((items) => items.filter((item) => item.id === currentTrackRef.current?.id));
  }, []);

  const dismiss = useCallback(() => {
    requestRef.current += 1;
    playbackIntentRef.current = false;
    audioRef.current?.pause();
    setCurrentTrack(null);
    setStatus('idle');
    setCurrentTime(0);
    setDuration(0);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrackRef.current?.src || !playbackIntentRef.current) return;
    const timeout = window.setTimeout(() => {
      if (audio.paused && playbackIntentRef.current) {
        void audio.play().catch(() => setStatus('paused'));
      }
    }, 80);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.subtitle ?? 'Kinda Audio',
      artwork: currentTrack.artwork?.map((src) => ({ src })),
    });
    navigator.mediaSession.setActionHandler('play', () => {
      playbackIntentRef.current = true;
      void audioRef.current?.play();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      playbackIntentRef.current = false;
      audioRef.current?.pause();
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (typeof details.seekTime === 'number') seek(details.seekTime);
    });
    navigator.mediaSession.setActionHandler('nexttrack', skipNext);
    navigator.mediaSession.setActionHandler('previoustrack', skipPrevious);

    return () => {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('seekto', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
    };
  }, [currentTrack, seek, skipNext, skipPrevious]);

  const value = useMemo<GlobalAudioContextValue>(() => ({
    previousPath,
    currentTrack,
    queue,
    recent,
    status,
    currentTime,
    duration,
    volume,
    muted,
    playTrack,
    prepareTrack,
    togglePlayback,
    seek,
    setVolume,
    toggleMuted,
    enqueue,
    playFromQueue,
    removeFromQueue,
    clearQueue,
    skipNext,
    skipPrevious,
    clearRecent,
    dismiss,
  }), [
    clearQueue,
    clearRecent,
    currentTime,
    currentTrack,
    dismiss,
    duration,
    enqueue,
    muted,
    playFromQueue,
    playTrack,
    prepareTrack,
    previousPath,
    queue,
    recent,
    removeFromQueue,
    seek,
    setVolume,
    skipNext,
    skipPrevious,
    status,
    toggleMuted,
    togglePlayback,
    volume,
  ]);

  return (
    <GlobalAudioContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        className="global-audio-element"
        src={currentTrack?.src || undefined}
        preload="metadata"
        muted={muted}
        onLoadedMetadata={(event) => {
          const nextDuration = event.currentTarget.duration;
          setDuration(Number.isFinite(nextDuration) ? nextDuration : 0);
        }}
        onDurationChange={(event) => {
          const nextDuration = event.currentTarget.duration;
          if (Number.isFinite(nextDuration)) setDuration(nextDuration);
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadStart={() => currentTrack?.src && setStatus('loading')}
        onCanPlay={() => {
          const audio = audioRef.current;
          if (!audio) return;
          if (shouldAutoplayRef.current) {
            shouldAutoplayRef.current = false;
            void audio.play().catch(() => setStatus('error'));
          } else if (audio.paused) {
            setStatus('paused');
          }
        }}
        onPlay={() => {
          playbackIntentRef.current = true;
          setStatus('playing');
        }}
        onPlaying={() => {
          playbackIntentRef.current = true;
          setStatus('playing');
        }}
        onPause={(event) => {
          if (!event.currentTarget.ended) setStatus((state) => state === 'error' ? state : 'paused');
        }}
        onWaiting={() => setStatus('loading')}
        onError={() => currentTrack?.src && setStatus('error')}
        onEnded={(event) => {
          if (
            currentTrackRef.current?.kind === 'bgm' &&
            queueRef.current.length === 0
          ) {
            event.currentTarget.currentTime = 0;
            playbackIntentRef.current = true;
            void event.currentTarget.play().catch(() => setStatus('paused'));
            return;
          }
          skipNext();
        }}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
      />
    </GlobalAudioContext.Provider>
  );
}

export function useGlobalAudio() {
  const context = useContext(GlobalAudioContext);
  if (!context) {
    throw new Error('useGlobalAudio must be used inside GlobalAudioProvider');
  }
  return context;
}
