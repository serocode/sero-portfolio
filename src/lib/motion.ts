import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { prefersReducedMotion } from '$lib/utils/format';

export const MOTION_MS = 480;
export const ease = cubicOut;
const EASE_CSS = 'cubic-bezier(0.33, 1, 0.68, 1)';

const SLIDE = 28;

type SwapParams = { dir?: 1 | -1; out?: boolean; axis?: 'x' | 'y' };

export function swap(
	_node: Element,
	{ dir = 1, out = false, axis = 'x' }: SwapParams = {}
): TransitionConfig {
	if (prefersReducedMotion()) return { duration: 0 };
	const fn = axis === 'y' ? 'translateY' : 'translateX';
	const dist = axis === 'y' ? SLIDE / 3 : SLIDE;
	const outMs = Math.round(MOTION_MS * 0.4);
	if (out) {
		return {
			duration: outMs,
			easing: ease,
			css: (t, u) => `opacity: ${t}; transform: ${fn}(${-dir * dist * u}px)`
		};
	}
	const delay = Math.round(outMs * 0.6);
	return {
		delay,
		duration: MOTION_MS - delay,
		easing: ease,
		css: (t, u) => `opacity: ${t}; transform: ${fn}(${dir * dist * u}px)`
	};
}

export class HeightTween {
	#el: HTMLElement | undefined;
	#locked = false;
	#done: ((e: TransitionEvent) => void) | null = null;

	attach(el: HTMLElement | undefined) {
		this.#el = el;
	}

	lock() {
		const el = this.#el;
		if (!el || prefersReducedMotion()) return;
		el.style.height = `${el.offsetHeight}px`;
		el.style.overflow = 'hidden';
		this.#locked = true;
	}

	to(target: HTMLElement | null | undefined) {
		const el = this.#el;
		if (!el || !this.#locked) return;
		this.#locked = false;
		if (this.#done) el.removeEventListener('transitionend', this.#done);
		const end = () => {
			el.style.height = '';
			el.style.overflow = '';
			el.style.transition = '';
		};
		if (!target) return end();
		const height = target.offsetHeight;
		if (`${height}px` === el.style.height) return end();
		el.style.transition = `height ${MOTION_MS}ms ${EASE_CSS}`;
		requestAnimationFrame(() => {
			el.style.height = `${height}px`;
		});
		this.#done = (e) => {
			if (e.target !== el || e.propertyName !== 'height') return;
			el.removeEventListener('transitionend', this.#done as (e: TransitionEvent) => void);
			this.#done = null;
			end();
			window.dispatchEvent(new Event('layout-settled'));
		};
		el.addEventListener('transitionend', this.#done);
	}
}
