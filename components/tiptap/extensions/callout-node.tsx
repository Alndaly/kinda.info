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
import { cn } from '@/lib/utils';

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


const calloutShell = [
  // no default tone here: every kind sets its own in calloutTones, so the two
  // never end up as same-specificity rules fighting over source order
  'relative block rounded-none border-0 border-l border-l-[var(--callout-tone)] font-display',
  // a hairline on the other three sides so the block still reads as a block
  // where the tinted background is nearly invisible
  'border-y border-r border-y-[color-mix(in_srgb,var(--callout-tone)_16%,transparent)]',
  'border-r-[color-mix(in_srgb,var(--callout-tone)_16%,transparent)]',
  'dark:border-y-[color-mix(in_srgb,var(--callout-tone)_26%,transparent)]',
  'dark:border-r-[color-mix(in_srgb,var(--callout-tone)_26%,transparent)]',
  'pl-[clamp(1.5rem,3.5vw,2rem)] pr-[clamp(1.25rem,3vw,1.8rem)]',
  'pt-[clamp(1.35rem,3vw,1.75rem)] pb-[clamp(1.45rem,3vw,1.9rem)]',
  'to-768:pl-[1.35rem] to-768:pr-4',
  'to-768:pb-[1.35rem] to-768:pt-5',
  'bg-[linear-gradient(100deg,color-mix(in_srgb,var(--callout-tone)_8%,transparent),color-mix(in_srgb,var(--callout-tone)_2%,transparent)_58%,transparent_90%)]',
  // 8% of a tone disappears on the dark paper, so the mix goes up in dark mode
  'dark:bg-[linear-gradient(100deg,color-mix(in_srgb,var(--callout-tone)_18%,transparent),color-mix(in_srgb,var(--callout-tone)_7%,transparent)_58%,transparent_94%)]',
  "before:absolute before:left-[-0.24rem] before:top-[1.72rem] before:h-[0.42rem] before:w-[0.42rem]",
  'before:rotate-45 before:bg-[var(--callout-tone)] before:shadow-[0_0_0_0.28rem_hsl(var(--paper))]',
  "before:content-['']",
].join(' ');

/** Each kind of callout only swaps its tone. */
const calloutTones: Record<CalloutType, string> = {
  NOTE: '[--callout-tone:hsl(var(--accent))]',
  TIP: '[--callout-tone:#3d8059] dark:[--callout-tone:#78c497]',
  IMPORTANT: '[--callout-tone:#7454ab] dark:[--callout-tone:#b59bdd]',
  WARNING: '[--callout-tone:#9b640e] dark:[--callout-tone:#e0ad5a]',
  CAUTION: '[--callout-tone:#b23d3d] dark:[--callout-tone:#e98989]',
};

const calloutLabel = [
  'mb-[0.85rem] flex w-fit items-center gap-[0.45rem] font-sans text-[0.55rem]',
  'font-extrabold uppercase leading-none tracking-[0.17em] text-[var(--callout-tone)]',
  '[&>svg]:h-[0.82rem] [&>svg]:w-[0.82rem] [&>svg]:[stroke-width:1.8]',
  "after:ml-[0.15rem] after:h-px after:w-[clamp(2.5rem,8vw,5rem)] after:bg-current",
  "after:opacity-[0.28] after:content-['']",
].join(' ');

const calloutBody = [
  'grid gap-[0.45rem]',
  '[&>p]:leading-[1.82] [&>p]:text-foreground/90',
  '[&>p:first-child>strong:first-child]:inline-block',
  '[&>p:first-child>strong:first-child]:text-[1.04em] [&>p:first-child>strong:first-child]:font-[650]',
  '[&>p:first-child>strong:first-child]:tracking-[-0.025em]',
  '[&>p:first-child>strong:first-child]:text-foreground',
].join(' ');

function CalloutView({ node }: NodeViewProps) {
  const type = normalizeType(node.attrs.type as string);
  const visual = visuals[type];
  const Icon = visual.icon;

  return (
    <NodeViewWrapper className={cn(calloutShell, calloutTones[type])}>
      <div className={calloutLabel} contentEditable={false}>
        <Icon aria-hidden />
        <span>{visual.label}</span>
      </div>
      <NodeViewContent className={calloutBody} />
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
