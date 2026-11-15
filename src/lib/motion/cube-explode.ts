/**
 * Scroll-driven exploded view for the hero Rubik's cube.
 *
 * One GSAP timeline, scrubbed by ScrollTrigger across the hero's scroll runway: corners leave
 * first, then edges, then centres; the core barely moves. Each cubie's tween writes only its
 * `t` (0 → 1) into the scene's `explosion` state — the scene turns that into an offset and a
 * turn on top of the cubie's pose every frame. Scrolling back runs the same timeline backwards,
 * so the cube reassembles to exactly where it was.
 *
 * Client only; pass in the lazily imported gsap + ScrollTrigger.
 */
import type { CubeExplosion } from '$lib/three/hero-scene';

type Gsap = typeof import('gsap').gsap;
type ScrollTriggerT = typeof import('gsap/ScrollTrigger').ScrollTrigger;

const RING_DELAY = [0, 0.16, 0.32, 0.4]; // corner · edge · centre · core
const PIECE_DUR = 1;

export function bindCubeExplosion({
	gsap,
	ScrollTrigger,
	trigger,
	explosion,
	onProgress
}: {
	gsap: Gsap;
	ScrollTrigger: ScrollTriggerT;
	trigger: HTMLElement;
	explosion: CubeExplosion;
	onProgress?: (p: number) => void;
}) {
	gsap.registerPlugin(ScrollTrigger);
	const headerH = () =>
		Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) ||
		65;

	const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
	explosion.cubelets.forEach((piece, i) => {
		// A little per-piece jitter (deterministic: derived from the index) so a ring doesn't move
		// as one block.
		const jitter = ((i * 37) % 11) / 11;
		tl.to(piece, { t: 1, duration: PIECE_DUR }, RING_DELAY[explosion.ring[i]] + jitter * 0.1);
	});
	tl.to(explosion.overall, { t: 1, duration: tl.duration(), ease: 'none' }, 0);

	const st = ScrollTrigger.create({
		trigger,
		start: () => `top ${headerH()}px`,
		end: 'bottom bottom',
		animation: tl,
		scrub: 0.7,
		invalidateOnRefresh: false,
		onUpdate: (self) => onProgress?.(self.progress)
	});

	return {
		kill() {
			st.kill();
			tl.kill();
			for (const c of explosion.cubelets) c.t = 0;
			explosion.overall.t = 0;
		}
	};
}
