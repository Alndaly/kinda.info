/**
 * Poll the hot boards and fold this poll into a running history.
 *
 * Runs from GitHub Actions on a schedule, not from the site. The site never
 * touches a source: it reads the state file this writes. That keeps the
 * sources to one caller, makes the page a pure reader, and — the point of the
 * whole exercise — gives every event a first-seen time and a rank trail,
 * which a snapshot can never have.
 *
 * Dependency-free on purpose: Node's built-in fetch, nothing to install.
 *
 *   node scripts/hot-snapshot.mjs <path-to-state.json>
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const PER_SOURCE = 12;
const TIMEOUT_MS = 15_000;
/** An event nobody has reported for this long stops being current. */
const RETAIN_HOURS = 72;
/** Hard ceiling so the file cannot grow without bound. */
const MAX_EVENTS = 400;

async function load(url, headers = {}) {
  const response = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: '*/*', ...headers },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`${response.status}`);
  return response;
}

function formatCount(value, unit = '') {
  if (!Number.isFinite(value) || value <= 0) return undefined;
  if (value >= 10_000) return `${(value / 10_000).toFixed(1)}万${unit}`;
  return `${value}${unit}`;
}

function decodeEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll('&quot;', '"').replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
}

const stripTags = (v) => decodeEntities(v.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();

/** Depth-first scan for every node carrying a `word`; Baidu moves its list. */
function collectWords(node, found = []) {
  if (Array.isArray(node)) { for (const c of node) collectWords(c, found); return found; }
  if (node && typeof node === 'object') {
    if (typeof node.word === 'string' && node.word) found.push(node);
    for (const v of Object.values(node)) if (v && typeof v === 'object') collectWords(v, found);
  }
  return found;
}

/* ---------- topic images ---------- */

/** Obvious furniture rather than the story's own picture. */
const NOT_A_PHOTO = /(logo|icon|favicon|avatar|sprite|placeholder|blank|spacer|loading)/i;

/**
 * Hosts whose images cannot be shown even when the page offers them.
 *
 * Juejin serves article images from a signed CDN that refuses any request it
 * did not sign: measured in a browser, eight of eight failed to load while
 * every other host succeeded. Storing those URLs only buys a grey box, so the
 * story is recorded without a picture instead.
 */
const UNUSABLE_IMAGE_HOST = /(byteimg\.com|byteacctimg\.com)/i;

/**
 * The picture belonging to a story, in the order the web actually provides it.
 *
 * Measured across the six boards: Hacker News and GitHub links carry og:image,
 * while Juejin and IThome publish none and only have the picture in the body.
 * Weibo and Baidu entries point at a search page and have nothing at all — so
 * roughly two thirds of events get an image and the rest must look right
 * without one.
 */
function extractImage(html, pageUrl) {
  const meta = (pattern) => html.match(pattern)?.[1];
  const tagged =
    meta(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)/i) ||
    meta(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
    meta(/<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)/i);
  if (tagged && !UNUSABLE_IMAGE_HOST.test(tagged)) return absolute(tagged, pageUrl);

  for (const match of html.matchAll(/<img[^>]+(?:data-original|data-src|src)=["']([^"']+)["']/gi)) {
    const src = match[1];
    if (!/^https?:\/\//i.test(src)) continue;
    if (NOT_A_PHOTO.test(src) || /\.svg(\?|$)/i.test(src)) continue;
    if (UNUSABLE_IMAGE_HOST.test(src)) continue;
    return src;
  }
  return undefined;
}

function absolute(src, pageUrl) {
  try { return new URL(src, pageUrl).toString(); } catch { return undefined; }
}

/** Search-result pages never carry a picture of the thing being searched. */
const IMAGELESS = new Set(['weibo', 'baidu']);
/** A ceiling so one poll cannot turn into a crawl. */
const MAX_IMAGE_LOOKUPS = 40;

async function attachImages(events) {
  const pending = events.filter(
    (event) =>
      !event.image &&
      !event.imageChecked &&
      !event.sources.every((source) => IMAGELESS.has(source.id)),
  ).slice(0, MAX_IMAGE_LOOKUPS);

  let found = 0;
  // Small batches: these are other people's servers.
  for (let i = 0; i < pending.length; i += 5) {
    await Promise.allSettled(
      pending.slice(i, i + 5).map(async (event) => {
        // Marked either way, so a story without a picture is asked once.
        event.imageChecked = true;
        try {
          const response = await fetch(event.url, {
            headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
            signal: AbortSignal.timeout(10_000),
            redirect: 'follow',
          });
          if (!response.ok) return;
          const html = (await response.text()).slice(0, 400_000);
          const image = extractImage(html, response.url || event.url);
          if (image) { event.image = image; found += 1; }
        } catch { /* a source being slow is not a failure worth recording */ }
      }),
    );
  }
  return { looked: pending.length, found };
}

export const SOURCES = [
  { id: 'hackernews', name: { zh: 'Hacker News', en: 'Hacker News' } },
  { id: 'github',     name: { zh: 'GitHub Trending', en: 'GitHub Trending' } },
  { id: 'juejin',     name: { zh: '掘金', en: 'Juejin' } },
  { id: 'ithome',     name: { zh: 'IT 之家', en: 'IThome' } },
  { id: 'weibo',      name: { zh: '微博热搜', en: 'Weibo' } },
  { id: 'baidu',      name: { zh: '百度热搜', en: 'Baidu' } },
];

const fetchers = {
  async hackernews() {
    const d = await (await load('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30')).json();
    return (d.hits ?? []).filter((h) => h?.title).slice(0, PER_SOURCE).map((h, i) => ({
      title: h.title,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      rank: i + 1,
      heat: formatCount(h.points, ' points'),
    }));
  },
  async github() {
    const html = await (await load('https://github.com/trending?since=daily')).text();
    const items = [];
    for (const block of html.split('<article class="Box-row">').slice(1)) {
      // The anchor carries a long data-hydro-click blob before its href.
      const heading = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1];
      const repo = heading?.match(/href="\/([^"]+)"/)?.[1];
      if (!repo) continue;
      const about = block.match(/<p class="col-9[^"]*"[^>]*>([\s\S]*?)<\/p>/)?.[1];
      items.push({
        title: repo.replace('/', ' / '),
        url: `https://github.com/${repo}`,
        rank: items.length + 1,
        heat: block.match(/([\d,]+)\s*stars today/)?.[1]
          ? `${block.match(/([\d,]+)\s*stars today/)[1]} stars today`
          : undefined,
        tag: block.match(/itemprop="programmingLanguage">([^<]+)</)?.[1]?.trim(),
        blurb: about ? stripTags(about).slice(0, 160) : undefined,
      });
      if (items.length >= PER_SOURCE) break;
    }
    if (!items.length) throw new Error('trending markup did not match');
    return items;
  },
  async juejin() {
    const d = await (await load('https://api.juejin.cn/content_api/v1/content/article_rank?category_id=1&type=hot')).json();
    return (d.data ?? []).filter((r) => r?.content?.title).slice(0, PER_SOURCE).map((r, i) => ({
      title: r.content.title,
      url: `https://juejin.cn/post/${r.content.content_id}`,
      rank: i + 1,
      heat: formatCount(r.content_counter?.view, ' 阅读'),
    }));
  },
  async ithome() {
    const xml = await (await load('https://www.ithome.com/rss/')).text();
    const items = [];
    for (const block of xml.split('<item>').slice(1)) {
      const title = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1];
      const link = block.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/)?.[1];
      if (!title || !link) continue;
      items.push({ title: stripTags(title), url: link.trim(), rank: items.length + 1 });
      if (items.length >= PER_SOURCE) break;
    }
    if (!items.length) throw new Error('feed had no items');
    return items;
  },
  async weibo() {
    const d = await (await load('https://weibo.com/ajax/side/hotSearch', { Referer: 'https://weibo.com/' })).json();
    return (d?.data?.realtime ?? []).filter((r) => r?.word).slice(0, PER_SOURCE).map((r, i) => ({
      title: r.word,
      url: `https://s.weibo.com/weibo?q=${encodeURIComponent(r.word_scheme || `#${r.word}#`)}`,
      rank: i + 1,
      heat: formatCount(r.num),
      tag: r.label_name || undefined,
    }));
  },
  async baidu() {
    const d = await (await load('https://top.baidu.com/api/board?platform=wise&tab=realtime')).json();
    return collectWords(d?.data).slice(0, PER_SOURCE).map((r, i) => ({
      title: r.word,
      url: r.url || `https://www.baidu.com/s?wd=${encodeURIComponent(r.word)}`,
      rank: i + 1,
      tag: r.isTop ? '置顶' : undefined,
    }));
  },
};

