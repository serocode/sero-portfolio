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
		} catch {}
		if (next === this.current) return;

		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) return this.#apply(next, false);

		if (!document.startViewTransition || !origin) return this.#apply(next, true);

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
