/**
 * Shared Tailwind class strings for patterns used by several components. Keep each one a complete
 * literal string (Tailwind finds classes by scanning source text, so they can't be assembled).
 */

/** The content column: 1320px max, centred, fluid side gutters. */
export const wrap = 'mx-auto w-full max-w-[1320px] px-[clamp(20px,5vw,48px)]';

/** Vertical padding of a content section. */
export const sectionPad = 'py-[clamp(40px,5vw,68px)]';

/**
 * Full-screen section: at least the screen below the sticky header (svh stays put while mobile
 * toolbars collapse), content centred vertically, free to grow; snaps under the header.
 */
export const fullScreen =
	'flex min-h-[calc(100svh_-_var(--header-h))] snap-start flex-col justify-center';

/** Primary pill (inverse fill): accent fill + lift on hover, unless it's a disabled placeholder. */
export const btnPrimaryHover =
	'transition-[background-color,border-color,color,translate] duration-[180ms] ease-[ease] not-aria-disabled:hover:-translate-y-px not-aria-disabled:hover:bg-accent not-aria-disabled:hover:text-on-accent';

/** Outlined pill: ink border + text on hover. */
export const btnGhostHover =
	'transition-[background-color,border-color,color,translate] duration-[180ms] ease-[ease] not-aria-disabled:hover:border-ink not-aria-disabled:hover:text-ink';

/** Icon-only link: accent + small lift on hover. */
export const iconLink =
	'transition-[color,translate] duration-150 ease-[ease] not-aria-disabled:hover:-translate-y-0.5 not-aria-disabled:hover:text-accent-700';

/** Text link: accent on hover. */
export const textLink =
	'transition-[color,translate] duration-150 ease-[ease] not-aria-disabled:hover:text-accent-700';

/**
 * A box that holds a late-loading image (with `use:imageState` on the <img>, which sets
 * data-img = loading | loaded | error). It reserves the image's space; while loading it shows a
 * slow shimmer, on error a quiet tile with the frame's `data-fallback` label (the img keeps its
 * alt). Tweak per frame with --skel-inset (e.g. a phone bezel) and --skel-radius.
 * The frame must be positioned (relative/absolute).
 */
export const imgFrame =
	'has-[>img[data-img]:not([data-img=loaded])]:before:pointer-events-none has-[>img[data-img]:not([data-img=loaded])]:before:absolute has-[>img[data-img]:not([data-img=loaded])]:before:inset-[var(--skel-inset,0)] has-[>img[data-img]:not([data-img=loaded])]:before:z-1 has-[>img[data-img]:not([data-img=loaded])]:before:rounded-[var(--skel-radius,inherit)] has-[>img[data-img]:not([data-img=loaded])]:before:bg-chip ' +
	'has-[>img[data-img=loading]]:before:animate-shimmer has-[>img[data-img=loading]]:before:bg-[linear-gradient(100deg,transparent_30%,color-mix(in_srgb,var(--color-surface)_70%,transparent)_50%,transparent_70%)] has-[>img[data-img=loading]]:before:bg-size-[220%_100%] motion-reduce:has-[>img[data-img=loading]]:before:animate-none motion-reduce:has-[>img[data-img=loading]]:before:bg-none ' +
	'has-[>img[data-img=error]]:before:grid has-[>img[data-img=error]]:before:place-items-center has-[>img[data-img=error]]:before:p-2 has-[>img[data-img=error]]:before:text-center has-[>img[data-img=error]]:before:font-mono has-[>img[data-img=error]]:before:text-[11px] has-[>img[data-img=error]]:before:leading-[1.4] has-[>img[data-img=error]]:before:text-muted has-[>img[data-img=error]]:before:content-[attr(data-fallback)]';

/** The <img> inside an imgFrame: hidden until loaded, then fades in. */
export const imgFade =
	'transition-opacity duration-[350ms] ease-[ease] data-[img=error]:opacity-0 data-[img=loading]:opacity-0';

/**
 * A piece of a section that rises into place when the section arrives (use:reveal on the section,
 * which also needs the `group/reveal` class). Stagger with style:--reveal-i={0,1,2…}. Hidden only
 * while the section is fully off-screen, so the reset is never seen.
 */
export const revealItem =
	'transition-[opacity,translate] delay-[calc(var(--reveal-i,0)*70ms)] duration-[480ms] ease-smooth group-data-[reveal=out]/reveal:translate-y-6 group-data-[reveal=out]/reveal:opacity-0 group-data-[reveal=out]/reveal:transition-none';