/* ---------- clustering ---------- */

/**
 * Shingles for similarity: CJK has no word boundaries, so headlines are
 * compared as character bigrams, Latin ones as words.
 *
 * This is deliberately plain. Two near-identical headlines merge; a genuine
 * paraphrase does not. Doing better means a model reading both, which this
 * site has no key for — so an event's source count is a floor, not a truth.
 */
function shingles(title) {
  const text = title.toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '');
  const grams = new Set();
  const latin = title.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [];
  for (const word of latin) grams.add(word);
  const cjk = text.replace(/[a-z0-9]/g, '');
  for (let i = 0; i < cjk.length - 1; i += 1) grams.add(cjk.slice(i, i + 2));
  return grams;
}

/**
 * Overlap coefficient, not Jaccard. Two outlets covering one story rarely
 * write headlines of the same length, and Jaccard punishes that difference
 * hard — measured on real pairs it needed a 0.5 cutoff and still degraded
 * fast. Dividing by the shorter set instead separates cleanly: true pairs
 * scored 0.77-1.00, unrelated ones 0.00-0.21.
 */
function similarity(a, b) {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const g of a) if (b.has(g)) shared += 1;
  return shared / Math.min(a.size, b.size);
}

/** Set between the two measured clusters, far from both. */
const SAME_EVENT = 0.6;

