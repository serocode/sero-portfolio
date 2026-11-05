import type { Action } from 'svelte/action';
import { prefersReducedMotion } from '$lib/utils/format';

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
