import type { Action } from 'svelte/action';
import { ease } from '$lib/motion';

/**
 * Scroll-driven "deck" for the Projects section (from the approved design).
 * Put it on the wrapper; every direct child with the class `.deck-card` is `position: sticky`
 * (offsets come from the card's CSS + `fitSticky`). As the next card slides over, the one beneath
 * scales down to 95% and dims to 90% brightness.
 *
 * Runs at every width, touch included — it only reads layout on `scroll`, so it never competes
 * with the browser's own touch scrolling. Turned off (cards stack normally) with
 * prefers-reduced-motion.
 */
export const deckScroll: Action<HTMLElement> = (node) => {
	const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
	let raf = 0;

	const run = () => {
		raf = 0;
		const cards = Array.from(node.querySelectorAll<HTMLElement>('.deck-card'));
		const flat = reduceMq.matches;
		// Content above this line is under the sticky site header.
		const headerBottom =
			document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
		cards.forEach((card, i) => {
			const next = cards[i + 1];
			let p = 0;
			if (!flat && next) {
				const cr = card.getBoundingClientRect();
				const nr = next.getBoundingClientRect();
				p = Math.max(0, Math.min(1, (cr.bottom - nr.top) / Math.max(1, cr.height)));
			}
			if (p === 0) {
				card.style.transform = '';
				card.style.filter = '';
				card.style.transformOrigin = '';
				return;
			}
			// A card taller than the viewport (phones) is stuck with its top above the screen.
			// Scale it around the first visible line rather than its off-screen top edge, so the
			// part you can see recedes in place instead of sliding up out of view.
			const stuckTop = Number.parseFloat(getComputedStyle(card).top) || 0;
			const originY = Math.max(0, headerBottom - stuckTop);
			card.style.transformOrigin = `50% ${originY.toFixed(0)}px`;
			// Same ease-out as the rest of the UI: the covered card recedes promptly as the next one
			// arrives, then settles — rather than shrinking at a constant rate.
			const k = ease(p);
			card.style.transform = `scale(${(1 - 0.05 * k).toFixed(4)})`;
			card.style.filter = `brightness(${(1 - 0.1 * k).toFixed(3)})`;
		});
	};
	const schedule = () => {
		if (!raf) raf = requestAnimationFrame(run);
	};

	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule, { passive: true });
	reduceMq.addEventListener('change', schedule);
	schedule();

	return {
		destroy() {
			cancelAnimationFrame(raf);
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			reduceMq.removeEventListener('change', schedule);
		}
	};
};