/* ---------- state ---------- */

const hoursBetween = (a, b) => Math.abs(new Date(a) - new Date(b)) / 36e5;

/** Rank 1 is worth most; absent from a board is worth nothing. */
const points = (rank) => Math.max(0, PER_SOURCE + 1 - rank);

async function main() {
  const statePath = process.argv[2] ?? 'hot/state.json';
  const now = new Date().toISOString();

  const settled = await Promise.allSettled(
    SOURCES.map(async (s) => ({ id: s.id, items: await fetchers[s.id]() })),
  );

  const polled = [];
  const unavailable = [];
  settled.forEach((result, i) => {
    const id = SOURCES[i].id;
    if (result.status === 'fulfilled' && result.value.items.length) {
      for (const item of result.value.items) polled.push({ ...item, source: id });
    } else {
      unavailable.push(id);
      console.warn(`[hot] ${id} unavailable: ${result.reason?.message ?? result.reason}`);
    }
  });

  if (!polled.length) {
    console.error('[hot] every source failed; leaving the state file untouched');
    process.exit(1);
  }

  // Cluster this poll across sources.
  const clusters = [];
  for (const item of polled) {
    const grams = shingles(item.title);
    const hit = clusters.find(
      (c) => c.sources.every((s) => s.source !== item.source) && similarity(c.grams, grams) >= SAME_EVENT,
    );
    if (hit) { hit.sources.push(item); if (grams.size > hit.grams.size) { hit.grams = grams; hit.title = item.title; } }
    else clusters.push({ title: item.title, grams, sources: [item] });
  }

  let previous = { events: [] };
  try { previous = JSON.parse(await readFile(statePath, 'utf8')); } catch { /* first run */ }
  const byId = new Map((previous.events ?? []).map((e) => [e.id, e]));
  const unmatched = new Set(byId.keys());

  const events = [];
  for (const cluster of clusters) {
    const best = cluster.sources.slice().sort((a, b) => a.rank - b.rank)[0];
    // Same event as something already tracked? Match on url first, then title.
    let prior = null;
    for (const id of unmatched) {
      const candidate = byId.get(id);
      const sameLink = candidate.sources.some((s) => cluster.sources.some((c) => c.url === s.url));
      if (sameLink || similarity(shingles(candidate.title), cluster.grams) >= SAME_EVENT) { prior = candidate; break; }
    }
    if (prior) unmatched.delete(prior.id);

    // Rank and reach give the intensity; polls give staying power. Without
    // the last term every board's #1 scores identically and the leaderboard
    // is a five-way tie that looks broken. Something holding near the top for
    // hours genuinely is hotter than something that just appeared there.
    const reach = cluster.sources.reduce((sum, s) => sum + points(s.rank), 0) * cluster.sources.length;
    const held = Math.min((prior?.polls ?? 0) + 1, 48);
    const heat = reach + held;

    events.push({
      id: prior?.id ?? `${Date.parse(now).toString(36)}-${events.length.toString(36)}`,
      title: cluster.title,
      url: best.url,
      blurb: cluster.sources.find((s) => s.blurb)?.blurb ?? prior?.blurb,
      tag: cluster.sources.find((s) => s.tag)?.tag,
      sources: cluster.sources.map((s) => ({ id: s.source, rank: s.rank, url: s.url, heat: s.heat })),
      // Drop anything stored before a host was known to be unusable.
      image: prior?.image && !UNUSABLE_IMAGE_HOST.test(prior.image) ? prior.image : undefined,
      imageChecked: prior?.image && UNUSABLE_IMAGE_HOST.test(prior.image)
        ? false
        : (prior?.imageChecked ?? false),
      firstSeen: prior?.firstSeen ?? now,
      lastSeen: now,
      polls: (prior?.polls ?? 0) + 1,
      heat,
      previousHeat: prior?.heat ?? null,
      peakSources: Math.max(cluster.sources.length, prior?.peakSources ?? 0),
    });
  }

  // Events that dropped off every board stay until they go stale, so the
  // timeline keeps its past rather than only ever showing the present.
  for (const id of unmatched) {
    const stale = byId.get(id);
    if (hoursBetween(now, stale.lastSeen) > RETAIN_HOURS) continue;
    const usable = stale.image && !UNUSABLE_IMAGE_HOST.test(stale.image);
    events.push({
      ...stale,
      heat: 0,
      previousHeat: stale.heat,
      // This path copies an event wholesale, so the unusable-host filter has
      // to be applied here too or old entries keep a picture that never loads.
      image: usable ? stale.image : undefined,
      imageChecked: usable ? stale.imageChecked : false,
    });
  }

  const images = await attachImages(events);

  events.sort((a, b) => new Date(b.firstSeen) - new Date(a.firstSeen));

  const state = {
    updatedAt: now,
    unavailable,
    events: events.slice(0, MAX_EVENTS),
  };

  await mkdir(dirname(statePath), { recursive: true });
  await writeFile(statePath, `${JSON.stringify(state, null, 1)}\n`);
  const fresh = events.filter((e) => e.firstSeen === now).length;
  console.log(
    `[hot] ${events.length} events (${fresh} new), ` +
    `${SOURCES.length - unavailable.length}/${SOURCES.length} sources, ` +
    `${images.found}/${images.looked} images` +
    (unavailable.length ? ` — down: ${unavailable.join(', ')}` : ''),
  );
}

main();
