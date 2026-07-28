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

export const pageTop = 'pb-12 pt-[clamp(4rem,10vw,8.5rem)]';

export const archiveHeader = 'mb-[clamp(4rem,9vw,8rem)] max-w-[62rem]';

export const archiveHeaderTitle =
  'mt-6 font-display text-[clamp(5.5rem,15vw,12rem)] leading-[0.72] tracking-[-0.085em] [@media(max-width:520px)]:text-[5.2rem]';

export const archiveHeaderText =
  'mt-12 max-w-[40rem] text-[1.05rem] leading-loose text-muted-foreground';

/** Two-column archive header: title on the left, standfirst on the right. */
export const archiveHeaderSplit =
  'mb-[clamp(4rem,9vw,8rem)] grid grid-cols-[1fr_0.72fr] items-end gap-20 [@media(max-width:768px)]:grid-cols-[1fr] [@media(max-width:768px)]:gap-8';

export const archiveHeaderSplitText =
  'max-w-[40rem] text-[1.05rem] leading-loose text-muted-foreground [@media(max-width:768px)]:mt-4';

export const backLink = [
  'mb-[clamp(3rem,7vw,6rem)] inline-flex items-center gap-[0.45rem]',
  'text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted-foreground',
  '[&>svg]:w-[0.9rem] [&>svg]:transition-transform [&>svg]:duration-[180ms] [&>svg]:ease-[ease]',
  'hover:[&>svg]:-translate-x-[3px]',
].join(' ');

/** Display title shared by the note, photo and project detail headers. */
export const detailTitle =
  'font-display text-[clamp(3.3rem,8vw,7rem)] leading-[0.98] tracking-[-0.06em] text-balance [@media(max-width:520px)]:text-[3rem]';

export const articleDeck =
  'mx-auto mt-8 max-w-[44rem] text-[1.05rem] leading-[1.9] text-muted-foreground';

export const articleRule = 'mx-auto h-px w-[min(100%-2rem,1240px)] bg-line';

/** Narration player under a detail header. */
export const articleAudio = [
  'mx-auto mt-7 w-[min(100%,21rem)] border-y border-line py-[0.65rem]',
  '[&>button]:flex [&>button]:w-full [&>button]:items-center [&>button]:gap-3 [&>button]:text-left',
  '[&>button:disabled]:cursor-wait [&>button:disabled]:opacity-[0.58]',
  '[&_strong]:font-display [&_strong]:text-[0.9rem] [&_strong]:font-semibold',
  '[&_small]:flex [&_small]:items-center [&_small]:gap-[0.35rem] [&_small]:text-[0.52rem]',
  '[&_small]:uppercase [&_small]:tracking-[0.1em] [&_small]:text-muted-foreground',
  '[&_small_svg]:h-[0.7rem] [&_small_svg]:w-[0.7rem]',
  '[&>time]:mt-[0.45rem] [&>time]:block [&>time]:text-right [&>time]:font-mono',
  '[&>time]:text-[0.52rem] [&>time]:text-muted-foreground',
  '[&>p]:mt-2 [&>p]:text-left [&>p]:text-[0.62rem] [&>p]:text-accent',
].join(' ');

export const articleAudioIcon = [
  'grid h-[2.35rem] w-[2.35rem] flex-none place-items-center rounded-full border border-line',
  'transition-[color,border-color,background-color] duration-[180ms] ease-[ease]',
  'group-hover/audio:border-accent group-hover/audio:bg-accent group-hover/audio:text-white',
  'group-data-[state=playing]/audio:border-accent group-data-[state=playing]/audio:bg-accent',
  'group-data-[state=playing]/audio:text-white',
  '[&>svg]:h-[0.9rem] [&>svg]:w-[0.9rem]',
  'group-data-[state=loading]/audio:[&>svg]:animate-spinner',
].join(' ');

export const translationNotice = [
  'mt-8 grid max-w-[58rem] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4',
  'border border-memo/[0.72] bg-memo/[0.18] px-[1.15rem] py-4',
  '[&>svg]:w-4 [&>svg]:text-accent',
  'data-[state=loading]:[&>svg]:animate-[slow-spin_1.4s_linear_infinite]',
  'data-[state=error]:border-accent/50 data-[state=error]:bg-accent/[0.08]',
  '[&_strong]:font-display [&_strong]:text-base',
  '[&_p]:mt-[0.15rem] [&_p]:text-[0.72rem] [&_p]:text-muted-foreground',
  '[&>span]:text-[0.62rem] [&>span]:font-bold [&>span]:uppercase [&>span]:tracking-[0.08em]',
  '[&>span]:text-muted-foreground',
  '[@media(max-width:768px)]:grid-cols-[auto_1fr]',
  '[@media(max-width:768px)]:[&>span]:col-start-2 [@media(max-width:768px)]:[&>span]:w-max',
].join(' ');

