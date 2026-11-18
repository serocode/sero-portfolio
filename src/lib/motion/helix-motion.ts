/**
 * Motion for the projects helix: turns scroll, drag and touch into one position along the
 * helix (a float project index) and feeds it to the scene every frame.
 *
 * - Scroll (ScrollTrigger over the pinned track) is the source of truth. Progress maps to the
 *   position through detents: each project holds still for the first and last 18% of its step,
 *   so wherever the page rests, a project sits squarely in focus. Page scrolling itself is
 *   never taken over.
 * - Drag / touch (GSAP Observer on the canvas, horizontal only — vertical swipes still scroll
 *   the page) and horizontal wheel/trackpad add an offset on top. On release the velocity is
 *   projected forward, the nearest project is chosen, and the page is moved (instantly — the
 *   stage is pinned, so nothing visible jumps) to that project's scroll position.
 * - The displayed position chases the target with exponential smoothing: momentum on the way,
 *   friction as it settles. The ticker only runs while the stage is on screen.
 * - `onFocus` fires only when the nearest project changes (no per-frame UI updates).
 *
 * Client only; pass in the lazily imported gsap, ScrollTrigger and Observer.
 */
import type { HelixScene } from '$lib/three/helix-scene';

type Gsap = typeof import('gsap').gsap;
type ScrollTriggerT = typeof import('gsap/ScrollTrigger').ScrollTrigger;
type ObserverT = typeof import('gsap/Observer').Observer;

const DWELL = 0.18;
const FOLLOW = 6.5; // smoothing rate (1/s): higher = snappier
const PROJECT = 0.28; // seconds of release velocity carried into the choice of the next card
const RUBBER = 0.3; // how far past the first/last card a drag may pull

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export type HelixMotion = {
	/** Bring project `i` into focus (moves the page to its scroll position). */
	go: (i: number) => void;
	kill: () => void;
};

