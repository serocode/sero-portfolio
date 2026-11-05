import type { Action } from 'svelte/action';

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
