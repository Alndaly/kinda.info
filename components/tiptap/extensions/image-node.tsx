'use client';

import { mergeAttributes, Node } from '@tiptap/core';
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from '@tiptap/react';
import { Expand } from 'lucide-react';
import { useDocumentGallery } from '@/components/tiptap/gallery-context';

function ImageView({ node }: NodeViewProps) {
  const isEnglish = typeof document !== 'undefined' &&
    document.documentElement.lang === 'en';
  const gallery = useDocumentGallery();
  const src = typeof node.attrs.src === 'string' ? node.attrs.src : '';
  const alt = typeof node.attrs.alt === 'string' ? node.attrs.alt : '';

  return (
    <NodeViewWrapper>
      <figure
        className="group/figure ml-[50%] w-[min(100vw-2rem,68rem)] -translate-x-1/2"
        data-node="figure"
      >
        {src ? (
          <button
            type="button"
            className={imageButton}
            contentEditable={false}
            onClick={() => gallery?.open(src)}
            aria-label={isEnglish
              ? `Enlarge image${alt ? `: ${alt}` : ''}`
              : `放大图片${alt ? `：${alt}` : ''}`}
          >
            <img src={src} alt={alt} />
            <span className={imageExpandBadge}>
              <Expand />
            </span>
          </button>
        ) : (
          <div className={imageButton} contentEditable={false}>
            <span>Image unavailable</span>
          </div>
        )}
        {alt && (
          <figcaption className="mt-3 text-center font-sans text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
            {alt}
          </figcaption>
        )}
      </figure>
    </NodeViewWrapper>
  );
}

const imageButton = [
  'relative block w-full cursor-zoom-in overflow-hidden rounded-[0.2rem] border-0 bg-muted',
  '[&>img]:block [&>img]:h-auto [&>img]:w-full',
  '[&>img]:transition-[transform,filter] [&>img]:duration-500 [&>img]:ease-[ease]',
  'hover:[&>img]:scale-[1.012] hover:[&>img]:saturate-[1.04]',
].join(' ');

const imageExpandBadge = [
  'absolute bottom-[0.8rem] right-[0.8rem] grid h-9 w-9 place-items-center rounded-full',
  // visible on touch too, where there is no hover to reveal it
  'bg-black/50 text-white opacity-70 backdrop-blur-[10px] transition-opacity duration-300',
  'group-hover/figure:opacity-100 [&>svg]:w-[0.85rem]',
].join(' ');

const ImageNode = Node.create({
  name: 'image',
  group: 'block',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: '' },
      alt: { default: '' },
      title: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'img[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },

  markdownTokenName: 'image',

  parseMarkdown(token, helpers) {
    const image = token as { href?: string; text?: string; title?: string | null };
    return helpers.createNode('image', {
      src: image.href ?? '',
      alt: image.text ?? '',
      title: image.title ?? null,
    });
  },

  renderMarkdown(node) {
    const src = String(node.attrs?.src ?? '').trim();
    if (!src) return '';
    const alt = String(node.attrs?.alt ?? '').replace(/\]/g, '\\]');
    const title = node.attrs?.title
      ? ` "${String(node.attrs.title).replace(/"/g, '\\"')}"`
      : '';
    return `![${alt}](${src}${title})`;
  },
});

export default ImageNode;