export function createHelixMotion({
	gsap,
	ScrollTrigger,
	Observer,
	scene,
	track,
	stage,
	canvas,
	count,
	onFocus,
	onOpen,
	onPosition
}: {
	gsap: Gsap;
	ScrollTrigger: ScrollTriggerT;
	Observer: ObserverT;
	scene: HelixScene;
	track: HTMLElement;
	stage: HTMLElement;
	canvas: HTMLCanvasElement;
	count: number;
	onFocus: (i: number) => void;
	onOpen: (i: number) => void;
	/** Every frame the position changes (float index), for progress UI. */
	onPosition?: (pos: number) => void;
}): HelixMotion {
	gsap.registerPlugin(ScrollTrigger, Observer);
	const last = count - 1;
	const headerH = () =>
		Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) ||
		65;

	const detent = (progress: number) => {
		const x = clamp(progress, 0, 1) * last;
		const i = Math.min(Math.floor(x), last - 1);
		const g = clamp((x - i - DWELL) / (1 - 2 * DWELL), 0, 1);
		return i + g * g * (3 - 2 * g);
	};

	let scrollPos = 0;
	let drag = 0;
	let current = 0;
	let speed = 0;
	let focus = 0;
	let dragging = false;
	let moved = false;

	const st = ScrollTrigger.create({
		trigger: track,
		start: () => `top ${headerH()}px`,
		end: 'bottom bottom',
		onUpdate: (self) => {
			scrollPos = detent(self.progress);
		},
		onRefresh: (self) => {
			scrollPos = detent(self.progress);
		}
	});
	scrollPos = detent(st.progress);
	current = scrollPos;
	focus = Math.round(current);
	onFocus(focus);
	onPosition?.(current);

	const scrollTopFor = (i: number) => st.start + (clamp(i, 0, last) / last) * (st.end - st.start);

	const go = (i: number) => {
		const k = clamp(Math.round(i), 0, last);
		const top = scrollTopFor(k);
		drag = 0;
		// Inside the pinned range the stage doesn't move, so jump the page and let the helix glide.
		const pinned = window.scrollY >= st.start - 2 && window.scrollY <= st.end + 2;
		window.scrollTo({ top, behavior: pinned ? 'instant' : 'smooth' });
		if (pinned) scrollPos = k;
	};

	const release = (velocity: number) => {
		const target = scrollPos + drag;
		go(target + velocity * PROJECT);
	};

	// ── Ticker: smooth toward target, hand the position to the scene ───────────────────
	const tick = (_t: number, deltaMs: number) => {
		const dt = Math.min(deltaMs / 1000, 0.05);
		const target = clamp(scrollPos + drag, -RUBBER, last + RUBBER);
		const prev = current;
		current += (target - current) * (1 - Math.exp(-dt * FOLLOW));
		if (Math.abs(target - current) < 1e-4) current = target;
		speed = dt > 0 ? (current - prev) / dt : 0;
		scene.frame(current, speed, dt);
		if (current !== prev) onPosition?.(current);
		const f = clamp(Math.round(current), 0, last);
		if (f !== focus) {
			focus = f;
			onFocus(f);
		}
	};
	let ticking = false;
	const setTicking = (on: boolean) => {
		if (on === ticking) return;
		ticking = on;
		if (on) gsap.ticker.add(tick);
		else gsap.ticker.remove(tick);
	};
	const io = new IntersectionObserver(([e]) => setTicking(!!e?.isIntersecting));
	io.observe(stage);
	// The cards assemble once, when enough of the stage is on screen to see it happen.
	const introIo = new IntersectionObserver(
		([e]) => {
			if (!e || e.intersectionRatio < 0.35) return;
			introIo.disconnect();
			scene.intro();
		},
		{ threshold: [0, 0.35] }
	);
	introIo.observe(stage);

	// ── Drag / touch on the canvas ────────────────────────────────────────────────────
	const pxPerCard = () => Math.max(220, canvas.clientWidth * 0.42);
	const dragObs = Observer.create({
		target: canvas,
		type: 'pointer,touch',
		dragMinimum: 4,
		lockAxis: true,
		onPress: () => {
			moved = false;
		},
		onLockAxis: (self) => {
			// Vertical: leave it to the page (touch-action: pan-y does the scrolling).
			if (self.axis === 'y') return;
			dragging = true;
			canvas.dataset.dragging = '';
		},
		onDrag: (self) => {
			if (!dragging) return;
			moved = true;
			drag -= self.deltaX / pxPerCard();
		},
		onDragEnd: (self) => {
			if (!dragging) return;
			dragging = false;
			delete canvas.dataset.dragging;
			release(-self.velocityX / pxPerCard());
		}
	});

	// Horizontal wheel / two-finger trackpad swipes turn the helix; vertical wheel scrolls.
	let wheelIdle = 0;
	const onWheel = (e: WheelEvent) => {
		if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 1) return;
		e.preventDefault();
		drag += e.deltaX / pxPerCard();
		clearTimeout(wheelIdle);
		wheelIdle = window.setTimeout(() => release(0), 140);
	};
	canvas.addEventListener('wheel', onWheel, { passive: false });

	// ── Click: open the focused card, bring any other card forward ─────────────────────
	const onClick = (e: MouseEvent) => {
		if (moved) return;
		const i = scene.pick(e.clientX, e.clientY);
		if (i < 0) return;
		if (i === focus && Math.abs(current - focus) < 0.25) onOpen(i);
		else go(i);
	};
	canvas.addEventListener('click', onClick);

	// ── Pointer parallax + hover (mouse only) ─────────────────────────────────────────
	let hoverRaf = 0;
	let lastMove: PointerEvent | null = null;
	const onMove = (e: PointerEvent) => {
		if (e.pointerType !== 'mouse') return;
		const r = stage.getBoundingClientRect();
		scene.setPointer((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
		lastMove = e;
		if (!hoverRaf)
			hoverRaf = requestAnimationFrame(() => {
				hoverRaf = 0;
				if (!lastMove || dragging) return;
				const onCanvas = lastMove.target === canvas;
				const i = onCanvas ? scene.pick(lastMove.clientX, lastMove.clientY) : -1;
				scene.setHover(i);
				canvas.dataset.hover = i >= 0 ? (i === focus ? 'open' : 'go') : '';
			});
	};
	const onLeave = () => {
		scene.setPointer(null);
		scene.setHover(-1);
		canvas.dataset.hover = '';
	};
	stage.addEventListener('pointermove', onMove, { passive: true });
	stage.addEventListener('pointerleave', onLeave);

	// Layout above changed height (tab panels, images) → re-measure the track.
	const onSettled = () => st.refresh();
	window.addEventListener('layout-settled', onSettled);

	return {
		go,
		kill() {
			setTicking(false);
			io.disconnect();
			introIo.disconnect();
			st.kill();
			dragObs.kill();
			clearTimeout(wheelIdle);
			cancelAnimationFrame(hoverRaf);
			canvas.removeEventListener('wheel', onWheel);
			canvas.removeEventListener('click', onClick);
			stage.removeEventListener('pointermove', onMove);
			stage.removeEventListener('pointerleave', onLeave);
			window.removeEventListener('layout-settled', onSettled);
		}
	};
}
