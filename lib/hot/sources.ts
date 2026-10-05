/**
 * Hot-board source adapters.
 *
 * Every source here is keyless and public — the same constraint the rest of
 * this site runs under (Edge TTS for speech, the free endpoint for
 * translation). Nothing added here may require an account or a paid plan.
 *
 * Each adapter is responsible for its own parsing and for returning an empty
 * list rather than throwing on a shape it does not recognise: one site
 * changing its JSON must not take the page down with it.
 */

export type HotItem = {
  title: string;
  url: string;
  /** 1-based position within its own source. */
  rank: number;
  /** Already formatted for display — each site counts a different thing. */
  heat?: string;
  /** Short badge: 新 / 热 / a language tag. */
  tag?: string;
};

export type HotSourceId =
  | 'hackernews'
  | 'github'
  | 'juejin'
  | 'ithome'
  | 'weibo'
  | 'baidu';

export type HotSourceMeta = {
  id: HotSourceId;
  name: { zh: string; en: string };
  /** What this board is a ranking of, in one phrase. */
  kind: { zh: string; en: string };
  site: string;
};

export const HOT_SOURCES: HotSourceMeta[] = [
  {
    id: 'hackernews',
    name: { zh: 'Hacker News', en: 'Hacker News' },
    kind: { zh: '英文科技', en: 'Tech, in English' },
    site: 'https://news.ycombinator.com',
  },
  {
    id: 'github',
    name: { zh: 'GitHub Trending', en: 'GitHub Trending' },
    kind: { zh: '今日开源', en: 'Repos trending today' },
    site: 'https://github.com/trending',
  },
  {
    id: 'juejin',
    name: { zh: '掘金', en: 'Juejin' },
    kind: { zh: '中文开发者', en: 'Chinese developers' },
    site: 'https://juejin.cn',
  },
  {
    id: 'ithome',
    name: { zh: 'IT 之家', en: 'IThome' },
    kind: { zh: '中文科技新闻', en: 'Chinese tech news' },
    site: 'https://www.ithome.com',
  },
  {
    id: 'weibo',
    name: { zh: '微博热搜', en: 'Weibo' },
    kind: { zh: '大众实况', en: 'What China is talking about' },
    site: 'https://s.weibo.com/top/summary',
  },
  {
    id: 'baidu',
    name: { zh: '百度热搜', en: 'Baidu' },
    kind: { zh: '搜索实况', en: 'What China is searching' },
    site: 'https://top.baidu.com/board?tab=realtime',
  },
];

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/** Each source is revalidated on its own, so a slow one cannot stall the rest. */
const REVALIDATE_SECONDS = 600;
const TIMEOUT_MS = 8000;

async function load(url: string, headers: Record<string, string> = {}) {
  const response = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: '*/*', ...headers },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) throw new Error(`${url} responded ${response.status}`);
  return response;
}

/** 1653929 → 165.4万. Chinese sites count in units Western ones do not. */
function formatCount(value: number, unit = '') {
  if (!Number.isFinite(value) || value <= 0) return undefined;
  if (value >= 10_000) return `${(value / 10_000).toFixed(1)}万${unit}`;
  return `${value}${unit}`;
}

function decodeEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

