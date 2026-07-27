'use client';

import { mergeAttributes, Node, type MarkdownToken } from '@tiptap/core';
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from '@tiptap/react';
import {
  AlertTriangle,
  Info,
  Lightbulb,
  OctagonAlert,
  Siren,
} from 'lucide-react';
import type { ComponentType } from 'react';

const CALLOUT_TYPES = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'] as const;
type CalloutType = (typeof CALLOUT_TYPES)[number];

const normalizeType = (raw?: string | null): CalloutType => {
  const value = raw?.trim().toUpperCase();
  return CALLOUT_TYPES.includes(value as CalloutType)
    ? (value as CalloutType)
    : 'NOTE';
};

const visuals: Record<
  CalloutType,
  { icon: ComponentType<{ className?: string }>; label: string }
> = {
  NOTE: { icon: Info, label: 'Note' },
  TIP: { icon: Lightbulb, label: 'Tip' },
  IMPORTANT: { icon: Siren, label: 'Important' },
  WARNING: { icon: AlertTriangle, label: 'Warning' },
  CAUTION: { icon: OctagonAlert, label: 'Caution' },
};

const TYPE_PATTERN = new RegExp(
  `^>\\s*\\[!(${CALLOUT_TYPES.join('|')})\\]\\s*$`,
  'i',
);

function parseCallout(source: string) {
  if (!source.startsWith('>')) return null;
  const chunk = source.split(/\r?\n\r?\n/, 1)[0];
  const lines = chunk.split(/\r?\n/);
  const header = lines[0].match(TYPE_PATTERN);
  if (!header) return null;

  const body: string[] = [];
  let consumed = 1;
  for (let index = 1; index < lines.length; index += 1) {
    const match = lines[index].match(/^>\s?(.*)$/);
    if (!match) break;
    body.push(match[1]);
    consumed = index + 1;
  }

  const raw = `${lines.slice(0, consumed).join('\n')}\n`;
  return { raw, type: normalizeType(header[1]), body: body.join('\n').trim() };
}

function CalloutView({ node }: NodeViewProps) {
  const type = normalizeType(node.attrs.type as string);
  const visual = visuals[type];
  const Icon = visual.icon;

  return (
    <NodeViewWrapper className={`tiptap-callout tiptap-callout-${type.toLowerCase()}`}>
      <div className="tiptap-callout-label" contentEditable={false}>
        <Icon aria-hidden />
        <span>{visual.label}</span>
      </div>
      <NodeViewContent className="tiptap-callout-body" />
    </NodeViewWrapper>
  );
}

const CalloutNode = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'NOTE',
        parseHTML: (element) => normalizeType(element.getAttribute('data-type')),
        renderHTML: (attributes) => ({ 'data-type': normalizeType(attributes.type) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'gh-callout' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['gh-callout', mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutView);
  },

  markdownTokenName: 'callout',

  markdownTokenizer: {
    name: 'callout',
    level: 'block',
    start: (source: string) => source.search(/>\s*\[!/i),
    tokenize(source, _tokens, lexer) {
      const parsed = parseCallout(source);
      if (!parsed) return undefined;
      const tokens: MarkdownToken[] = parsed.body
        ? lexer?.blockTokens?.(`${parsed.body}\n`) ?? []
        : [];
      return {
        type: 'callout',
        raw: parsed.raw,
        attrs: { type: parsed.type },
        tokens,
      };
    },
  },

  parseMarkdown(token, helpers) {
    const attrs = (token as { attrs?: { type?: string } }).attrs;
    const childTokens = [...((token.tokens ?? []) as MarkdownToken[])];
    while (childTokens.at(-1)?.type === 'space') childTokens.pop();
    const children = childTokens.length ? helpers.parseChildren(childTokens) : [];
    return helpers.createNode(
      'callout',
      { type: normalizeType(attrs?.type) },
      children.length ? children : [{ type: 'paragraph' }],
    );
  },

  renderMarkdown(node, helpers) {
    const type = normalizeType(node.attrs?.type as string);
    const inner = String(helpers.renderChildren(node, '\n\n') ?? '').trimEnd();
    const body = (inner || '').split('\n').map((line) => `> ${line}`).join('\n');
    return `> [!${type}]\n${body}`;
  },
});

export default CalloutNode;
