/**
 * Utility strings shared by more than one component. Everything here is plain
 * Tailwind — kept in TypeScript rather than as custom CSS classes so the markup
 * stays the single source of truth for how something looks.
 */

export const siteContainer =
  'mx-auto w-[min(100%-2rem,1240px)] [@media(max-width:520px)]:w-[min(100%-1.25rem,1240px)]';

export const headerControl = [
  'inline-flex h-10 items-center justify-center rounded-full border border-line',
  'bg-paper/[0.34] text-[0.61rem] font-[720] tracking-[0.08em] text-muted-foreground',
  'shadow-[inset_0_1px_0_hsl(var(--ink)/0.025)]',
  'transition-[color,border-color,background-color,box-shadow,transform] duration-[180ms] ease-[ease]',
  'hover:border-ink hover:bg-ink hover:text-paper hover:shadow-[0_0.45rem_1.3rem_hsl(var(--ink)/0.1)]',
  'focus-visible:border-ink focus-visible:bg-ink focus-visible:text-paper',
  'focus-visible:shadow-[0_0.45rem_1.3rem_hsl(var(--ink)/0.1)]',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/[0.72]',
].join(' ');

/** Square variant of {@link headerControl}, for icon-only controls. */
export const headerControlSquare = `${headerControl} w-10 min-w-10 p-0`;

export const navPill = [
  'rounded-full px-[0.9rem] py-[0.55rem] text-[0.75rem] font-semibold tracking-[0.05em]',
  'transition-colors duration-[180ms] ease-[ease] hover:bg-ink hover:text-paper',
].join(' ');

/** Underlined link with an arrow that lifts on hover. */
export const textLink = [
  'inline-flex items-center gap-[0.45rem] border-b border-current pb-1',
  'text-[0.72rem] font-bold uppercase tracking-[0.12em]',
  '[&>svg]:w-[0.9rem] [&>svg]:transition-transform [&>svg]:duration-[180ms] [&>svg]:ease-[ease]',
  'hover:[&>svg]:translate-x-[2px] hover:[&>svg]:-translate-y-[2px]',
].join(' ');

export const sectionSpace = 'py-[clamp(5.5rem,10vw,9rem)]';

export const sectionHeading =
  'mb-[clamp(2.5rem,5vw,4.5rem)] flex items-end justify-between gap-8 [@media(max-width:768px)]:items-start';

export const sectionHeadingTitle =
  'mt-[0.6rem] font-display text-[clamp(3rem,7vw,6rem)] leading-[0.9] tracking-[-0.055em] [@media(max-width:768px)]:text-[3.2rem]';

export const sectionIndex =
  'text-[0.62rem] font-bold uppercase tracking-[0.22em] text-muted-foreground';

/** Status pill tinted by the project's own accent. */
export const projectStatus = [
  'border-[color-mix(in_srgb,var(--project-accent)_55%,hsl(var(--line)))]',
  'bg-[color-mix(in_srgb,var(--project-accent)_10%,transparent)]',
  'text-[color-mix(in_srgb,var(--project-accent)_82%,hsl(var(--ink)))]',
].join(' ');
