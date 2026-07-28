'use client';

import { useEffect, useMemo, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import type { Mark } from '@tiptap/pm/model';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import { TableKit } from '@tiptap/extension-table';
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
import { useArticleLanguage } from '@/components/article-language-tools';
import {
  readTranslationCache,
  translateTexts,
  writeTranslationCache,
} from '@/lib/client-translation';

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
  const language = useArticleLanguage();
  const automatic = language?.automatic ?? false;
  const translationCacheKey = language?.cacheKey ?? '';
  const sourceLanguage = language?.sourceLanguage ?? 'zh';
  const targetLanguage = language?.targetLanguage ?? 'en';
  const setBodyStatus = language?.setBodyStatus;
  const translationApplied = useRef('');
  const normalized = useMemo(() => normalizeMarkdown(content), [content]);
  const editor = useEditor(
    {
      immediatelyRender: false,
      editable: false,
      extensions: [
        StarterKit.configure({ codeBlock: false }),
        ImageNode,
        CalloutNode,
        MathBlockNode,
        MathInlineNode,
        TableKit,
        VideoEmbedNode,
        MapEmbedNode,
        FileAttachmentNode,
        AudioAttachmentNode,
        CodeBlockNode,
        Markdown.configure({
          markedOptions: {
            gfm: true,
          },
        }),
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

  useEffect(() => {
    if (!editor || !automatic || !setBodyStatus) return;
    const translationKey = `${translationCacheKey}:body`;
    if (translationApplied.current === translationKey) return;

    const segments: Array<{
      from: number;
      to: number;
      text: string;
      marks: readonly Mark[];
    }> = [];
    editor.state.doc.descendants((node, position, parent) => {
      if (
        !node.isText ||
        !node.text ||
        !/[\p{Script=Han}]/u.test(node.text) ||
        parent?.type.name === 'codeBlock' ||
        node.marks.some((mark) => mark.type.name === 'code')
      ) {
        return;
      }
      segments.push({
        from: position,
        to: position + node.nodeSize,
        text: node.text,
        marks: node.marks,
      });
    });

    if (!segments.length) {
      translationApplied.current = translationKey;
      setBodyStatus('ready');
      return;
    }

    let active = true;
    const source = segments.map((segment) => segment.text);
    const applyTranslations = (translated: string[]) => {
      if (!active || translated.length !== segments.length) return;
      let transaction = editor.state.tr;
      [...segments].reverse().forEach((segment, reverseIndex) => {
        const translatedIndex = segments.length - reverseIndex - 1;
        const replacement = editor.schema.text(
          translated[translatedIndex] || segment.text,
          segment.marks,
        );
        transaction = transaction.replaceWith(segment.from, segment.to, replacement);
      });
      editor.view.dispatch(transaction);
      translationApplied.current = translationKey;
      setBodyStatus('ready');
    };
    const cached = readTranslationCache(translationKey, source);
    if (cached) {
      applyTranslations(cached);
      return () => {
        active = false;
      };
    }

    setBodyStatus('loading');
    void translateTexts(source, sourceLanguage, targetLanguage)
      .then((translated) => {
        writeTranslationCache(translationKey, source, translated);
        applyTranslations(translated);
      })
      .catch(() => {
        if (!active) return;
        setBodyStatus('error');
      });

    return () => {
      active = false;
    };
  }, [
    automatic,
    editor,
    setBodyStatus,
    sourceLanguage,
    targetLanguage,
    translationCacheKey,
  ]);

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
