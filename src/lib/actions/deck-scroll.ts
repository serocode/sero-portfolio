import type { Action } from 'svelte/action';
import { ease } from '$lib/motion';

export const deckScroll: Action<HTMLElement> = (node) => {
	const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
	let raf = 0;

	const run = () => {
		raf = 0;
		const cards = Array.from(node.querySelectorAll<HTMLElement>('.deck-card'));
		const flat = reduceMq.matches;
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
			const stuckTop = Number.parseFloat(getComputedStyle(card).top) || 0;
			const originY = Math.max(0, headerBottom - stuckTop);
			card.style.transformOrigin = `50% ${originY.toFixed(0)}px`;
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
