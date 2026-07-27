'use client';

import { useMemo } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Markdown } from '@tiptap/markdown';
import CalloutNode from './extensions/callout-node';
import ImageNode from './extensions/image-node';
import CodeBlockNode from './extensions/code-block-node';
import { MathBlockNode, MathInlineNode } from './extensions/math-nodes';
import {
  AudioAttachmentNode,
  FileAttachmentNode,
  MapEmbedNode,
  VideoEmbedNode,
} from './extensions/embed-nodes';

function normalizeMarkdown(content: string) {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/^\uFEFF/, '')
    .trim();
}

export function TiptapContent({
  content,
  fallbackHtml,
}: {
  content: string;
  fallbackHtml: string;
}) {
  const normalized = useMemo(() => normalizeMarkdown(content), [content]);
  const editor = useEditor(
    {
      immediatelyRender: false,
      editable: false,
      extensions: [
        StarterKit.configure({ codeBlock: false }),
        Underline,
        ImageNode,
        CalloutNode,
        MathBlockNode,
        MathInlineNode,
        VideoEmbedNode,
        MapEmbedNode,
        FileAttachmentNode,
        AudioAttachmentNode,
        CodeBlockNode,
        Markdown,
      ],
      content: normalized,
      contentType: 'markdown',
      editorProps: {
        attributes: {
          class: 'tiptap-prosemirror',
          'aria-label': '文章正文',
        },
      },
    },
    [normalized],
  );

  if (!editor) {
    return (
      <div
        className="tiptap-reader tiptap-fallback"
        aria-label="文章正文"
        dangerouslySetInnerHTML={{ __html: fallbackHtml }}
      />
    );
  }

  return <EditorContent editor={editor} className="tiptap-reader" />;
}
