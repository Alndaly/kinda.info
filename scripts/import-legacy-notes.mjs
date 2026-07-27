import { access, mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const outputRoot = path.join(projectRoot, 'content', 'notes', 'archive');
const assetRoot = path.join(projectRoot, 'public', 'images', 'archive');

const HUAQINDA_SITEMAP = 'https://huaqinda.com/sitemap.xml';
const KINDA_POSTS = 'https://kinda.info/posts';

const huaqindaSlugs = {
  'minio注意点': 'minio-presigned-upload',
  '一些前端样式的注意点': 'tailwind-line-clamp-notes',
  'react hook form注意点': 'react-hook-form-dirty-state',
  'huggingface国内访问问题': 'huggingface-china-access',
  'fastapi结合sqlalchemy技巧': 'fastapi-sqlalchemy-tips',
  'css和tailwindcss的一些注意点': 'css-tailwind-notes',
  '阿里云OSS注意点': 'aliyun-oss-notes',
  '在nextjs中使用全局状态管理': 'nextjs-global-state',
  'NextJS注意点': 'nextjs-notes',
  'Swift URL link注意点': 'swift-url-link-notes',
  'SwiftData一些注意点': 'swiftdata-notes',
  'FastAPI注意点': 'fastapi-notes',
  'shadcn ui框架使用的注意点': 'shadcn-ui-notes',
  'SwiftUI一些注意点和技巧': 'swiftui-tips',
  'Swift配合FastAPI以及NextJS做扫码登录': 'swift-fastapi-nextjs-qr-login',
  'SwiftUI APNS的一些注意点': 'swiftui-apns-notes',
  'ai图片训练的一些注意点': 'ai-image-training-notes',
  'pytorch和coreml的流程以及一些注意点': 'pytorch-coreml-workflow',
  'Swift开发注意点': 'swift-development-notes',
  '如何开发自定义节点': 'comfyui-custom-node-development',
  'ComfyUI Tips': 'comfyui-tips',
  'Faiss的使用': 'faiss-guide',
  'Swift的CoreLocation在国内存在定位偏差': 'swift-corelocation-china-offset',
  '在ollama中创建可以本地跑起来的llama-chinese模型': 'ollama-llama-chinese',
  'ComfyUI生图控制——ControlNet篇': 'comfyui-controlnet',
  'lora模型训练': 'lora-training-macos',
  '如何解决comfyui中工作流乱七八糟难以看清的问题': 'comfyui-anything-everywhere',
  '语音转文字': 'whisper-cpp-guide',
  '视频加字幕': 'video-subtitles-whisper-ffmpeg',
  'Sample采样器': 'stable-diffusion-samplers',
};

const kindaSlugs = JSON.parse(
  await readFile(path.join(projectRoot, 'lib', 'legacy-post-slugs.json'), 'utf8'),
);
const legacyEditorial = JSON.parse(
  await readFile(path.join(projectRoot, 'scripts', 'legacy-editorial.json'), 'utf8'),
);

const duplicateTitles = new Set(['neo4j', 'neo4j介绍以及基本操作']);

const normalizedTags = {
  ai: 'AI',
  人工智能: 'AI',
  nextjs: 'Next.js',
  comfyui: 'ComfyUI',
  css: 'CSS',
  oss: 'OSS',
  llm: 'LLM',
  llama: 'Llama',
  painting: 'AI 绘画',
  swift: 'Swift',
  Swift开发: 'Swift',
  swiftdata: 'SwiftData',
  lora: 'LoRA',
  pytorch: 'PyTorch',
  coreml: 'Core ML',
  UI框架: 'UI',
  旅游: '旅行',
  '实用教程': '教程',
  '必看精选': '精选',
};

const nonTopicTags = new Set(['归档', '精选', '推荐', '热门文章']);

async function fetchText(url) {
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'kinda.info content migration',
        },
        signal: AbortSignal.timeout(20_000),
      });

      if (!response.ok) {
        throw new Error(`Unable to fetch ${url}: ${response.status}`);
      }

      return response.text();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function decodeHtml(value = '') {
  const entities = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (_, entity) => {
    if (entity.startsWith('#x')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }
    if (entity.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }
    return entities[entity.toLowerCase()] ?? `&${entity};`;
  });
}

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`${name}=(?:"([^"]*)"|'([^']*)')`, 'i'));
  return decodeHtml(match?.[1] ?? match?.[2] ?? '');
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function normalizeDate(value) {
  const match = String(value ?? '').match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return '2024-01-01';
  return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
}

