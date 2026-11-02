/**
 * Theme state. The initial value is set before first paint by the inline script in app.html
 * (so there's no white flash); this class picks it up, keeps it in sync, and remembers the
 * visitor's explicit choice in localStorage.
 *
 *   import { theme } from '$lib/theme.svelte';
 *   onMount(() => theme.init());     // once, in +layout.svelte
 *   theme.current                   // 'light' | 'dark'
 *   theme.toggle(buttonEl)          // animated: the new theme grows as a circle from buttonEl
 *
 * Only an explicit toggle animates. OS changes and page loads switch instantly.
 * Animation: View Transitions API circle reveal (650ms). Fallback: 220ms colour cross-fade.
 * Reduced motion: instant.
 */
export type ThemeName = 'light' | 'dark';
const KEY = 'theme';
const THEME_COLOR = { light: '#ffffff', dark: '#0b0f14' } as const;

class Theme {
	current = $state<ThemeName>('light');
	#mq: MediaQueryList | null = null;
	#t: ReturnType<typeof setTimeout> | undefined;

	init() {
		const root = document.documentElement;
		this.current = root.dataset.theme === 'dark' ? 'dark' : 'light';
		this.#mq = window.matchMedia('(prefers-color-scheme: dark)');
		const onSystemChange = (e: MediaQueryListEvent) => {
			if (!this.#stored()) this.#apply(e.matches ? 'dark' : 'light', false);
		};
		this.#mq.addEventListener('change', onSystemChange);
		return () => this.#mq?.removeEventListener('change', onSystemChange);
	}

	toggle(origin?: HTMLElement | null) {
		this.set(this.current === 'dark' ? 'light' : 'dark', origin);
	}

	set(next: ThemeName, origin?: HTMLElement | null) {
		try {
			localStorage.setItem(KEY, next);
		} catch {
			/* private mode — still switch for this visit */
		}
		if (next === this.current) return;

		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) return this.#apply(next, false);

		// Fallback: quick colour cross-fade.
		if (!document.startViewTransition || !origin) return this.#apply(next, true);

		// Circle reveal from the centre of the button.
		const r = origin.getBoundingClientRect();
		const x = r.left + r.width / 2;
		const y = r.top + r.height / 2;
		const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
		const root = document.documentElement;
		root.classList.add('theme-vt');
		const vt = document.startViewTransition(() => this.#apply(next, false));
		vt.ready.then(() => {
			root.animate(
				{ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
				{
					duration: 650,
					easing: 'cubic-bezier(.7, 0, .3, 1)',
					pseudoElement: '::view-transition-new(root)'
				}
			);
		});
		vt.finished.finally(() => root.classList.remove('theme-vt'));
	}

	#stored(): ThemeName | null {
		try {
			const v = localStorage.getItem(KEY);
			return v === 'light' || v === 'dark' ? v : null;
		} catch {
			return null;
		}
	}

	#apply(next: ThemeName, fade: boolean) {
		this.current = next;
		const root = document.documentElement;
		if (fade) {
			root.classList.add('theme-switching');
			clearTimeout(this.#t);
			this.#t = setTimeout(() => root.classList.remove('theme-switching'), 260);
		}
		root.dataset.theme = next;
		root.style.colorScheme = next;
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[next]);
	}
}

export const theme = new Theme();
