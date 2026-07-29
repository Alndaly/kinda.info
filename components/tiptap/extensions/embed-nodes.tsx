'use client';

import { mergeAttributes, Node } from '@tiptap/core';
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from '@tiptap/react';
import { Download, FileText, MapPin } from 'lucide-react';
import { AudioPlayer } from '@/components/tiptap/audio-player';
import {
  escapeHtmlAttribute,
  extractCustomBlockTag,
  findCustomBlockTagStart,
} from '@/lib/tiptap-markdown';

function isEnglishDocument() {
  return typeof document !== 'undefined' && document.documentElement.lang === 'en';
}

const createTokenizer = (name: string, tag: string) => ({
  name,
  level: 'block' as const,
  start: findCustomBlockTagStart(tag),
  tokenize(source: string) {
    const parsed = extractCustomBlockTag(source, tag);
    return parsed
      ? { type: name, raw: parsed.raw, attrs: parsed.attributes, tokens: [] }
      : undefined;
  },
});


/** Embeds and maps break out of the reading column. */
const embedShell = [
  'ml-[50%] w-[min(100vw-2rem,58rem)] -translate-x-1/2 overflow-hidden',
  'rounded-[0.35rem] border border-line bg-card',
].join(' ');

const embedLabel = [
  'border-b border-line px-[0.9rem] py-[0.7rem] font-sans text-[0.58rem]',
  'font-extrabold uppercase tracking-[0.15em] text-muted-foreground',
].join(' ');

const mapShell = [
  embedShell,
  'relative h-[380px] [@media(max-width:768px)]:h-[300px]',
  '[&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-0',
].join(' ');

const fileShell = [
  'grid grid-cols-[auto_1fr_auto] items-center gap-[0.9rem] rounded-[0.35rem]',
  'border border-line bg-card p-4',
  'transition-[border-color,transform,translate,scale,rotate] duration-[160ms] ease-[ease]',
  'hover:-translate-y-0.5 hover:border-accent',
  '[&_svg]:w-4',
  '[&_strong]:block [&_strong]:font-sans [&_strong]:text-[0.78rem]',
  '[&_small]:mt-[0.15rem] [&_small]:block [&_small]:font-sans [&_small]:text-[0.62rem]',
  '[&_small]:text-muted-foreground',
].join(' ');

function VideoView({ node }: NodeViewProps) {
  const isEnglish = isEnglishDocument();
  const provider = String(node.attrs.provider ?? 'youtube');
  const videoId = String(node.attrs.videoId ?? '');
  const embedUrl = provider === 'bilibili'
    ? `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(videoId)}&page=1&high_quality=1&danmaku=0`
    : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;

  return (
    <NodeViewWrapper className={embedShell} data-node="embed" contentEditable={false}>
      <div className={embedLabel}>{provider === 'bilibili' ? 'Bilibili' : 'YouTube'} / Video</div>
      <div className="relative aspect-video [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-0">
        <iframe
          src={embedUrl}
          title={isEnglish ? 'Embedded video' : '嵌入视频'}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </NodeViewWrapper>
  );
}

export const VideoEmbedNode = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      provider: { default: 'youtube' },
      videoId: { default: '' },
      url: { default: '' },
    };
  },
  parseHTML() {
    return [{ tag: 'video-embed' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['video-embed', mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VideoView);
  },
  markdownTokenName: 'videoEmbed',
  markdownTokenizer: createTokenizer('videoEmbed', 'video-embed'),
  parseMarkdown(token, helpers) {
    const attrs = (token as { attrs?: Record<string, string> }).attrs ?? {};
    return helpers.createNode('videoEmbed', {
      provider: attrs['data-provider'] ?? 'youtube',
      videoId: attrs['data-video-id'] ?? '',
      url: attrs['data-url'] ?? '',
    });
  },
  renderMarkdown(node) {
    return `<video-embed data-provider="${escapeHtmlAttribute(String(node.attrs?.provider ?? 'youtube'))}" data-video-id="${escapeHtmlAttribute(String(node.attrs?.videoId ?? ''))}" data-url="${escapeHtmlAttribute(String(node.attrs?.url ?? ''))}"></video-embed>`;
  },
});