function polishLegacyBody(body) {
  const replacements = [
    [
      '即：即然选择了预签名方式，那么就不要再请求头中带有任何Token相关信息。',
      '既然选择了预签名方式，就不要再在请求头中携带任何 Token 认证信息。',
    ],
    [
      '在使用tailwincss的项目中，使用`flex-1`嵌套的子元素当高度超过父元素的时候`overflow-auto`不再生效。',
      '在 Tailwind CSS 项目中，如果 `flex-1` 子元素的内容高度超过父元素，`overflow-auto` 可能不会按预期生效。',
    ],
    [
      '当你提交完成后，修改过后的字段中的isDirty属性依然是true，此时需要通过如下操作来使其变为fasle',
      '保存完成后，如果修改过的字段仍然保持 `isDirty: true`，可以在保留当前值的同时重置表单状态：',
    ],
    [
      '本文档基本是按照这篇文章翻译过来的，原文[samplers](https://stable-diffusion-art.com/samplers/)，感谢。',
      '本文整理并翻译自 [Stable Diffusion Samplers](https://stable-diffusion-art.com/samplers/)，在原文基础上补充了个人使用时的判断。',
    ],
    [
      '> 注意，本文档只针对m系列芯片的macbook用户。',
      '> [!NOTE]\n> 本文面向 Apple 芯片（M 系列）的 Mac。',
    ],
    ['## flex-1和overflow-auto一起时无法生效', '## `flex-1` 与 `overflow-auto` 同时使用时滚动失效'],
    ['## InstantID使用', '## InstantID 使用'],
    ['## MacOS14.4中 `torchvision` 的适配问题', '## macOS 14.4 中 `torchvision` 的兼容问题'],
    ['## Inpainting Model技巧', '## Inpainting Model 技巧'],
    ['## Ipadapter应用', '## IP-Adapter 应用'],
    ['## SQLAlchemy 可选筛选条件\n\n## 可选筛选条件', '## SQLAlchemy 可选筛选条件'],
  ];

  return replacements.reduce(
    (result, [before, after]) => result.replaceAll(before, after),
    body,
  );
}

function normalizeTags(tags) {
  return [
    ...new Set(
      tags
        .map((tag) => normalizedTags[tag] ?? tag)
        .filter((tag) => !nonTopicTags.has(tag)),
    ),
  ];
}

function languageName(value = '') {
  const normalized = String(value).trim().toLowerCase();
  const aliases = {
    'c++': 'cpp',
    'plain text': 'text',
    'shell': 'bash',
    'typescript': 'typescript',
    'web assembly': 'wasm',
  };
  return aliases[normalized] ?? normalized.replace(/[^a-z0-9_+-]/g, '');
}

function codeFence(source, language = '') {
  const longest = Math.max(0, ...[...source.matchAll(/`+/g)].map((match) => match[0].length));
  const fence = '`'.repeat(Math.max(3, longest + 1));
  return `${fence}${languageName(language)}\n${source.trimEnd()}\n${fence}`;
}

function renderRichText(parts = []) {
  return parts
    .map((part) => {
      if (!Array.isArray(part)) return '';
      let text = String(part[0] ?? '');
      const decorations = Array.isArray(part[1]) ? part[1] : [];

      for (const decoration of decorations) {
        if (!Array.isArray(decoration)) continue;
        const [kind, value] = decoration;

        if (kind === 'd' && value?.start_date) {
          text = value.start_date;
        } else if (kind === 'lm' && value?.href) {
          text = `[${value.title || value.href}](${value.href})`;
        } else if (kind === 'a' && value) {
          text = `[${text}](${value})`;
        } else if (kind === 'b') {
          text = `**${text}**`;
        } else if (kind === 'i') {
          text = `*${text}*`;
        } else if (kind === 's') {
          text = `~~${text}~~`;
        } else if (kind === 'c') {
          text = `\`${text.replaceAll('`', '\\`')}\``;
        }
      }

      return text;
    })
    .join('');
}

function propertyText(block, key = 'title') {
  return renderRichText(block?.properties?.[key] ?? []);
}

function plainPropertyText(block, key = 'title') {
  return (block?.properties?.[key] ?? [])
    .map((part) => {
      if (!Array.isArray(part)) return '';
      const date = part[1]?.find?.((decoration) => decoration?.[0] === 'd')?.[1];
      const linkMention = part[1]?.find?.((decoration) => decoration?.[0] === 'lm')?.[1];
      if (date?.start_date) return date.start_date;
      if (linkMention?.title) return linkMention.title;
      return String(part[0] ?? '');
    })
    .join('');
}

function blockValue(post, id) {
  return post.blockMap?.block?.[id]?.value;
}

function extensionForContentType(contentType = '') {
  if (contentType.includes('gif')) return 'gif';
  if (contentType.includes('jpeg')) return 'jpg';
  if (contentType.includes('svg')) return 'svg';
  if (contentType.includes('webp')) return 'webp';
  return 'png';
}

async function saveRemoteImage(url, folder, basename) {
  const directory = path.join(assetRoot, folder);
  for (const extension of ['png', 'jpg', 'gif', 'webp', 'svg']) {
    try {
      await access(path.join(directory, `${basename}.${extension}`));
      return `/images/archive/${folder}/${basename}.${extension}`;
    } catch {
      // Continue until a previously downloaded variant is found.
    }
  }

  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) {
    throw new Error(`Unable to download image ${url}: ${response.status}`);
  }
  const extension = extensionForContentType(response.headers.get('content-type') ?? '');
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, `${basename}.${extension}`),
    Buffer.from(await response.arrayBuffer()),
  );
  return `/images/archive/${folder}/${basename}.${extension}`;
}

