'use client';

import { mergeAttributes, Node } from '@tiptap/core';
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from '@tiptap/react';
import { Download, FileText, MapPin } from 'lucide-react';
import {
  escapeHtmlAttribute,
  extractCustomBlockTag,
  findCustomBlockTagStart,
} from '@/lib/tiptap-markdown';

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

function VideoView({ node }: NodeViewProps) {
  const provider = String(node.attrs.provider ?? 'youtube');
  const videoId = String(node.attrs.videoId ?? '');
  const embedUrl = provider === 'bilibili'
    ? `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(videoId)}&page=1&high_quality=1&danmaku=0`
    : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;

  return (
    <NodeViewWrapper className="tiptap-embed" contentEditable={false}>
      <div className="tiptap-embed-label">{provider === 'bilibili' ? 'Bilibili' : 'YouTube'} / Video</div>
      <div className="tiptap-video-frame">
        <iframe
          src={embedUrl}
          title="嵌入视频"
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
  const query = String(node.attrs.query ?? '');
  const lat = String(node.attrs.lat ?? '');
  const lng = String(node.attrs.lng ?? '');
  const target = query || [lat, lng].filter(Boolean).join(',');
  const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}`;
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(target)}&output=embed`;

  return (
    <NodeViewWrapper className="tiptap-map" contentEditable={false}>
      <iframe src={embed} title={`地图：${target}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      <a href={href} target="_blank" rel="noreferrer"><MapPin /> {target || '在地图中查看'}</a>
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
  const src = String(node.attrs.src ?? '');
  const name = String(node.attrs.name ?? '') || src.split('/').at(-1) || 'Attachment';
  const size = String(node.attrs.size ?? '');
  return (
    <NodeViewWrapper contentEditable={false}>
      <a className="tiptap-file" href={src} download>
        <span><FileText /></span>
        <span><strong>{name}</strong><small>{size ? `${size} bytes` : 'File attachment'}</small></span>
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
  const src = String(node.attrs.src ?? '');
  const name = String(node.attrs.name ?? '') || src.split('/').at(-1) || 'Audio';
  return (
    <NodeViewWrapper className="tiptap-audio" contentEditable={false}>
      <div><strong>{name}</strong><span>Audio note</span></div>
      <audio controls preload="metadata" src={src} />
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