function MapView({ node }: NodeViewProps) {
  const isEnglish = isEnglishDocument();
  const query = String(node.attrs.query ?? '');
  const lat = String(node.attrs.lat ?? '');
  const lng = String(node.attrs.lng ?? '');
  const target = query || [lat, lng].filter(Boolean).join(',');
  const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}`;
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(target)}&output=embed`;

  return (
    <NodeViewWrapper className={mapShell} data-node="map" contentEditable={false}>
      <iframe
        src={embed}
        title={isEnglish ? `Map: ${target}` : `地图：${target}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        className="absolute bottom-4 left-4 inline-flex max-w-[calc(100%-2rem)] items-center gap-[0.45rem] bg-black/[0.68] px-[0.8rem] py-[0.6rem] font-sans text-[0.7rem] text-white backdrop-blur-[10px] [&>svg]:w-[0.85rem]"
        href={href}
        target="_blank"
        rel="noreferrer"
      >
        <MapPin /> {target || (isEnglish ? 'View on map' : '在地图中查看')}
      </a>
    </NodeViewWrapper>
  );
}

export const MapEmbedNode = Node.create({
  name: 'mapEmbed',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      query: { default: '' },
      lat: { default: '' },
      lng: { default: '' },
      zoom: { default: '13' },
    };
  },
  parseHTML() {
    return [{ tag: 'map-embed' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['map-embed', mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(MapView);
  },
  markdownTokenName: 'mapEmbed',
  markdownTokenizer: createTokenizer('mapEmbed', 'map-embed'),
  parseMarkdown(token, helpers) {
    const attrs = (token as { attrs?: Record<string, string> }).attrs ?? {};
    return helpers.createNode('mapEmbed', {
      query: attrs['data-query'] ?? '',
      lat: attrs['data-lat'] ?? '',
      lng: attrs['data-lng'] ?? '',
      zoom: attrs['data-zoom'] ?? '13',
    });
  },
  renderMarkdown(node) {
    return `<map-embed data-query="${escapeHtmlAttribute(String(node.attrs?.query ?? ''))}" data-lat="${escapeHtmlAttribute(String(node.attrs?.lat ?? ''))}" data-lng="${escapeHtmlAttribute(String(node.attrs?.lng ?? ''))}" data-zoom="${escapeHtmlAttribute(String(node.attrs?.zoom ?? '13'))}"></map-embed>`;
  },
});

function FileView({ node }: NodeViewProps) {
  const isEnglish = isEnglishDocument();
  const src = String(node.attrs.src ?? '');
  const name = String(node.attrs.name ?? '') || src.split('/').at(-1) || 'Attachment';
  const size = String(node.attrs.size ?? '');
  return (
    <NodeViewWrapper contentEditable={false}>
      <a className={fileShell} data-node="file" href={src} download>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper">
          <FileText />
        </span>
        <span>
          <strong>{name}</strong>
          <small>
            {size ? `${size} bytes` : isEnglish ? 'File attachment' : '文件附件'}
          </small>
        </span>
        <Download />
      </a>
    </NodeViewWrapper>
  );
}

export const FileAttachmentNode = Node.create({
  name: 'fileAttachment',
  group: 'block',
  atom: true,
  addAttributes() {
    return { src: { default: '' }, name: { default: '' }, mime: { default: '' }, size: { default: '' } };
  },
  parseHTML() {
    return [{ tag: 'gh-file' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['gh-file', mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(FileView);
  },
  markdownTokenName: 'fileAttachment',
  markdownTokenizer: createTokenizer('fileAttachment', 'gh-file'),
  parseMarkdown(token, helpers) {
    const attrs = (token as { attrs?: Record<string, string> }).attrs ?? {};
    return helpers.createNode('fileAttachment', {
      src: attrs['data-src'] ?? '',
      name: attrs['data-name'] ?? '',
      mime: attrs['data-mime'] ?? '',
      size: attrs['data-size'] ?? '',
    });
  },
  renderMarkdown(node) {
    return `<gh-file data-src="${escapeHtmlAttribute(String(node.attrs?.src ?? ''))}" data-name="${escapeHtmlAttribute(String(node.attrs?.name ?? ''))}" data-mime="${escapeHtmlAttribute(String(node.attrs?.mime ?? ''))}" data-size="${escapeHtmlAttribute(String(node.attrs?.size ?? ''))}"></gh-file>`;
  },
});

function AudioView({ node }: NodeViewProps) {
  const isEnglish = isEnglishDocument();
  const src = String(node.attrs.src ?? '');
  const name = String(node.attrs.name ?? '') || src.split('/').at(-1) || 'Audio';
  const mime = String(node.attrs.mime ?? '');

  return (
    <NodeViewWrapper contentEditable={false}>
      <AudioPlayer src={src} name={name} mime={mime} isEnglish={isEnglish} />
    </NodeViewWrapper>
  );
}

export const AudioAttachmentNode = Node.create({
  name: 'audioAttachment',
  group: 'block',
  atom: true,
  addAttributes() {
    return { src: { default: '' }, name: { default: '' }, mime: { default: '' } };
  },
  parseHTML() {
    return [{ tag: 'gh-audio' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['gh-audio', mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(AudioView);
  },
  markdownTokenName: 'audioAttachment',
  markdownTokenizer: createTokenizer('audioAttachment', 'gh-audio'),
  parseMarkdown(token, helpers) {
    const attrs = (token as { attrs?: Record<string, string> }).attrs ?? {};
    return helpers.createNode('audioAttachment', {
      src: attrs['data-src'] ?? '',
      name: attrs['data-name'] ?? '',
      mime: attrs['data-mime'] ?? '',
    });
  },
  renderMarkdown(node) {
    return `<gh-audio data-src="${escapeHtmlAttribute(String(node.attrs?.src ?? ''))}" data-name="${escapeHtmlAttribute(String(node.attrs?.name ?? ''))}" data-mime="${escapeHtmlAttribute(String(node.attrs?.mime ?? ''))}"></gh-audio>`;
  },
});
