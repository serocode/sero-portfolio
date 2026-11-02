import type { Action } from 'svelte/action';

/**
 * Publishes a deck card's layout height as `--card-h`, which the card's CSS uses to pick a
 * sticky `top` that never hides its bottom edge:
 *
 *   top: min(var(--deck-top), 100svh - var(--card-h) - 24px)
 *
 * When the card fits under its preferred offset (`--deck-top`, a stair-step per index) it sticks
 * there; when it's taller than the space left in the viewport (always the case on phones), it
 * sticks with its bottom 24px above the fold instead, so the links at the bottom of a tall card
 * are reachable before the next card slides over it.
 *
 * The viewport maths lives in CSS on purpose: `100svh` (the small viewport) doesn't change as a
 * mobile browser's toolbars collapse during a scroll, so stuck cards don't jump, and no resize
 * listener is needed. Layout height ignores the deck's scale transform, so this never feeds back.
 */
export const fitSticky: Action<HTMLElement> = (node) => {
	const ro = new ResizeObserver(([entry]) => {
		const h = entry?.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight;
		node.style.setProperty('--card-h', `${Math.ceil(h)}px`);
	});
	ro.observe(node);

	return {
		destroy() {
			ro.disconnect();
		}
	};
};
