export type CustomBlock = {
  raw: string;
  attributes: Record<string, string>;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseAttributes = (source: string) => {
  const attributes: Record<string, string> = {};
  const pattern = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source))) {
    attributes[match[1]] = match[2] ?? match[3] ?? '';
  }

  return attributes;
};

export const findCustomBlockTagStart = (tagName: string) => (source: string) =>
  source.search(new RegExp(`<${escapeRegExp(tagName)}\\b`, 'i'));

export function extractCustomBlockTag(
  source: string,
  tagName: string,
): CustomBlock | null {
  const escaped = escapeRegExp(tagName);
  const pattern = new RegExp(
    `^<${escaped}\\b([^>]*?)(?:\\s*\\/\\s*>|>\\s*<\\/${escaped}\\s*>)[\\t ]*(?:\\r?\\n|$)`,
    'i',
  );
  const match = source.match(pattern);
  if (!match) return null;

  return {
    raw: match[0],
    attributes: parseAttributes(match[1] ?? ''),
  };
}

export function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
