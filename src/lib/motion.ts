import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { prefersReducedMotion } from '$lib/utils/format';

/**
 * One motion spec for the site's UI transitions: the same duration and ease-out curve everywhere.
 * The CSS twin of `ease` is the `ease-smooth` Tailwind token in app.css (cubic-bezier(0.33, 1,
 * 0.68, 1) is ease-out-cubic, i.e. `cubicOut`). Keep the two in sync.
 */
export const MOTION_MS = 480;
export const ease = cubicOut;
const EASE_CSS = 'cubic-bezier(0.33, 1, 0.68, 1)';

/** How far content slides when it's swapped for the next (px). */
const SLIDE = 28;

type SwapParams = { dir?: 1 | -1; out?: boolean };

/**
 * Swap one "card" of content for the next, in the same grid cell: the old one slides out the way
 * you're going and fades quickly; the new one follows a beat later from the other side. The two
 * barely overlap, so text never sits on text. dir: +1 = next (content moves left), -1 = previous.
 *
 *   {#key key}<div in:swap={{ dir }} out:swap={{ dir, out: true }}>…</div>{/key}
 */
export function swap(_node: Element, { dir = 1, out = false }: SwapParams = {}): TransitionConfig {
	if (prefersReducedMotion()) return { duration: 0 };
	const outMs = Math.round(MOTION_MS * 0.4);
	if (out) {
		return {
			duration: outMs,
			easing: ease,
			css: (t, u) => `opacity: ${t}; transform: translateX(${-dir * SLIDE * u}px)`
		};
	}
	const delay = Math.round(outMs * 0.6);
	return {
		delay,
		duration: MOTION_MS - delay,
		easing: ease,
		css: (t, u) => `opacity: ${t}; transform: translateX(${dir * SLIDE * u}px)`
	};
}

/**
 * Smoothly resizes a container whose content is being swapped (instead of snapping to the new
 * height). Call `lock()` before the DOM updates, then `to(newContent)` once the new content is in.
 * The container should stack its children in one grid cell with `items-start` (so each child keeps
 * its own height). While animating it clips (so growing content is revealed, not spilled); after,
 * it goes back to `height: auto` so it stays responsive.
 */
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
		el.style.height = `${el.offsetHeight}px`; // mid-transition this is the animated height
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
		};
		el.addEventListener('transitionend', this.#done);
	}
}
