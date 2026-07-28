'use client';

import { mergeAttributes, Node } from '@tiptap/core';
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from '@tiptap/react';
import katex from 'katex';

function renderFormula(formula: string, displayMode: boolean) {
  try {
    return {
      html: katex.renderToString(formula, {
        throwOnError: true,
        displayMode,
        output: 'htmlAndMathml',
      }),
      error: '',
    };
  } catch (reason) {
    return {
      html: '',
      error: reason instanceof Error ? reason.message : 'Invalid formula',
    };
  }
}

function MathBlockView({ node }: NodeViewProps) {
  const formula = String(node.attrs.formula ?? '');
  const result = renderFormula(formula, true);
  return (
    <NodeViewWrapper
      className="overflow-x-auto border-y border-line px-4 py-7 text-center"
      contentEditable={false}
    >
      {result.error ? <span>{result.error}</span> : <div dangerouslySetInnerHTML={{ __html: result.html }} />}
    </NodeViewWrapper>
  );
}

function MathInlineView({ node }: NodeViewProps) {
  const formula = String(node.attrs.formula ?? '');
  const result = renderFormula(formula, false);
  return (
    <NodeViewWrapper
      as="span"
      className="inline-block max-w-full overflow-x-auto align-middle"
      contentEditable={false}
    >
      {result.error ? <span>{result.error}</span> : <span dangerouslySetInnerHTML={{ __html: result.html }} />}
    </NodeViewWrapper>
  );
}

function extractBlockMath(source: string) {
  const match = source.match(/^(?:\\\[\s*\n?([\s\S]*?)\n?\\\]|\$\$\s*\n?([\s\S]*?)\n?\$\$)[ \t]*(?:\r?\n|$)/);
  if (!match) return null;
  return { raw: match[0], formula: (match[1] ?? match[2] ?? '').trim() };
}

function extractInlineMath(source: string) {
  const match = source.match(/^\\\((.+?)\\\)/);
  if (!match) return null;
  return { raw: match[0], formula: match[1].trim() };
}

export const MathBlockNode = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return { formula: { default: '' } };
  },
  parseHTML() {
    return [{ tag: 'math-block' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['math-block', mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(MathBlockView);
  },
  markdownTokenName: 'mathBlock',
  markdownTokenizer: {
    name: 'mathBlock',
    level: 'block',
    start: (source: string) => {
      const slash = source.indexOf('\\[');
      const dollars = source.indexOf('$$');
      if (slash < 0) return dollars;
      if (dollars < 0) return slash;
      return Math.min(slash, dollars);
    },
    tokenize(source) {
      const parsed = extractBlockMath(source);
      return parsed ? { type: 'mathBlock', raw: parsed.raw, text: parsed.formula, tokens: [] } : undefined;
    },
  },
  parseMarkdown(token, helpers) {
    return helpers.createNode('mathBlock', { formula: (token as { text?: string }).text ?? '' });
  },
  renderMarkdown(node) {
    return `\\[\n${String(node.attrs?.formula ?? '')}\n\\]`;
  },
});

export const MathInlineNode = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return { formula: { default: '' } };
  },
  parseHTML() {
    return [{ tag: 'math-inline' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['math-inline', mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(MathInlineView);
  },
  markdownTokenName: 'mathInline',
  markdownTokenizer: {
    name: 'mathInline',
    level: 'inline',
    start: (source: string) => source.indexOf('\\('),
    tokenize(source) {
      const parsed = extractInlineMath(source);
      return parsed ? { type: 'mathInline', raw: parsed.raw, text: parsed.formula } : undefined;
    },
  },
  parseMarkdown(token, helpers) {
    return helpers.createNode('mathInline', { formula: (token as { text?: string }).text ?? '' });
  },
  renderMarkdown(node) {
    return `\\(${String(node.attrs?.formula ?? '')}\\)`;
  },
});
