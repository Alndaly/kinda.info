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
import {
  audioEmptyState,
  audioListRow,
  audioRemoveButton,
  audioScrollList,
  audioTrackRow,
} from '@/lib/ui-classes';
import { cn } from '@/lib/utils';

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


const sheetKicker = [
  '[&>span]:text-[0.48rem] [&>span]:font-extrabold [&>span]:uppercase',
  '[&>span]:tracking-[0.16em] [&>span]:text-accent',
].join(' ');

const sheetTabs = [
  'grid grid-cols-2 rounded-full border border-line bg-secondary/55 p-1',
  '[&_button]:flex [&_button]:h-[2.3rem] [&_button]:gap-[0.45rem] [&_button]:rounded-full',
  '[&_button]:text-[0.58rem] [&_button]:text-muted-foreground [&_button]:shadow-none',
  '[&_button[data-active=true]]:bg-ink [&_button[data-active=true]]:text-paper',
  '[&_button>svg]:h-[0.78rem] [&_button>svg]:w-[0.78rem]',
  '[&_button>span]:ml-auto [&_button>span]:font-mono [&_button>span]:text-[0.45rem]',
].join(' ');

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
        className="grid w-[min(29rem,100vw)] grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-5 p-6"
        closeLabel={labels.close}
      >
        <SheetHeader className={cn(sheetKicker, 'pr-12')}>
          <span>QUEUE / KINDA AUDIO</span>
          <SheetTitle>{view === 'queue' ? labels.queue : labels.recent}</SheetTitle>
          <SheetDescription>
            {currentTrack ? `${labels.nowPlaying} · ${currentTrack.title}` : empty}
          </SheetDescription>
        </SheetHeader>

        <div className={sheetTabs} role="tablist">
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

        <div className={cn(audioScrollList, 'flex flex-1 flex-col [&_ol]:list-none')}>
          {list.length ? (
            <ol>
              {list.map((track, index) => (
                <li className={audioListRow} key={`${view}-${track.id}-${index}`}>
                  <button
                    type="button"
                    className={cn(audioTrackRow, 'px-[0.2rem] py-[0.88rem]')}
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
                      <strong>{track.title}</strong>
                      <small>{track.artist}</small>
                    </div>
                    <Play />
                  </button>
                  {view === 'queue' ? (
                    <button
                      type="button"
                      className={audioRemoveButton}
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
            <div className={cn(audioEmptyState, 'w-full min-h-0 flex-1')}>
              {view === 'queue' ? <ListMusic /> : <Clock3 />}
              <p>{empty}</p>
            </div>
          )}
        </div>

        {list.length ? (
          <Button
            type="button"
            variant="outline"
            className="flex w-full gap-[0.45rem] rounded-full text-[0.6rem] shadow-none [&>svg]:h-[0.78rem] [&>svg]:w-[0.78rem]"
            onClick={view === 'queue' ? clearQueue : clearRecent}
          >
            <Trash2 /> {labels.clear}
          </Button>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
