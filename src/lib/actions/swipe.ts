import type { Action } from 'svelte/action';

type SwipeParams = {
	onSwipe: (direction: 1 | -1) => void;
	enabled?: boolean;
};

const MIN_DX = 40;
const RATIO = 1.5;

export const swipe: Action<HTMLElement, SwipeParams> = (node, params) => {
	let opts = params;
	let pointer: number | null = null;
	let x0 = 0;
	let y0 = 0;
	let swipedAt = -Infinity;

	const apply = () => {
		node.style.touchAction = opts.enabled === false ? '' : 'pan-y pinch-zoom';
	};

	const down = (e: PointerEvent) => {
		if (opts.enabled === false || e.pointerType !== 'touch' || !e.isPrimary) return;
		pointer = e.pointerId;
		x0 = e.clientX;
		y0 = e.clientY;
	};
	const up = (e: PointerEvent) => {
		if (e.pointerId !== pointer) return;
		pointer = null;
		const dx = e.clientX - x0;
		const dy = e.clientY - y0;
		if (Math.abs(dx) < MIN_DX || Math.abs(dx) < Math.abs(dy) * RATIO) return;
		swipedAt = performance.now();
		opts.onSwipe(dx < 0 ? 1 : -1);
	};
	const cancel = (e: PointerEvent) => {
		if (e.pointerId === pointer) pointer = null;
	};
	const click = (e: MouseEvent) => {
		if (performance.now() - swipedAt > 400) return;
		swipedAt = -Infinity;
		e.preventDefault();
		e.stopPropagation();
	};

	apply();
	node.addEventListener('pointerdown', down);
	node.addEventListener('pointerup', up);
	node.addEventListener('pointercancel', cancel);
	node.addEventListener('click', click, true);

	return {
		update(next) {
			opts = next;
			apply();
		},
		destroy() {
			node.removeEventListener('pointerdown', down);
			node.removeEventListener('pointerup', up);
			node.removeEventListener('pointercancel', cancel);
			node.removeEventListener('click', click, true);
		}
	};
};
