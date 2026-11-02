/**
 * Theme state. The initial value is set before first paint by the inline script in app.html
 * (so there's no white flash); this class picks it up, keeps it in sync, and remembers the
 * visitor's explicit choice in localStorage.
 *
 *   import { theme } from '$lib/theme.svelte';
 *   onMount(() => theme.init());     // once, in +layout.svelte
 *   theme.current                   // 'light' | 'dark'
 *   theme.toggle()
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
			if (!this.#stored()) this.#apply(e.matches ? 'dark' : 'light');
		};
		this.#mq.addEventListener('change', onSystemChange);
		return () => this.#mq?.removeEventListener('change', onSystemChange);
	}

	toggle() {
		this.set(this.current === 'dark' ? 'light' : 'dark');
	}

	set(next: ThemeName) {
		try {
			localStorage.setItem(KEY, next);
		} catch {
			/* private mode — still switch for this visit */
		}
		this.#apply(next);
	}

	#stored(): ThemeName | null {
		try {
			const v = localStorage.getItem(KEY);
			return v === 'light' || v === 'dark' ? v : null;
		} catch {
			return null;
		}
	}

	#apply(next: ThemeName) {
		this.current = next;
		const root = document.documentElement;
		root.classList.add('theme-switching');
		clearTimeout(this.#t);
		this.#t = setTimeout(() => root.classList.remove('theme-switching'), 260);
		root.dataset.theme = next;
		root.style.colorScheme = next;
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[next]);
	}
}

export const theme = new Theme();