async function localizeNotionImages(post, slug) {
  const localUrls = {};
  const blocks = Object.values(post.blockMap?.block ?? {}).map((item) => item.value);

  for (const block of blocks) {
    if (block.type !== 'image') continue;
    const source = plainPropertyText(block, 'source') || block.format?.display_source || '';
    if (!source.includes('prod-files-secure.s3')) continue;
    const signedUrl = post.blockMap?.signed_urls?.[block.id];
    if (!signedUrl) {
      throw new Error(`Missing signed image URL for "${post.title}" (${block.id})`);
    }
    localUrls[block.id] = await saveRemoteImage(
      signedUrl,
      `huaqinda/${slug}`,
      block.id,
    );
  }

  post.localImageUrls = localUrls;
}

function renderNotionChildren(post, ids = [], depth = 0) {
  const chunks = [];

  for (const id of ids) {
    const block = blockValue(post, id);
    if (!block) continue;
    const rendered = renderNotionBlock(post, block, depth).trim();
    if (!rendered) continue;

    const previous = chunks.at(-1);
    const isList = block.type === 'bulleted_list' || block.type === 'numbered_list';
    const separator = previous?.isList && isList ? '\n' : '\n\n';
    chunks.push({ content: `${chunks.length ? separator : ''}${rendered}`, isList });
  }

  return chunks.map((chunk) => chunk.content).join('');
}