export const articleMeta = [
  'mt-8 flex flex-wrap justify-center gap-6 text-[0.67rem] font-bold uppercase',
  'tracking-[0.12em] text-muted-foreground',
  '[&>span]:inline-flex [&>span]:items-center [&>span]:gap-[0.4rem]',
  '[&>a]:inline-flex [&>a]:items-center [&>a]:gap-[0.4rem] [&>a]:text-inherit [&>a]:no-underline',
  '[&>a]:transition-colors [&>a]:duration-[180ms] [&>a]:ease-[ease] hover:[&>a]:text-accent',
  '[&_svg]:w-[0.85rem]',
].join(' ');

/**
 * The reading column. Markdown and tiptap emit their own HTML, so everything
 * inside it is styled from here with descendant variants.
 */
export const mdxProse = [
  '[--mdx-body-font-size:clamp(1.05rem,1.5vw,1.18rem)]',
  'mx-auto mt-[clamp(4rem,9vw,7rem)] w-[min(100%-2rem,46rem)]',
  'font-display text-[length:var(--mdx-body-font-size)] leading-loose text-foreground',

  // the editor surface itself
  // :where() keeps the default block rhythm at low specificity so the heading
  // margins below still win, the way the old rule order did.
  '[&_[data-reader]]:outline-none [&_:where([data-reader])>*+*]:mt-[1.6rem]',
  '[&_[data-node-view-wrapper]]:my-11',
  '[&_[data-node-view-wrapper]_[data-node-view-content]>*]:my-0',
  '[&_.ProseMirror-selectednode]:outline-none',

  // headings
  '[&_:is(h1,h2,h3)]:font-display [&_:is(h1,h2,h3)]:leading-[1.25]',
  '[&_:is(h1,h2,h3)]:tracking-[-0.035em] [&_:is(h1,h2,h3)]:text-foreground',
  '[&_:is(h1,h2,h3)]:scroll-mt-28',
  '[&_h1]:mt-18 [&_h1]:text-[3rem]',
  '[&_h2]:mt-18 [&_h2]:text-[2.15rem]',
  '[&_h3]:mt-12 [&_h3]:text-[1.55rem]',

  // body copy
  '[&_:is(p,li)]:text-foreground/[0.88]',
  '[&_strong]:font-bold [&_strong]:text-foreground',
  '[&_a]:text-accent [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-[0.2em]',

  // lists
  '[&_:is(ul,ol)]:pl-[1.3rem] [&_ul]:list-none [&_ol]:list-decimal',
  '[&_ul_li]:relative',
  "[&_ul_li]:before:absolute [&_ul_li]:before:left-[-1.25rem]",
  '[&_ul_li]:before:top-[var(--mdx-body-font-size)] [&_ul_li]:before:-translate-y-1/2',
  "[&_ul_li]:before:text-[0.65rem] [&_ul_li]:before:leading-none [&_ul_li]:before:text-accent",
  "[&_ul_li]:before:content-['✦']",

  // quotes, rules, code
  '[&_blockquote]:my-12 [&_blockquote]:border-l-2 [&_blockquote]:border-accent',
  '[&_blockquote]:pl-6 [&_blockquote]:text-[1.35rem] [&_blockquote]:italic [&_blockquote]:leading-[1.7]',
  '[&_hr]:my-16 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-line',
  '[&_pre]:my-10 [&_pre]:overflow-x-auto [&_pre]:rounded-[0.3rem] [&_pre]:border [&_pre]:border-line',
  '[&_pre]:bg-ink [&_pre]:p-5 [&_pre]:font-code [&_pre]:text-[0.8rem] [&_pre]:leading-[1.7] [&_pre]:text-paper',
  '[&_:not(pre)>code]:rounded-[0.25rem] [&_:not(pre)>code]:border [&_:not(pre)>code]:border-line',
  '[&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-[0.32rem] [&_:not(pre)>code]:py-[0.1rem]',
  '[&_:not(pre)>code]:font-code [&_:not(pre)>code]:text-[0.82em]',

  // tables
  '[&_.tableWrapper]:my-11 [&_.tableWrapper]:ml-[50%] [&_.tableWrapper]:-translate-x-1/2',
  '[&_.tableWrapper]:w-[min(100vw-2rem,62rem)] [&_.tableWrapper]:overflow-x-auto',
  '[&_.tableWrapper]:rounded-[0.35rem] [&_.tableWrapper]:border [&_.tableWrapper]:border-line',
  '[&_.tableWrapper]:bg-background',
  '[&_table]:w-full [&_table]:min-w-[34rem] [&_table]:border-collapse',
  '[&_table]:font-sans [&_table]:text-[0.82rem] [&_table]:leading-[1.65]',
  '[&_:is(th,td)]:border-b [&_:is(th,td)]:border-r [&_:is(th,td)]:border-line',
  '[&_:is(th,td)]:px-4 [&_:is(th,td)]:py-[0.85rem] [&_:is(th,td)]:text-left [&_:is(th,td)]:align-top',
  '[&_:is(th,td):last-child]:border-r-0 [&_tr:last-child_td]:border-b-0',
  '[&_th]:bg-muted/[0.72] [&_th]:text-[0.68rem] [&_th]:font-extrabold [&_th]:uppercase',
  '[&_th]:tracking-[0.08em] [&_th]:text-foreground',
  '[&_tbody_tr]:transition-colors [&_tbody_tr]:duration-[160ms] [&_tbody_tr]:ease-[ease]',
  'hover:[&_tbody_tr]:bg-muted/[0.38]',
].join(' ');

