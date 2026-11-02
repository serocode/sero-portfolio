import type { Action } from 'svelte/action';
import { prefersReducedMotion } from '$lib/utils/format';

/**
 * Section arrival: sets data-reveal on the section — "out" while it's fully off-screen, "in" once
 * its top passes 85% of the viewport — and its `revealItem` children (src/lib/ui.ts) rise into
 * place, staggered. It replays each time you come back to a section.
 *
 * Safe by default: nothing is hidden until this runs (no JS = everything visible), whatever is
 * on screen at load is marked "in" immediately (no flash), and reduced motion skips it entirely.
 */
export const reveal: Action<HTMLElement> = (node) => {
	if (prefersReducedMotion()) return;

	const r = node.getBoundingClientRect();
	node.dataset.reveal = r.top < innerHeight * 0.85 && r.bottom > 0 ? 'in' : 'out';

	const enter = new IntersectionObserver(
		([e]) => {
			if (e?.isIntersecting) node.dataset.reveal = 'in';
		},
		{ rootMargin: '0px 0px -15% 0px' }
	);
	// Only reset once it's completely out of view, so scrolling within a section never replays it.
	const exit = new IntersectionObserver(([e]) => {
		if (e && !e.isIntersecting) node.dataset.reveal = 'out';
	});
	enter.observe(node);
	exit.observe(node);

	return {
		destroy() {
			enter.disconnect();
			exit.disconnect();
			delete node.dataset.reveal;
		}
	};
};
