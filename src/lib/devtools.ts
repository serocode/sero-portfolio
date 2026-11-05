/**
 * Notices when the browser's DevTools are open. A visual deterrent, NOT protection: the site's
 * HTML, CSS and JS are public whatever this does (view-source, curl, another browser, or simply
 * disabling JavaScript all get past it).
 *
 * Signal: while DevTools is attached (docked or undocked, whatever panel is showing), Chrome builds
 * a full preview of every object passed to `console.table`. A wide table costs ~0ms with DevTools
 * closed and ~15–25ms with it open, while `console.log` of the same rows (a shallow preview) stays
 * cheap either way, so it calibrates for a slow or busy machine. The console is cleared right after
 * each probe, so the tables never pile up.
 *
 * Window geometry (outer vs inner size) is NOT used as a verdict: browser zoom, side panels and
 * window chrome make it a false-positive machine. A resize only triggers an early probe, so
 * docking DevTools (which shrinks the viewport) is noticed at once instead of on the next tick.
 *
 * Limited to desktop Chromium browsers (the timing is only reliable there), and off for automation
 * and crawlers (tests, Lighthouse, search engines attach a debugger too, and must see the real site).
 */

/** A table must take at least this long, and this many times longer than a log, to count. */
const MIN_MS = 4;
const RATIO = 10;

type UAData = { brands: { brand: string }[] };

/** Whether to watch at all: desktop Chromium, a real visitor. */
export function canWatchDevtools(): boolean {
	if (typeof window === 'undefined') return false;
	const nav = navigator as Navigator & { userAgentData?: UAData };
	if (nav.webdriver) return false;
	if (/bot|crawl|spider|slurp|lighthouse|headless/i.test(nav.userAgent)) return false;
	if (!nav.userAgentData?.brands.some((b) => /chromium/i.test(b.brand))) return false;
	return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/**
 * Calls `onChange(true | false)` when DevTools opens or closes (only on a change). `whileOpen`
 * runs after each probe while open, to re-print a console message the probe's clear wiped.
 * Probes once a second (paused while the tab is hidden) and soon after a resize.
 * Returns a cleanup function.
 */
export function watchDevtools({
	onChange,
	whileOpen,
	interval = 1000
}: {
	onChange: (open: boolean) => void;
	whileOpen?: () => void;
	interval?: number;
}): () => void {
	const row: Record<string, number> = {};
	for (let i = 0; i < 500; i++) row[i] = i;
	const rows = Array.from({ length: 50 }, () => row);

	let open = false;
	let timer: ReturnType<typeof setInterval> | undefined;
	let resizeTimer: ReturnType<typeof setTimeout> | undefined;
	let raf = 0;

	const probe = () => {
		let t = performance.now();
		console.table(rows);
		const table = performance.now() - t;
		t = performance.now();
		console.log(rows);
		const log = performance.now() - t;
		console.clear();
		return table > MIN_MS && table > log * RATIO;
	};
	const settle = (hit: boolean) => {
		if (hit !== open) {
			open = hit;
			onChange(open);
		}
		if (open) whileOpen?.();
	};
	const check = () => {
		if (raf) return;
		const hit = probe();
		if (hit && !open) {
			// Confirm on the next frame, so one slow frame (a GC pause) can't flash the screen.
			raf = requestAnimationFrame(() => {
				raf = 0;
				settle(probe());
			});
			return;
		}
		settle(hit);
	};

	const start = () => {
		clearInterval(timer);
		timer = setInterval(check, interval);
		check();
	};
	const onVisibility = () => {
		if (document.hidden) clearInterval(timer);
		else start();
	};
	const onResize = () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(check, 150);
	};

	if (!document.hidden) start();
	document.addEventListener('visibilitychange', onVisibility);
	window.addEventListener('resize', onResize, { passive: true });

	return () => {
		clearInterval(timer);
		clearTimeout(resizeTimer);
		cancelAnimationFrame(raf);
		document.removeEventListener('visibilitychange', onVisibility);
		window.removeEventListener('resize', onResize);
	};
}
