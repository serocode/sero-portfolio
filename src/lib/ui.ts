export const wrap = 'mx-auto w-full max-w-[1320px] px-[clamp(20px,5vw,48px)]';

export const sectionPad = 'py-[clamp(40px,5vw,68px)]';

export const fullScreen =
	'flex min-h-[calc(100svh_-_var(--header-h))] snap-start flex-col justify-center';

export const btnPrimaryHover =
	'transition-[background-color,border-color,color,translate] duration-[180ms] ease-[ease] not-aria-disabled:hover:-translate-y-px not-aria-disabled:hover:bg-accent not-aria-disabled:hover:text-on-accent';

export const btnGhostHover =
	'transition-[background-color,border-color,color,translate] duration-[180ms] ease-[ease] not-aria-disabled:hover:border-ink not-aria-disabled:hover:text-ink';

export const iconLink =
	'transition-[color,translate] duration-150 ease-[ease] not-aria-disabled:hover:-translate-y-0.5 not-aria-disabled:hover:text-accent-700';

export const textLink =
	'transition-[color,translate] duration-150 ease-[ease] not-aria-disabled:hover:text-accent-700';

export const imgFrame =
	'has-[>img[data-img]:not([data-img=loaded])]:before:pointer-events-none has-[>img[data-img]:not([data-img=loaded])]:before:absolute has-[>img[data-img]:not([data-img=loaded])]:before:inset-[var(--skel-inset,0)] has-[>img[data-img]:not([data-img=loaded])]:before:z-1 has-[>img[data-img]:not([data-img=loaded])]:before:rounded-[var(--skel-radius,inherit)] has-[>img[data-img]:not([data-img=loaded])]:before:bg-chip ' +
	'has-[>img[data-img=loading]]:before:animate-shimmer has-[>img[data-img=loading]]:before:bg-[linear-gradient(100deg,transparent_30%,color-mix(in_srgb,var(--color-surface)_70%,transparent)_50%,transparent_70%)] has-[>img[data-img=loading]]:before:bg-size-[220%_100%] motion-reduce:has-[>img[data-img=loading]]:before:animate-none motion-reduce:has-[>img[data-img=loading]]:before:bg-none ' +
	'has-[>img[data-img=error]]:before:grid has-[>img[data-img=error]]:before:place-items-center has-[>img[data-img=error]]:before:p-2 has-[>img[data-img=error]]:before:text-center has-[>img[data-img=error]]:before:font-mono has-[>img[data-img=error]]:before:text-[11px] has-[>img[data-img=error]]:before:leading-[1.4] has-[>img[data-img=error]]:before:text-muted has-[>img[data-img=error]]:before:content-[attr(data-fallback)]';

export const imgFade =
	'transition-opacity duration-[350ms] ease-[ease] data-[img=error]:opacity-0 data-[img=loading]:opacity-0';

export const revealItem =
	'transition-[opacity,translate] delay-[calc(var(--reveal-i,0)*70ms)] duration-[480ms] ease-smooth group-data-[reveal=out]/reveal:translate-y-6 group-data-[reveal=out]/reveal:opacity-0 group-data-[reveal=out]/reveal:transition-none';
