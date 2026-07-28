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

const lowlight = createLowlight(common);

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
      <div className="tiptap-mermaid-error">
        {isEnglish ? 'Mermaid could not render: ' : 'Mermaid 无法渲染：'}{error}
      </div>
    );
  }

  return (
    <div
      className="tiptap-mermaid-canvas"
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
      <NodeViewWrapper className="tiptap-mermaid" data-node="mermaid">
        <div className="tiptap-code-header" data-node="code-header" contentEditable={false}>
          <span><Workflow /> {labels.diagram}</span>
          <button type="button" onClick={copy}>
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
    <NodeViewWrapper className="tiptap-code-block">
      <div className="tiptap-code-header" data-node="code-header" contentEditable={false}>
        <span>{language || 'plaintext'}</span>
        <button type="button" onClick={copy}>
          {copied ? <Check /> : <Copy />}
          {copied ? labels.copied : labels.copy}
        </button>
      </div>
      <pre><NodeViewContent className="tiptap-code-content" /></pre>
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