function stripTags(value: string) {
  return decodeEntities(value.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
}

const LIMIT = 12;

/** Depth-first scan for every object carrying a `word`, in document order. */
function collectWords(node: unknown, found: any[] = []): any[] {
  if (Array.isArray(node)) {
    for (const child of node) collectWords(child, found);
    return found;
  }
  if (node && typeof node === 'object') {
    const row = node as Record<string, unknown>;
    if (typeof row.word === 'string' && row.word) found.push(row);
    for (const value of Object.values(row)) {
      if (value && typeof value === 'object') collectWords(value, found);
    }
  }
  return found;
}

const fetchers: Record<HotSourceId, () => Promise<HotItem[]>> = {
  async hackernews() {
    // The Algolia mirror returns the whole front page in one request; the
    // official Firebase API would need one call per story.
    const data = await (
      await load('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30')
    ).json();
    return (data.hits ?? [])
      .filter((hit: any) => hit?.title)
      .slice(0, LIMIT)
      .map((hit: any, index: number) => ({
        title: hit.title,
        // Ask HN and Show HN posts carry no outbound url.
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        rank: index + 1,
        heat: formatCount(hit.points, ' points'),
      }));
  },

  async github() {
    const html = await (await load('https://github.com/trending?since=daily')).text();
    const items: HotItem[] = [];
    // Each row is an <article class="Box-row"> whose h2 > a carries owner/repo.
    for (const block of html.split('<article class="Box-row">').slice(1)) {
      // The anchor carries a long data-hydro-click blob before its href, so
      // narrow to the heading first and look for the link inside it.
      const heading = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1];
      const repo = heading?.match(/href="\/([^"]+)"/)?.[1];
      if (!repo) continue;
      const about = block.match(/<p class="col-9[^"]*"[^>]*>([\s\S]*?)<\/p>/)?.[1];
      const language = block.match(/itemprop="programmingLanguage">([^<]+)</)?.[1];
      const stars = block.match(/([\d,]+)\s*stars today/)?.[1];
      items.push({
        title: repo.replace('/', ' / '),
        url: `https://github.com${repo.startsWith('/') ? '' : '/'}${repo}`,
        rank: items.length + 1,
        heat: stars ? `${stars} stars today` : undefined,
        tag: language?.trim(),
      });
      if (items.length >= LIMIT) break;
    }
    if (!items.length) throw new Error('GitHub trending markup did not match');
    return items;
  },

  async juejin() {
    const data = await (
      await load(
        'https://api.juejin.cn/content_api/v1/content/article_rank?category_id=1&type=hot',
      )
    ).json();
    return (data.data ?? [])
      .filter((row: any) => row?.content?.title)
      .slice(0, LIMIT)
      .map((row: any, index: number) => ({
        title: row.content.title,
        url: `https://juejin.cn/post/${row.content.content_id}`,
        rank: index + 1,
        heat: formatCount(row.content_counter?.view, ' 阅读'),
      }));
  },

  async ithome() {
    const xml = await (await load('https://www.ithome.com/rss/')).text();
    const items: HotItem[] = [];
    for (const block of xml.split('<item>').slice(1)) {
      const title = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1];
      const link = block.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/)?.[1];
      if (!title || !link) continue;
      items.push({ title: stripTags(title), url: link.trim(), rank: items.length + 1 });
      if (items.length >= LIMIT) break;
    }
    if (!items.length) throw new Error('IThome feed had no items');
    return items;
  },

  async weibo() {
    const data = await (
      await load('https://weibo.com/ajax/side/hotSearch', { Referer: 'https://weibo.com/' })
    ).json();
    return (data?.data?.realtime ?? [])
      .filter((row: any) => row?.word)
      .slice(0, LIMIT)
      .map((row: any, index: number) => ({
        title: row.word,
        url: `https://s.weibo.com/weibo?q=${encodeURIComponent(row.word_scheme || `#${row.word}#`)}`,
        rank: index + 1,
        heat: formatCount(row.num),
        tag: row.label_name || undefined,
      }));
  },

  async baidu() {
    const data = await (
      await load('https://top.baidu.com/api/board?platform=wise&tab=realtime')
    ).json();
    // Baidu nests the list two levels deep (cards[].content[].content[]) and
    // has moved it before. Collecting every node that carries a `word` keeps
    // this working through the next reshuffle.
    const rows = collectWords(data?.data);
    return rows
      .filter((row: any) => row?.word)
      .slice(0, LIMIT)
      .map((row: any, index: number) => ({
        title: row.word,
        url: row.url || `https://www.baidu.com/s?wd=${encodeURIComponent(row.word)}`,
        rank: index + 1,
        tag: row.isTop ? '置顶' : undefined,
      }));
  },
};

export type HotBoard = {
  id: HotSourceId;
  items: HotItem[];
};

export type HotSnapshot = {
  boards: HotBoard[];
  /** Sources that failed this round, so the page can say so instead of lying. */
  unavailable: HotSourceId[];
  fetchedAt: string;
};

/**
 * One source failing is normal — these are public endpoints with no contract.
 * The page renders whatever came back and names what did not.
 */
export async function getHotSnapshot(): Promise<HotSnapshot> {
  const results = await Promise.allSettled(
    HOT_SOURCES.map(async (source) => ({
      id: source.id,
      items: await fetchers[source.id](),
    })),
  );

  const boards: HotBoard[] = [];
  const unavailable: HotSourceId[] = [];

  results.forEach((result, index) => {
    const id = HOT_SOURCES[index].id;
    if (result.status === 'fulfilled' && result.value.items.length) {
      boards.push(result.value);
    } else {
      unavailable.push(id);
      if (result.status === 'rejected') {
        console.warn(`[hot] ${id} unavailable:`, result.reason?.message ?? result.reason);
      }
    }
  });

  return { boards, unavailable, fetchedAt: new Date().toISOString() };
}
