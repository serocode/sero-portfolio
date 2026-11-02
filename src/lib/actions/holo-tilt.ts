import type { Action } from 'svelte/action';

/**
 * Holographic tilt for the About photo card (from the approved design).
 * Writes --bg-x / --bg-y / --holo-o on the element and rotates it toward the input.
 * Pass `flipped` so the tilt and sheen mirror correctly when the back face is showing.
 *
 *   <div class="holo-tilt" use:holoTilt={{ flipped }}> … </div>
 *
 * Inputs:
 * - Mouse / pen: the card leans toward the pointer while hovering (the design's behaviour).
 * - Touch: press and drag on the card to tilt it. `touch-action: pan-y` keeps vertical drags
 *   scrolling the page (the browser cancels the gesture and the card springs back), and a drag
 *   never also flips the card — only a tap does.
 * - Device motion (phones/tablets): tilting the device tilts the card while it's on screen.
 *   Android starts straight away; iOS only grants motion access from a user gesture, so it's
 *   requested once, on the first tap of the card. Declining just leaves drag-to-tilt.
 *
 * Nothing moves with prefers-reduced-motion.
 */

type OrientationCtor = typeof DeviceOrientationEvent & {
	requestPermission?: () => Promise<'granted' | 'denied'>;
};

const MAX_DEG = 10;
/** Degrees of device tilt (from the resting pose) that map to a full card tilt. */
const DEVICE_RANGE = 18;
/** Pointer travel (px) before a touch counts as a drag rather than a tap. */
const DRAG_SLOP = 8;

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

