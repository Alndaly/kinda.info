'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
import { GalleryContext } from '@/components/tiptap/gallery-context';
import { PhotoSlider } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

const photoLoading =
  'block h-6 w-6 animate-spinner rounded-full border border-white/70 border-t-transparent';

const photoCounter =
  'mr-4 self-center font-mono text-[0.62rem] tracking-[0.14em] text-white/70 tabular-nums';

const TRANSLATABLE_CJK = /[\p{Script=Han}\u3000-\u303f\uff01-\uff65]/u;

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
  const contentLabel = targetLanguage === 'en' ? 'Article body' : '文章正文';
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
          'data-reader': '',
          'aria-label': contentLabel,
        },
      },
    },
    [contentLabel, normalized],
  );

  useEffect(() => {
    if (!editor || !automatic || !setBodyStatus) return;
    const translationKey = `${translationCacheKey}:body`;
    if (translationApplied.current === translationKey) return;

    type TranslationSegment =
      | {
        kind: 'text';
        from: number;
        to: number;
        text: string;
        marks: readonly Mark[];
      }
      | {
        kind: 'attribute';
        position: number;
        attribute: 'alt' | 'title';
        text: string;
      };
    const segments: TranslationSegment[] = [];
    editor.state.doc.descendants((node, position, parent) => {
      if (
        node.isText &&
        node.text &&
        TRANSLATABLE_CJK.test(node.text) &&
        parent?.type.name !== 'codeBlock' &&
        !node.marks.some((mark) => mark.type.name === 'code')
      ) {
        segments.push({
          kind: 'text',
          from: position,
          to: position + node.nodeSize,
          text: node.text,
          marks: node.marks,
        });
      }
      if (node.type.name === 'image') {
        (['alt', 'title'] as const).forEach((attribute) => {
          const text = typeof node.attrs[attribute] === 'string'
            ? node.attrs[attribute]
            : '';
          if (text && TRANSLATABLE_CJK.test(text)) {
            segments.push({
              kind: 'attribute',
              position,
              attribute,
              text,
            });
          }
        });
      }
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
      const attributeUpdates = new Map<number, Record<string, unknown>>();
      segments.forEach((segment, index) => {
        if (segment.kind !== 'attribute') return;
        const node = editor.state.doc.nodeAt(segment.position);
        if (!node) return;
        const attributes = attributeUpdates.get(segment.position) ?? { ...node.attrs };
        attributes[segment.attribute] = translated[index] || segment.text;
        attributeUpdates.set(segment.position, attributes);
      });
      attributeUpdates.forEach((attributes, position) => {
        transaction = transaction.setNodeMarkup(position, undefined, attributes);
      });
      const textSegments = segments
        .map((segment, index) => ({ segment, index }))
        .filter((item): item is {
          segment: Extract<TranslationSegment, { kind: 'text' }>;
          index: number;
        } => item.segment.kind === 'text')
        .reverse();
      textSegments.forEach(({ segment, index }) => {
        const replacement = editor.schema.text(
          translated[index] || segment.text,
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

  const images = useMemo(() => {
    if (!editor) return [] as string[];
    const found: string[] = [];
    editor.state.doc.descendants((node) => {
      if (node.type.name !== 'image') return;
      const src = typeof node.attrs.src === 'string' ? node.attrs.src : '';
      if (src) found.push(src);
    });
    return found;
  }, [editor]);
  // A fresh array on every render restarts the slider's own effects.
  const photoImages = useMemo(
    () => images.map((src) => ({ src, key: src })),
    [images],
  );
  // visible and index are separate: deriving one from the other lets the
  // slider's onIndexChange during close flip it straight back open.
  const [viewer, setViewer] = useState({ visible: false, index: 0 });
  // The slider unmounts itself when its closing animation ends, which a
  // background tab never runs — so it is also unmounted on a timer, or a
  // full-screen layer could be left covering the page.
  const [viewerMounted, setViewerMounted] = useState(false);
  const gallery = useMemo(() => ({
    open: (src: string) => {
      setViewerMounted(true);
      setViewer({ visible: true, index: Math.max(images.indexOf(src), 0) });
    },
  }), [images]);

  useEffect(() => {
    if (viewer.visible) return;
    const timer = window.setTimeout(() => setViewerMounted(false), 500);
    return () => window.clearTimeout(timer);
  }, [viewer.visible]);

  if (!editor) {
    return (
      <div
        data-reader=""
        aria-label={contentLabel}
        dangerouslySetInnerHTML={{ __html: fallbackHtml }}
      />
    );
  }

  return (
    <GalleryContext.Provider value={gallery}>
      <EditorContent editor={editor} />
      {viewerMounted ? (
        <PhotoSlider
          images={photoImages}
          visible={viewer.visible}
          index={viewer.index}
          onIndexChange={(index) => setViewer((state) => ({ ...state, index }))}
          onClose={() => setViewer((state) => ({ ...state, visible: false }))}
          maskOpacity={0.94}
          loadingElement={<span className={photoLoading} />}
          toolbarRender={({ index }) => (
            <span className={photoCounter}>
              {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </span>
          )}
        />
      ) : null}
    </GalleryContext.Provider>
  );
}