/** Photo essays centre their short captions. */
export const mdxProsePhoto = 'text-center text-[1.2rem]';

export const articleEndMessage = [
  'text-center',
  '[&>span]:text-[0.6rem] [&>span]:font-extrabold [&>span]:tracking-[0.2em] [&>span]:text-accent',
  '[&>p]:mb-6 [&>p]:mt-4 [&>p]:font-display [&>p]:text-2xl',
  '[&>a]:border-b [&>a]:border-current [&>a]:text-[0.7rem]',
].join(' ');

export const articlePagination = [
  'mt-14 grid grid-cols-2 gap-4 text-left [@media(max-width:768px)]:grid-cols-1',
  '[&>a]:relative [&>a]:grid [&>a]:min-h-40 [&>a]:content-between [&>a]:border [&>a]:border-line',
  '[&>a]:bg-muted/20 [&>a]:p-5',
  '[&>a]:transition-[border-color,background-color,transform] [&>a]:duration-[180ms] [&>a]:ease-[ease]',
  'hover:[&>a]:-translate-y-0.5 hover:[&>a]:border-accent/65 hover:[&>a]:bg-memo/15',
  '[&>a:last-child]:text-right',
  '[&_small]:text-[0.57rem] [&_small]:font-[750] [&_small]:uppercase [&_small]:tracking-[0.14em]',
  '[&_small]:text-muted-foreground',
  '[&_strong]:my-[0.8rem] [&_strong]:max-w-[25rem] [&_strong]:font-display',
  '[&_strong]:text-[clamp(1.25rem,2.6vw,2rem)] [&_strong]:leading-[1.1]',
  '[&>a:last-child_strong]:ml-auto',
  '[&_svg]:w-4 [&_svg]:text-accent [&>a:last-child_svg]:ml-auto',
].join(' ');

export const commentsSection = [
  'mb-[clamp(4rem,8vw,7rem)] mt-[clamp(5rem,10vw,9rem)] max-w-[58rem]',
  'border-t border-line pt-[clamp(2rem,5vw,3.5rem)]',
].join(' ');

export const commentsHeading = [
  'grid max-w-[38rem] gap-[0.65rem]',
  '[&>span]:flex [&>span]:items-center [&>span]:gap-[0.45rem] [&>span]:text-[0.58rem]',
  '[&>span]:font-[750] [&>span]:uppercase [&>span]:tracking-[0.16em] [&>span]:text-accent',
  '[&>span>svg]:w-[0.85rem]',
  '[&>h2]:font-display [&>h2]:text-[clamp(2.2rem,5vw,3.8rem)] [&>h2]:font-[430]',
  '[&>h2]:leading-none [&>h2]:tracking-[-0.045em]',
  '[&>p]:text-[0.78rem] [&>p]:leading-[1.8] [&>p]:text-muted-foreground',
].join(' ');

export const commentsNotice = [
  'flex min-h-36 items-center justify-center gap-[0.65rem] border-y border-line',
  'text-[0.72rem] text-muted-foreground',
].join(' ');

