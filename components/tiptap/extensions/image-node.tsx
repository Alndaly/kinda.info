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
      <figure className="tiptap-figure">
        <button
          type="button"
          className="tiptap-image-button"
          onClick={() => setOpen(true)}
          contentEditable={false}
          aria-label={`放大图片${alt ? `：${alt}` : ''}`}
        >
          {src ? <img src={src} alt={alt} /> : <span>Image unavailable</span>}
          <span className="tiptap-image-expand"><Expand /></span>
        </button>
        {alt && <figcaption>{alt}</figcaption>}
      </figure>

      {open && src && (
        <div
          className="tiptap-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={alt || '图片预览'}
          onClick={() => setOpen(false)}
          contentEditable={false}
        >
          <button type="button" aria-label="关闭预览"><X /></button>
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