function renderTable(post, block) {
  const columns = block.format?.table_block_column_order ?? [];
  const rows = (block.content ?? [])
    .map((id) => blockValue(post, id))
    .filter(Boolean)
    .map((row) =>
      columns.map((column) =>
        plainPropertyText(row, column).replaceAll('|', '\\|').replace(/\s+/g, ' ').trim(),
      ),
    );

  if (!rows.length || !columns.length) return '';
  const header = rows[0];
  const body = rows.slice(1);
  return [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...body.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n');
}

function renderNotionBlock(post, block, depth = 0) {
  const text = propertyText(block);
  const children = block.content?.length
    ? renderNotionChildren(post, block.content, depth + 1)
    : '';

  switch (block.type) {
    case 'text':
      return [text, children].filter(Boolean).join('\n\n');
    case 'header':
      return `## ${text}`;
    case 'sub_header':
      return `### ${text}`;
    case 'sub_sub_header':
      return `#### ${text}`;
    case 'bulleted_list': {
      const nested = children
        ? `\n${children
            .split('\n')
            .map((line) => `  ${line}`)
            .join('\n')}`
        : '';
      return `${'  '.repeat(depth)}- ${text}${nested}`;
    }
    case 'numbered_list': {
      const nested = children
        ? `\n${children
            .split('\n')
            .map((line) => `  ${line}`)
            .join('\n')}`
        : '';
      return `${'  '.repeat(depth)}1. ${text}${nested}`;
    }
    case 'quote':
      return text
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
    case 'callout': {
      const icon = block.format?.page_icon;
      const type = icon === '⚠️' ? 'WARNING' : icon === '❗' ? 'IMPORTANT' : 'TIP';
      const body = [text, children].filter(Boolean).join('\n\n');
      return `> [!${type}]\n${body
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')}`;
    }
    case 'code':
      return codeFence(
        plainPropertyText(block),
        plainPropertyText(block, 'language') || block.format?.code_language,
      );
    case 'equation':
      return `\\[\n${plainPropertyText(block)}\n\\]`;
    case 'divider':
      return '---';
    case 'image': {
      const source =
        post.localImageUrls?.[block.id] ||
        plainPropertyText(block, 'source') ||
        block.format?.display_source ||
        post.blockMap?.signed_urls?.[block.id];
      if (!source) return '';
      const caption = plainPropertyText(block, 'caption') || '文章配图';
      return `![${caption.replaceAll(']', '\\]')}](${source})`;
    }
    case 'table':
      return renderTable(post, block);
    case 'table_row':
      return '';
    case 'column_list':
    case 'column':
      return children;
    case 'bookmark':
    case 'embed':
    case 'gist':
    case 'video': {
      const source =
        plainPropertyText(block, 'link') ||
        plainPropertyText(block, 'source') ||
        block.format?.display_source;
      const label = plainPropertyText(block, 'title') || source;
      return source ? `[${label}](${source})` : children;
    }
    default:
      return children;
  }
}

function htmlToMarkdown(html) {
  const tokens = html.match(/<!--[\s\S]*?-->|<\/?[a-z][^>]*>|[^<]+/gi) ?? [];
  const output = [];
  const stack = [];
  let inPre = false;

  const append = (value) => output.push(value);
  const newline = () => {
    if (!output.length || output.at(-1)?.endsWith('\n\n')) return;
    append('\n\n');
  };

  for (const token of tokens) {
    if (token.startsWith('<!--')) continue;

    if (!token.startsWith('<')) {
      const decoded = decodeHtml(token);
      append(inPre ? decoded : decoded.replace(/\s+/g, ' '));
      continue;
    }

    const closing = /^<\//.test(token);
    const tag = token.match(/^<\/?([a-z0-9]+)/i)?.[1]?.toLowerCase();
    if (!tag) continue;

    if (closing) {
      let item;
      while (stack.length) {
        item = stack.pop();
        if (item.close) append(item.close);
        if (item.tag === tag) break;
      }
      if (tag === 'pre') inPre = false;
      if (['p', 'div', 'section', 'article', 'picture', 'blockquote', 'li', 'tr'].includes(tag)) {
        newline();
      }
      continue;
    }

    const selfClosing = /\/>$/.test(token) || ['br', 'hr', 'img', 'meta', 'input'].includes(tag);
    let close = '';

    if (/^h[1-6]$/.test(tag)) {
      newline();
      append(`${'#'.repeat(Number(tag[1]))} `);
      close = '\n\n';
    } else if (['p', 'div', 'section', 'article', 'picture'].includes(tag)) {
      newline();
    } else if (tag === 'br') {
      append('\n');
    } else if (tag === 'hr') {
      newline();
      append('---');
      newline();
    } else if (tag === 'strong' || tag === 'b') {
      append('**');
      close = '**';
    } else if (tag === 'em' || tag === 'i') {
      append('*');
      close = '*';
    } else if (tag === 's' || tag === 'del') {
      append('~~');
      close = '~~';
    } else if (tag === 'a') {
      const href = getAttribute(token, 'href');
      append('[');
      close = `](${href.startsWith('/') ? `https://kinda.info${href}` : href})`;
    } else if (tag === 'img') {
      const source = getAttribute(token, 'src');
      const alt = getAttribute(token, 'alt') || '文章配图';
      if (source) append(`![${alt.replaceAll(']', '\\]')}](${source})`);
    } else if (tag === 'figcaption') {
      append('\n\n_');
      close = '_';
    } else if (tag === 'blockquote') {
      newline();
      append('> ');
      close = '\n\n';
    } else if (tag === 'li') {
      newline();
      append('- ');
      close = '\n';
    } else if (tag === 'pre') {
      newline();
      const className = getAttribute(token, 'class');
      const language = className.match(/language-([\w+-]+)/)?.[1] ?? '';
      append(`\`\`\`${language}\n`);
      close = '\n```\n\n';
      inPre = true;
    } else if (tag === 'code' && !inPre) {
      append('`');
      close = '`';
    } else if (tag === 'table') {
      newline();
    } else if (tag === 'tr') {
      append('| ');
      close = '\n';
    } else if (tag === 'td' || tag === 'th') {
      close = ' | ';
    }

    if (!selfClosing) stack.push({ tag, close });
  }

  return normalizeMarkdown(output.join(''));
}

function normalizeMarkdown(markdown) {
  return markdown
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s*#\s+[^\n]+\n+/, '')
    .replace(/\[(?:#|CC BY-NC-SA)[^\]]*\]\([^)]*\)\s*$/i, '')
    .trim();
}

function plainText(markdown) {
  return decodeHtml(markdown)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~`|\\[\]-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function summaryFrom(markdown, fallback = '') {
  const source =
    fallback && fallback !== '该页面莫得描述'
      ? fallback
      : plainText(markdown).replace(/^!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\s+/i, '');
  return source.length > 150 ? `${source.slice(0, 147).trim()}…` : source;
}

async function localizeMarkdownImages(markdown, folder) {
  const matches = [
    ...markdown.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g),
  ].filter((match) => match[1].includes('prod-files-secure.s3'));
  let localized = markdown;

  for (const [index, match] of matches.entries()) {
    const localUrl = await saveRemoteImage(match[1], folder, `image-${index + 1}`);
    localized = localized.replaceAll(match[1], localUrl);
  }

  return localized;
}

function renderFrontmatter(note) {
  const frontmatter = [
    '---',
    `slug: ${yamlString(note.slug)}`,
    'locale: zh',
    'type: note',
    `title: ${yamlString(note.title)}`,
    `eyebrow: ${yamlString(note.eyebrow)}`,
    `summary: ${yamlString(note.summary)}`,
    `date: ${note.date}`,
    note.updated && note.updated !== note.date ? `updated: ${note.updated}` : '',
    ...(note.tags.length
      ? ['tags:', ...note.tags.map((tag) => `  - ${yamlString(tag)}`)]
      : ['tags: []']),
    `source: ${yamlString(note.source)}`,
    'featured: false',
    '---',
  ]
    .filter((line) => line !== '')
    .join('\n');

  return `${frontmatter}\n\n${note.body.trim()}\n`;
}

function extractNextPost(html) {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!match) return undefined;
  const pageProps = JSON.parse(match[1]).props?.pageProps;
  return pageProps?.post ?? pageProps?.data?.post;
}

function extractMeta(html, attribute, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const tag = tags.find((item) => getAttribute(item, attribute) === value);
  return tag ? getAttribute(tag, 'content') : '';
}

async function importHuaqinda() {
  const sitemap = await fetchText(HUAQINDA_SITEMAP);
  const urls = [
    ...sitemap.matchAll(/<loc>(https:\/\/huaqinda\.com\/article\/[^<]+)<\/loc>/g),
  ].map((match) => match[1]);
  const notes = [];

  for (const source of urls) {
    const post = extractNextPost(await fetchText(source));
    if (!post || duplicateTitles.has(post.title)) continue;

    const slug = huaqindaSlugs[post.title];
    if (!slug) throw new Error(`Missing huaqinda slug for "${post.title}"`);

    await localizeNotionImages(post, slug);
    const body = normalizeMarkdown(renderNotionChildren(post, post.content));
    notes.push({
      slug,
      title: post.title,
      eyebrow: '历史笔记 · HUAQINDA',
      summary: summaryFrom(body, post.summary ?? post.ext?.summary),
      date: normalizeDate(post.publishDay),
      updated: normalizeDate(post.lastEditedDay),
      tags: normalizeTags(post.tags ?? []),
      source,
      body,
    });
  }

  return notes;
}

function extractArticle(html) {
  const match = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  return match?.[1] ?? '';
}

function cleanKindaArticle(article) {
  return article
    .replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i, '')
    .replace(/<p class="text-sm text-zinc-500[^"]*">[\s\S]*?<\/p>/i, '')
    .replace(/<div class="rounded ring-1[^"]*">[\s\S]*?<\/div>/i, '')
    .replace(/<div class="flex flex-row gap-2 py-2">[\s\S]*?<\/div>/i, '')
    .replace(
      /<a class="no-underline"[^>]*href="https:\/\/creativecommons\.org\/licenses\/by-nc-sa\/4\.0\/"[^>]*>[\s\S]*?<\/a>/i,
      '',
    )
    .replace(/<div id="comments"><\/div>/i, '')
    .replace(/^\s*<hr\s*\/?>/i, '');
}

function dateFromEnglishLabel(label) {
  const months = {
    January: '01',
    February: '02',
    March: '03',
    April: '04',
    May: '05',
    June: '06',
    July: '07',
    August: '08',
    September: '09',
    October: '10',
    November: '11',
    December: '12',
  };
  const match = label.match(
    /(?:[A-Z][a-z]+,\s+)?([A-Z][a-z]+)\s+(\d{1,2}),\s+(\d{4})/,
  );
  if (!match || !months[match[1]]) return undefined;
  return `${match[3]}-${months[match[1]]}-${match[2].padStart(2, '0')}`;
}

async function importKinda() {
  const indexHtml = await fetchText(KINDA_POSTS);
  const ids = [
    ...new Set(
      [...indexHtml.matchAll(/href="\/post\/([^"]+)"/g)].map((match) => match[1]),
    ),
  ];
  const notes = [];

  for (const id of ids) {
    const source = `https://kinda.info/post/${id}`;
    const html = await fetchText(source);
    const article = extractArticle(html);
    const title = decodeHtml(article.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '')
      .replace(/<[^>]+>/g, '')
      .trim();
    if (!title || duplicateTitles.has(title)) continue;

    const slug = kindaSlugs[id];
    if (!slug) throw new Error(`Missing kinda.info slug for "${title}" (${id})`);

    const updatedLabel = decodeHtml(
      article.match(/上次更新:[\s\S]*?([A-Z][a-z]+,\s+[A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i)?.[1] ??
        '',
    );
    const date = dateFromEnglishLabel(updatedLabel) ?? '2024-01-01';
    const summary = extractMeta(html, 'property', 'og:description');
    const tags = [
      ...new Set(
        [...article.matchAll(/href="\/tag\/([^"]+)"/g)].map((match) =>
          decodeURIComponent(match[1]),
        ),
      ),
    ];
    const body = await localizeMarkdownImages(
      htmlToMarkdown(cleanKindaArticle(article)),
      `kinda-info/${slug}`,
    );

    notes.push({
      slug,
      title,
      eyebrow: '历史笔记 · KINDA.INFO',
      summary: summaryFrom(body, summary),
      date,
      updated: date,
      tags: normalizeTags(tags),
      source,
      body,
    });
  }

  return notes;
}

async function applyEditorial(notes) {
  const bySlug = new Map(notes.map((note) => [note.slug, note]));

  for (const note of notes) {
    const override = legacyEditorial.entries[note.slug];
    if (!override) continue;

    if (override.title) note.title = override.title;
    if (override.summary) note.summary = override.summary;
    if (override.bodyFile) {
      note.body = (
        await readFile(path.join(projectRoot, override.bodyFile), 'utf8')
      ).trim();
    }
  }

  for (const merge of legacyEditorial.merges) {
    const source = bySlug.get(merge.from);
    const target = bySlug.get(merge.into);
    if (!source && !target) continue;
    if (!source || !target) {
      throw new Error(`Unable to merge "${merge.from}" into "${merge.into}"`);
    }

    if (merge.includeBody !== false) {
      target.body = [
        target.body.trim(),
        '---',
        `## ${merge.heading}`,
        source.body.trim(),
        `> 历史来源：[查看合并前的原始笔记](${source.source})`,
      ].join('\n\n');
    }

    target.tags = [...new Set([...target.tags, ...source.tags])];
    const targetUpdated = target.updated ?? target.date;
    const sourceUpdated = source.updated ?? source.date;
    target.updated =
      new Date(targetUpdated) > new Date(sourceUpdated) ? targetUpdated : sourceUpdated;
    bySlug.delete(source.slug);
  }

  return [...bySlug.values()].map((note) => ({
    ...note,
    body: polishLegacyBody(note.body),
    tags: normalizeTags(note.tags),
  }));
}

async function writeNotes(folder, notes) {
  const directory = path.join(outputRoot, folder);
  await mkdir(directory, { recursive: true });
  const staleFiles = (await readdir(directory)).filter((file) => file.endsWith('.mdx'));
  await Promise.all(staleFiles.map((file) => unlink(path.join(directory, file))));

  for (const note of notes) {
    if (!note.body) throw new Error(`Empty article body for "${note.title}"`);
    await writeFile(path.join(directory, `${note.slug}.mdx`), renderFrontmatter(note));
  }
}

const [importedHuaqindaNotes, importedKindaNotes] = await Promise.all([
  importHuaqinda(),
  importKinda(),
]);
const [huaqindaNotes, kindaNotes] = await Promise.all([
  applyEditorial(importedHuaqindaNotes),
  applyEditorial(importedKindaNotes),
]);
await writeNotes('huaqinda', huaqindaNotes);
await writeNotes('kinda-info', kindaNotes);

console.log(
  `Published ${huaqindaNotes.length} edited huaqinda.com notes and ${kindaNotes.length} edited kinda.info notes.`,
);
