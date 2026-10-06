/**
 * The hot board's data, as published by the scheduled snapshot.
 *
 * The site is a reader here. Polling happens in GitHub Actions
 * (scripts/hot-snapshot.mjs), which folds each poll into a running history
 * and commits it to the `hot-data` branch. That is what gives an event a
 * first-seen time, a poll count and a heat trail — none of which a page that
 * fetches on request could know.
 */

import { siteConfig } from '@/site.config';

export type HotSourceId = 'hackernews' | 'github' | 'juejin' | 'ithome' | 'weibo' | 'baidu';

export type HotEvent = {
  id: string;
  title: string;
  url: string;
  blurb?: string;
  tag?: string;
  sources: Array<{ id: HotSourceId; rank: number; url: string; heat?: string }>;
  firstSeen: string;
  lastSeen: string;
  /** How many polls it has survived — a cheap proxy for staying power. */
  polls: number;
  heat: number;
  previousHeat: number | null;
  peakSources: number;
};

export type HotState = {
  updatedAt: string;
  unavailable: HotSourceId[];
  events: HotEvent[];
};

/**
 * A mark per source, in that outlet's own colour.
 *
 * Only two of the six expose an image at all, and both are author avatars
 * rather than anything about the story — a maintainer's face beside a repo
 * name says nothing. A letter mark is on every row instead, which is what
 * makes the sources scannable, costs no request, and tells no third party
 * who is reading.
 */
export const HOT_SOURCE_META: Record<
  HotSourceId,
  { name: string; site: string; mark: string; colour: string }
> = {
  hackernews: { name: 'Hacker News', site: 'https://news.ycombinator.com', mark: 'Y', colour: '#FF6600' },
  github: { name: 'GitHub Trending', site: 'https://github.com/trending', mark: 'GH', colour: '#8B949E' },
  juejin: { name: '掘金', site: 'https://juejin.cn', mark: '掘', colour: '#1E80FF' },
  ithome: { name: 'IT 之家', site: 'https://www.ithome.com', mark: 'IT', colour: '#C2272D' },
  weibo: { name: '微博热搜', site: 'https://s.weibo.com/top/summary', mark: '微', colour: '#E6162D' },
  baidu: { name: '百度热搜', site: 'https://top.baidu.com/board?tab=realtime', mark: '百', colour: '#3B5BDB' },
};

const STATE_URL = `https://raw.githubusercontent.com/${siteConfig.commentsRepo}/hot-data/state.json`;

/**
 * Null when the data branch has not been written yet, or GitHub is having a
 * moment. The page says so rather than rendering an empty board as if the
 * internet had gone quiet.
 */
export async function getHotState(): Promise<HotState | null> {
  try {
    const response = await fetch(STATE_URL, {
      next: { revalidate: 600 },
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const state = (await response.json()) as HotState;
    return Array.isArray(state?.events) ? state : null;
  } catch {
    return null;
  }
}

/** Rising, steady or fading since the previous poll. */
export function trendOf(event: HotEvent): 'up' | 'down' | 'flat' | 'gone' {
  if (event.heat === 0) return 'gone';
  if (event.previousHeat === null) return 'flat';
  if (event.heat > event.previousHeat) return 'up';
  if (event.heat < event.previousHeat) return 'down';
  return 'flat';
}