export const commentsError = [
  'flex-col',
  '[&>a]:inline-flex [&>a]:items-center [&>a]:gap-[0.45rem] [&>a]:border-b [&>a]:border-current',
  '[&>a]:font-bold [&>a]:text-ink [&_svg]:w-[0.9rem]',
].join(' ');

const contactCard = 'relative overflow-hidden border border-line bg-paper';

export const contactWechat = [
  contactCard,
  'row-span-2 p-[clamp(1.25rem,3vw,2.5rem)] [@media(max-width:768px)]:row-auto',
  '[&_h3]:mt-[0.55rem] [&_h3]:font-display [&_h3]:text-[clamp(2rem,4vw,3.7rem)]',
  '[&_h3]:leading-none [&_h3]:tracking-[-0.055em]',
  '[&_p]:mt-4 [&_p]:max-w-[24rem] [&_p]:text-[0.85rem] [&_p]:leading-[1.8] [&_p]:text-muted-foreground',
].join(' ');

export const contactChannel = [
  contactCard,
  '[--channel-color:var(--accent)]',
  'flex min-h-[17rem] flex-col justify-between p-[clamp(1.25rem,3vw,2.25rem)]',
  'transition-[background-color,color,transform] duration-[250ms] ease-[ease]',
  'hover:translate-x-1 hover:bg-[hsl(var(--channel-color)/0.08)]',
  "before:absolute before:inset-y-0 before:left-0 before:w-[0.28rem] before:origin-bottom",
  'before:scale-y-0 before:bg-[hsl(var(--channel-color))] before:transition-transform',
  "before:duration-[280ms] before:ease-[ease] before:content-[''] hover:before:scale-y-100",
  '[&_h3]:mt-[0.55rem] [&_h3]:font-display [&_h3]:text-[clamp(2rem,4vw,3.7rem)]',
  '[&_h3]:leading-none [&_h3]:tracking-[-0.055em]',
  'hover:[&_svg]:translate-x-[2px] hover:[&_svg]:-translate-y-[2px]',
].join(' ');

export const contactCardHeading = [
  'mb-[clamp(2rem,5vw,4rem)] flex items-center justify-between',
  '[&>svg]:h-[1.2rem] [&>svg]:w-[1.2rem] [&>svg]:[stroke-width:1.4]',
].join(' ');

export const contactKicker =
  'text-[0.58rem] font-bold uppercase tracking-[0.2em] text-muted-foreground';

export const contactDestination = [
  'flex items-center justify-between border-t border-line pt-4',
  'text-[0.72rem] tracking-[0.08em] text-muted-foreground',
  '[&>svg]:h-4 [&>svg]:w-4 [&>svg]:transition-transform [&>svg]:duration-[180ms] [&>svg]:ease-[ease]',
].join(' ');

export const photoLedger = [
  'mb-[clamp(3rem,7vw,6rem)] grid grid-cols-[0.65fr_1.35fr] items-end gap-12',
  'border-y border-line py-5 [@media(max-width:768px)]:grid-cols-[1fr] [@media(max-width:768px)]:gap-6',
  '[&>div]:flex [&>div]:items-baseline [&>div]:justify-between [&>div]:gap-4',
  '[&>div>span]:text-[0.56rem] [&>div>span]:uppercase [&>div>span]:tracking-[0.16em]',
  '[&>div>span]:text-muted-foreground',
  '[&>div>strong]:font-display [&>div>strong]:text-[3.5rem] [&>div>strong]:font-[350]',
  '[&>div>strong]:leading-[0.8] [&>div>strong]:text-accent',
  '[&_dl]:grid [&_dl]:grid-cols-3 [&_dl]:gap-4',
  '[@media(max-width:768px)]:[&_dl]:gap-2 [@media(max-width:520px)]:[&_dl]:grid-cols-2',
  '[&_dl>div]:border-l [&_dl>div]:border-line [&_dl>div]:pl-4',
  '[@media(max-width:768px)]:[&_dl>div]:pl-[0.7rem]',
  '[@media(max-width:520px)]:[&_dl>div:last-child]:hidden',
  '[&_dt]:text-[0.56rem] [&_dt]:uppercase [&_dt]:tracking-[0.16em] [&_dt]:text-muted-foreground',
  '[&_dd]:mt-[0.45rem] [&_dd]:font-display [&_dd]:text-[1.15rem]',
].join(' ');
