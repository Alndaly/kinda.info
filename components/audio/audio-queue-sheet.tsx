'use client';

import { useState } from 'react';
import { Clock3, ListMusic, Play, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useGlobalAudio } from '@/components/audio/global-audio-provider';

export type AudioQueueSheetLabels = {
  queue: string;
  queueEmpty: string;
  clear: string;
  remove: string;
  playNow: string;
  recent: string;
  recentEmpty: string;
  nowPlaying: string;
  close: string;
};

export function AudioQueueSheet({
  open,
  onOpenChange,
  labels,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: AudioQueueSheetLabels;
}) {
  const {
    currentTrack,
    queue,
    recent,
    playFromQueue,
    playTrack,
    removeFromQueue,
    clearQueue,
    clearRecent,
  } = useGlobalAudio();
  const [view, setView] = useState<'queue' | 'recent'>('queue');
  const list = view === 'queue' ? queue : recent;
  const empty = view === 'queue' ? labels.queueEmpty : labels.recentEmpty;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="audio-queue-sheet"
        closeLabel={labels.close}
      >
        <SheetHeader className="audio-queue-sheet-header">
          <span>QUEUE / KINDA AUDIO</span>
          <SheetTitle>{view === 'queue' ? labels.queue : labels.recent}</SheetTitle>
          <SheetDescription>
            {currentTrack ? `${labels.nowPlaying} · ${currentTrack.title}` : empty}
          </SheetDescription>
        </SheetHeader>

        <div className="audio-sheet-tabs" role="tablist">
          <Button
            type="button"
            variant="ghost"
            data-active={view === 'queue'}
            onClick={() => setView('queue')}
            role="tab"
            aria-selected={view === 'queue'}
          >
            <ListMusic /> {labels.queue}
            <span>{queue.length}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            data-active={view === 'recent'}
            onClick={() => setView('recent')}
            role="tab"
            aria-selected={view === 'recent'}
          >
            <Clock3 /> {labels.recent}
            <span>{recent.length}</span>
          </Button>
        </div>

        <div className="audio-sheet-list">
          {list.length ? (
            <ol>
              {list.map((track, index) => (
                <li key={`${view}-${track.id}-${index}`}>
                  <button
                    type="button"
                    className="audio-sheet-track"
                    onClick={() => {
                      if (view === 'queue') {
                        playFromQueue(index);
                      } else {
                        playTrack(track);
                      }
                    }}
                    aria-label={`${labels.playNow}: ${track.title}`}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <strong className="min-w-0 overflow-x-clip overflow-y-visible whitespace-nowrap text-ellipsis font-[family-name:var(--font-display)] text-[0.82rem] font-[620] leading-[1.3]">
                        {track.title}
                      </strong>
                      <small>{track.artist}</small>
                    </div>
                    <Play />
                  </button>
                  {view === 'queue' ? (
                    <button
                      type="button"
                      className="audio-sheet-remove"
                      onClick={() => removeFromQueue(track.id)}
                      aria-label={`${labels.remove}: ${track.title}`}
                    >
                      <X />
                    </button>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <div className="audio-sheet-empty">
              {view === 'queue' ? <ListMusic /> : <Clock3 />}
              <p>{empty}</p>
            </div>
          )}
        </div>

        {list.length ? (
          <Button
            type="button"
            variant="outline"
            className="audio-sheet-clear"
            onClick={view === 'queue' ? clearQueue : clearRecent}
          >
            <Trash2 /> {labels.clear}
          </Button>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
