'use client';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from '@tiptap/react';
import { Check, Copy, Workflow } from 'lucide-react';
import { common, createLowlight } from 'lowlight';
import { useEffect, useId, useState } from 'react';
import { codeSurface, codeTokens } from '@/lib/ui-classes';

const lowlight = createLowlight(common);


/** Code and diagrams break out of the reading column. */
const codeShell = [
  codeSurface,
  codeTokens,
  'ml-[50%] w-[min(100vw-2rem,58rem)] -translate-x-1/2 overflow-hidden font-code',
  'rounded-[0.5rem] border border-white/[0.08]',
  'shadow-[0_1.25rem_2.5rem_hsl(var(--ink)/0.12),inset_0_1px_0_rgba(255,255,255,0.04)]',
].join(' ');

const mermaidShell = [
  'ml-[50%] w-[min(100vw-2rem,58rem)] -translate-x-1/2 overflow-hidden',
  'rounded-[0.5rem] border border-line bg-card font-code text-foreground',
  'shadow-[0_1.25rem_2.5rem_hsl(var(--ink)/0.07)]',
].join(' ');

const codeHeader = [
  'flex min-h-[2.6rem] items-center justify-between gap-4 border-b border-white/[0.07]',
  // opaque, because the mermaid shell behind it is a light card
  'bg-[#1b1c18] px-[0.95rem] font-mono text-[0.58rem] tracking-[0.14em] text-[#9c9a8c]',
  // a lit dot marks the language, the way a terminal tab would
  '[&>span:first-child]:inline-flex [&>span:first-child]:items-center [&>span:first-child]:gap-[0.5rem]',
  "[&>span:first-child]:before:h-[0.32rem] [&>span:first-child]:before:w-[0.32rem]",
  '[&>span:first-child]:before:rounded-full [&>span:first-child]:before:bg-accent/70',
  "[&>span:first-child]:before:content-['']",
  '[&_button]:inline-flex [&_button]:items-center [&_button]:gap-[0.4rem] [&_button]:rounded-full',
  '[&_button]:px-[0.5rem] [&_button]:py-[0.2rem]',
  '[&_button]:transition-[color,background-color] [&_button]:duration-[160ms] [&_button]:ease-[ease]',
  'hover:[&_button]:bg-white/[0.06] hover:[&_button]:text-[#e8e5da]',
  '[&_svg]:h-[0.78rem] [&_svg]:w-[0.78rem]',
  // the copy button confirms in the memo colour instead of only swapping icon
  '[&_button[data-copied=true]]:text-memo',
].join(' ');

function MermaidPreview({ source }: { source: string }) {
  const isEnglish = typeof document !== 'undefined' &&
    document.documentElement.lang === 'en';
  const reactId = useId();
  const id = `mermaid-${reactId.replace(/:/g, '')}`;
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!source.trim()) return;

    void import('mermaid').then(async ({ default: mermaid }) => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'neutral',
          fontFamily: 'Inter, ui-sans-serif, sans-serif',
        });
        const result = await mermaid.render(id, source);
        if (active) {
          setSvg(result.svg);
          setError('');
        }
      } catch (reason) {
        if (active) {
          setSvg('');
          setError(reason instanceof Error ? reason.message : 'Diagram syntax error');
        }
      }
    });

    return () => {
      active = false;
    };
  }, [id, source]);

  if (error) {
    return (
      <div className="p-6 font-sans text-xs leading-relaxed text-[#c64d4d]">
        {isEnglish ? 'Mermaid could not render: ' : 'Mermaid 无法渲染：'}{error}
      </div>
    );
  }

  return (
    <div
      className="grid min-h-60 place-items-center overflow-x-auto bg-[linear-gradient(hsl(var(--line)/0.35)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--line)/0.35)_1px,transparent_1px)] bg-[length:20px_20px] p-8 [&_svg]:h-auto [&_svg]:max-w-full"
      aria-label={isEnglish ? 'Mermaid diagram' : 'Mermaid 图表'}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function CodeBlockView({ node }: NodeViewProps) {
  const isEnglish = typeof document !== 'undefined' &&
    document.documentElement.lang === 'en';
  const labels = isEnglish
    ? { copied: 'Copied', copy: 'Copy', copySource: 'Copy source', diagram: 'Mermaid diagram' }
    : { copied: '已复制', copy: '复制', copySource: '复制源码', diagram: 'Mermaid 图表' };
  const language = String(node.attrs.language ?? 'plaintext').toLowerCase();
  const source = node.textContent ?? '';
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(source);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  if (language === 'mermaid') {
    return (
      <NodeViewWrapper className={mermaidShell} data-node="mermaid">
        <div className={codeHeader} data-node="code-header" contentEditable={false}>
          <span><Workflow /> {labels.diagram}</span>
          <button type="button" onClick={copy} data-copied={copied}>
            {copied ? <Check /> : <Copy />}
            {copied ? labels.copied : labels.copySource}
          </button>
        </div>
        <MermaidPreview source={source} />
        <NodeViewContent className="sr-only" />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className={codeShell}>
      <div className={codeHeader} data-node="code-header" contentEditable={false}>
        <span>{language || 'plaintext'}</span>
        <button type="button" onClick={copy} data-copied={copied}>
          {copied ? <Check /> : <Copy />}
          {copied ? labels.copied : labels.copy}
        </button>
      </div>
      <pre className="m-0! overflow-x-auto rounded-none border-0 bg-transparent! p-[1.35rem]! text-inherit!">
        <NodeViewContent className="block whitespace-pre! text-[0.78rem] leading-[1.7]" />
      </pre>
    </NodeViewWrapper>
  );
}

const CodeBlockNode = CodeBlockLowlight.configure({ lowlight }).extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },

  markdownTokenName: 'code',

  parseMarkdown(token, helpers) {
    const code = token as { lang?: string; text?: string };
    const text = (code.text ?? '').replace(/\n+$/g, '');
    return helpers.createNode(
      'codeBlock',
      { language: code.lang || 'plaintext' },
      text ? [helpers.createTextNode(text)] : [],
    );
  },

  renderMarkdown(node, helpers) {
    const language = String(node.attrs?.language ?? '').trim();
    const content = node.content
      ? String(helpers.renderChildren(node.content) ?? '').replace(/\n+$/g, '')
      : '';
    return `\`\`\`${language === 'plaintext' ? '' : language}\n${content}\n\`\`\``;
  },
});

export default CodeBlockNode;
