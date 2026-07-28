'use client';

import { mergeAttributes, Node } from '@tiptap/core';
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from '@tiptap/react';
import { Expand, X } from 'lucide-react';
import { useEffect, useState } from 'react';

function ImageView({ node }: NodeViewProps) {
  const isEnglish = typeof document !== 'undefined' &&
    document.documentElement.lang === 'en';
  const [open, setOpen] = useState(false);
  const src = typeof node.attrs.src === 'string' ? node.attrs.src : '';
  const alt = typeof node.attrs.alt === 'string' ? node.attrs.alt : '';

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);

  return (
    <NodeViewWrapper>
      <figure
        className="ml-[50%] w-[min(100vw-2rem,68rem)] -translate-x-1/2"
        data-node="figure"
      >
        <button
          type="button"
          className="relative block w-full cursor-zoom-in overflow-hidden rounded-[0.2rem] border-0 bg-muted [&>img]:block [&>img]:h-auto [&>img]:w-full [&>img]:transition-[transform,filter] [&>img]:duration-500 [&>img]:ease-[ease] hover:[&>img]:scale-[1.012] hover:[&>img]:saturate-[1.04]"
          onClick={() => setOpen(true)}
          contentEditable={false}
          aria-label={isEnglish
            ? `Enlarge image${alt ? `: ${alt}` : ''}`
            : `放大图片${alt ? `：${alt}` : ''}`}
        >
          {src ? <img src={src} alt={alt} /> : <span>Image unavailable</span>}
          <span className="absolute bottom-[0.8rem] right-[0.8rem] grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-[10px] [&>svg]:w-[0.85rem]">
            <Expand />
          </span>
        </button>
        {alt && (
          <figcaption className="mt-3 text-center font-sans text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
            {alt}
          </figcaption>
        )}
      </figure>

      {open && src && (
        <div
          className="fixed inset-0 z-[100] grid cursor-zoom-out place-items-center bg-[rgba(8,8,7,0.94)] px-4 py-16 text-white backdrop-blur-2xl [&>img]:max-h-[82vh] [&>img]:max-w-[min(94vw,1500px)] [&>img]:object-contain"
          role="dialog"
          aria-modal="true"
          aria-label={alt || (isEnglish ? 'Image preview' : '图片预览')}
          onClick={() => setOpen(false)}
          contentEditable={false}
        >
          <button
            type="button"
            aria-label={isEnglish ? 'Close preview' : '关闭预览'}
          >
            <X />
          </button>
          <img src={src} alt={alt} onClick={(event) => event.stopPropagation()} />
          {alt && <p>{alt}</p>}
        </div>
      )}
    </NodeViewWrapper>
  );
}

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