export const holoTilt: Action<HTMLElement, { flipped: boolean }> = (node, params) => {
	let flipped = params?.flipped ?? false;
	const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
	const coarseMq = window.matchMedia('(hover: none) and (pointer: coarse)');

	/** nx / ny: input position relative to the card centre, -1…1 (x → right, y → down). */
	const render = (nx: number, ny: number, glow: number, transition: string) => {
		const bx = (nx + 1) * 50;
		const by = (ny + 1) * 50;
		node.style.transition = transition;
		node.style.transform = `perspective(1000px) rotateX(${(-ny * MAX_DEG).toFixed(2)}deg) rotateY(${((flipped ? -1 : 1) * nx * MAX_DEG).toFixed(2)}deg)`;
		node.style.setProperty('--bg-x', `${(flipped ? 100 - bx : bx).toFixed(1)}%`);
		node.style.setProperty('--bg-y', `${by.toFixed(1)}%`);
		node.style.setProperty('--holo-o', glow.toFixed(2));
	};
	const reset = () => render(0, 0, 0, 'transform .6s cubic-bezier(.2,.7,.2,1)');

	const fromPoint = (x: number, y: number) => {
		const r = node.getBoundingClientRect();
		if (!r.width || !r.height) return null;
		return {
			nx: clamp(((x - r.left) / r.width) * 2 - 1),
			ny: clamp(((y - r.top) / r.height) * 2 - 1)
		};
	};

	// ── Mouse / pen hover ──
	const hover = (e: PointerEvent) => {
		if (e.pointerType === 'touch' || reduceMq.matches) return;
		const p = fromPoint(e.clientX, e.clientY);
		if (p) render(p.nx, p.ny, 1, 'transform .08s linear');
	};
	const leave = (e: PointerEvent) => {
		if (e.pointerType !== 'touch') reset();
	};

	// ── Touch drag ──
	let touchId: number | null = null;
	let x0 = 0;
	let y0 = 0;
	let dragged = false;
	let draggedAt = -Infinity;

	const touchDown = (e: PointerEvent) => {
		if (e.pointerType !== 'touch' || !e.isPrimary || reduceMq.matches) return;
		touchId = e.pointerId;
		x0 = e.clientX;
		y0 = e.clientY;
		dragged = false;
		const p = fromPoint(e.clientX, e.clientY);
		// A soft "press" toward the finger, so even a tap feels physical.
		if (p) render(p.nx * 0.6, p.ny * 0.6, 0.8, 'transform .15s ease-out');
	};
	const touchMove = (e: PointerEvent) => {
		if (e.pointerId !== touchId) return;
		if (Math.hypot(e.clientX - x0, e.clientY - y0) > DRAG_SLOP) dragged = true;
		const p = fromPoint(e.clientX, e.clientY);
		if (p) render(p.nx, p.ny, 1, 'transform .08s linear');
	};
	const touchEnd = (e: PointerEvent) => {
		if (e.pointerId !== touchId) return;
		touchId = null;
		if (dragged && e.type === 'pointerup') draggedAt = performance.now();
		settle();
	};
	/** A drag that ends on the card must not also flip it. */
	const swallowDragClick = (e: MouseEvent) => {
		if (performance.now() - draggedAt > 400) return;
		draggedAt = -Infinity;
		e.preventDefault();
		e.stopPropagation();
	};

	// ── Device motion ──
	const Orientation = (
		'DeviceOrientationEvent' in window ? window.DeviceOrientationEvent : undefined
	) as OrientationCtor | undefined;
	const motionCapable = !!Orientation && coarseMq.matches;
	// iOS (and recent Chromium, where it resolves without a prompt) gate motion behind this.
	// We listen regardless — without permission no events arrive, so the listener just idles.
	const needsPermission = typeof Orientation?.requestPermission === 'function';
	let asked = false;
	/** Set by the first real reading — once motion is flowing there's nothing to ask for. */
	let gotReading = false;
	let inView = false;
	let listening = false;
	let rest: { x: number; y: number } | null = null;
	let last = { nx: 0, ny: 0 };

	const orient = (e: DeviceOrientationEvent) => {
		if (e.beta == null || e.gamma == null || reduceMq.matches) return;
		gotReading = true;
		// Map device axes to screen axes for the current orientation.
		const angle = screen.orientation?.angle ?? 0;
		let x = e.gamma;
		let y = e.beta;
		if (angle === 90) [x, y] = [e.beta, -e.gamma];
		else if (angle === 270 || angle === -90) [x, y] = [-e.beta, e.gamma];
		else if (angle === 180) [x, y] = [-e.gamma, -e.beta];
		// The resting pose is however the phone is being held; it drifts slowly to follow it.
		if (!rest) rest = { x, y };
		rest.x += (x - rest.x) * 0.02;
		rest.y += (y - rest.y) * 0.02;
		last = { nx: clamp((x - rest.x) / DEVICE_RANGE), ny: clamp((y - rest.y) / DEVICE_RANGE) };
		if (touchId !== null) return; // a finger on the card wins
		const glow = Math.min(1, 0.25 + Math.hypot(last.nx, last.ny));
		render(last.nx, last.ny, glow, 'transform .12s linear');
	};
	const syncMotion = () => {
		const want = motionCapable && inView && !reduceMq.matches;
		if (want === listening) return;
		listening = want;
		if (want) window.addEventListener('deviceorientation', orient);
		else {
			window.removeEventListener('deviceorientation', orient);
			rest = null;
			reset();
		}
	};
	/** After a touch: hand back to device motion if it's running, otherwise spring flat. */
	const settle = () => {
		if (listening) render(last.nx, last.ny, 0.5, 'transform .35s ease-out');
		else reset();
	};
	/**
	 * iOS: the permission prompt must come from a user gesture — the first tap on the card. Skipped
	 * once readings are already arriving (Android), and the answer never switches motion off: the
	 * listener stays attached and simply receives nothing if access was declined.
	 */
	const askForMotion = () => {
		if (!motionCapable || !needsPermission || asked || gotReading || reduceMq.matches) return;
		asked = true;
		Orientation?.requestPermission?.().catch(() => {});
	};

	const io = new IntersectionObserver(([entry]) => {
		inView = !!entry?.isIntersecting;
		syncMotion();
	});
	io.observe(node);

	node.style.touchAction = 'pan-y';
	node.addEventListener('pointermove', hover);
	node.addEventListener('pointerleave', leave);
	node.addEventListener('pointerdown', touchDown);
	node.addEventListener('pointermove', touchMove);
	node.addEventListener('pointerup', touchEnd);
	node.addEventListener('pointercancel', touchEnd);
	node.addEventListener('click', swallowDragClick, true);
	node.addEventListener('click', askForMotion);
	reduceMq.addEventListener('change', syncMotion);

	return {
		update(next) {
			flipped = next.flipped;
			if (listening) render(last.nx, last.ny, 0.5, 'transform .35s ease-out');
			else reset();
		},
		destroy() {
			io.disconnect();
			window.removeEventListener('deviceorientation', orient);
			node.removeEventListener('pointermove', hover);
			node.removeEventListener('pointerleave', leave);
			node.removeEventListener('pointerdown', touchDown);
			node.removeEventListener('pointermove', touchMove);
			node.removeEventListener('pointerup', touchEnd);
			node.removeEventListener('pointercancel', touchEnd);
			node.removeEventListener('click', swallowDragClick, true);
			node.removeEventListener('click', askForMotion);
			reduceMq.removeEventListener('change', syncMotion);
		}
	};
};
