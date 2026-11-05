const MIN_MS = 4;
const RATIO = 10;

type UAData = { brands: { brand: string }[] };

export function canWatchDevtools(): boolean {
	if (typeof window === 'undefined') return false;
	const nav = navigator as Navigator & { userAgentData?: UAData };
	if (nav.webdriver) return false;
	if (/bot|crawl|spider|slurp|lighthouse|headless/i.test(nav.userAgent)) return false;
	if (!nav.userAgentData?.brands.some((b) => /chromium/i.test(b.brand))) return false;
	return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

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
