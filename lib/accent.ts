/**
 * Readable foreground for a project's own brand colour.
 *
 * The mark badge and the CTA button paint `--project-accent` at full strength
 * and used to set white on top of it unconditionally. Measured, every project
 * failed WCAG AA that way — the accents run from #20A37A to #9E9EFF, and white
 * only carries on the darkest of them:
 *
 *   WeSmile #9E9EFF 2.39:1 · Lolama #45B08C 2.68:1 · Revornix #5B8CFF 3.16:1
 *   UniAPI  #20A37A 3.19:1 · @kinda/utils #F05A3C 3.37:1 · Mosael #9B6BFF 3.53:1
 *
 * Picking by luminance leaves every brand colour untouched and makes the two
 * letters legible on all of them. The badge background is a fixed hex rather
 * than a theme token, so the choice holds in both light and dark.
 */

/** The site's ink, for accents too light to carry white. */
const INK = '#1a1a17';
const PAPER = '#ffffff';

function channels(hex: string): [number, number, number] | null {
  const value = hex.trim().replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  if (!/^[\da-f]{6}$/i.test(full)) return null;
  return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

function luminance([r, g, b]: [number, number, number]) {
  const linear = (value: number) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrast(a: number, b: number) {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * Whichever of ink or paper reads better on `hex`. Falls back to paper for a
 * colour it cannot parse, which is what the markup did before.
 */
export function readableOn(hex: string | undefined): string {
  const rgb = hex ? channels(hex) : null;
  if (!rgb) return PAPER;
  const background = luminance(rgb);
  const onInk = contrast(background, luminance(channels(INK)!));
  const onPaper = contrast(background, luminance(channels(PAPER)!));
  return onInk >= onPaper ? INK : PAPER;
}
