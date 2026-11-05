/**
 * Hero 3D scene — ported 1:1 from the approved design prototype.
 * A breathing sphere of 4,200 points (grey → orange where the ripple peaks), a dotted orbit ring,
 * and an orange comet with a fading trail that circles the ring. Follows the pointer gently.
 *
 * Usage (client only):  const scene = createHeroScene(canvas);  …  scene.dispose();
 * A second copy (the DevTools screen, StrangerScreen.svelte) passes { publishComet: false } so it
 * doesn't move the hero comet that live drafting launches from (src/lib/three/comet.ts).
 * Load it with a dynamic import inside onMount so three.js stays out of the initial bundle.
 *
 * Theme-aware: colours come from the CSS variables --scene-base, --scene-peak, --scene-ring and
 * --color-accent (see src/lib/styles/theme.css). The scene watches <html data-theme> and recolours
 * itself when the theme changes — no wiring needed.
 */
import {
	BufferAttribute,
	BufferGeometry,
	Clock,
	Color,
	Group,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	Scene,
	ShaderMaterial,
	Vector3,
	WebGLRenderer
} from 'three';
import { comet as cometPos } from './comet';

export type HeroScene = { dispose: () => void };

const FALLBACK = { accent: '#f97316', base: '#b4bcc6', peak: '#ea580c', ring: '#9aa3ad' };

function readPalette() {
	const css = getComputedStyle(document.documentElement);
	const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
	return {
		accent: v('--color-accent', FALLBACK.accent),
		base: v('--scene-base', FALLBACK.base),
		peak: v('--scene-peak', FALLBACK.peak),
		ring: v('--scene-ring', FALLBACK.ring)
	};
}
const CAMERA_Z = 8.2;
const RING_RADIUS = 2.25;

export function createHeroScene(
	canvas: HTMLCanvasElement,
	{ publishComet: publish = true }: { publishComet?: boolean } = {}
): HeroScene {
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	renderer.setClearColor(0xffffff, 0);

	const palette = readPalette();
	const scene = new Scene();
	const camera = new PerspectiveCamera(35, 1, 0.1, 100);
	camera.position.set(0, 0, CAMERA_Z);
	const group = new Group();
	scene.add(group);

	// ── Sphere: Fibonacci-distributed points ───────────────────────────────
	const N = 4200;
	const pos = new Float32Array(N * 3);
	const seed = new Float32Array(N);
	const golden = Math.PI * (3 - Math.sqrt(5));
	for (let i = 0; i < N; i++) {
		const y = 1 - (i / (N - 1)) * 2;
		const r = Math.sqrt(1 - y * y);
		const th = golden * i;
		pos[i * 3] = Math.cos(th) * r;
		pos[i * 3 + 1] = y;
		pos[i * 3 + 2] = Math.sin(th) * r;
		seed[i] = Math.random();
	}
	const geo = new BufferGeometry();
	geo.setAttribute('position', new BufferAttribute(pos, 3));
	geo.setAttribute('aSeed', new BufferAttribute(seed, 1));

	const uniforms = {
		uTime: { value: 0 },
		uPR: { value: renderer.getPixelRatio() },
		uCam: { value: CAMERA_Z },
		uA: { value: new Color(palette.accent) },
		uB: { value: new Color(palette.base) },
		uC: { value: new Color(palette.peak) }
	};
	const mat = new ShaderMaterial({
		uniforms,
		transparent: true,
		depthWrite: false,
		vertexShader: /* glsl */ `
			uniform float uTime; uniform float uPR; uniform float uCam;
			attribute float aSeed;
			varying float vMix; varying float vFade;
			void main() {
				vec3 p = position;
				float d = sin(3.1 * p.x + uTime * 0.9) * sin(2.7 * p.y + uTime * 1.1) * sin(3.3 * p.z + uTime * 0.7);
				d += 0.5 * sin(6.0 * p.y - uTime * 1.4 + p.x * 2.0);
				vec3 q = p * (1.65 + 0.16 * d);
				vec4 mv = modelViewMatrix * vec4(q, 1.0);
				gl_Position = projectionMatrix * mv;
				vMix = clamp(0.45 + d * 0.9 + p.y * 0.2, 0.0, 1.0);
				gl_PointSize = (2.2 + 2.6 * aSeed * aSeed) * (1.0 + 0.45 * smoothstep(0.6, 0.85, vMix)) * uPR * (7.0 / -mv.z);
				vFade = clamp((mv.z + uCam + 1.8) / 3.5, 0.22, 1.0);
			}`,
		fragmentShader: /* glsl */ `
			uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
			varying float vMix; varying float vFade;
			void main() {
				float r = length(gl_PointCoord - 0.5);
				if (r > 0.5) discard;
				float a = smoothstep(0.5, 0.32, r) * vFade;
				vec3 c = mix(uB, uA, smoothstep(0.58, 0.72, vMix));
				c = mix(c, uC, smoothstep(0.93, 1.0, vMix));
				gl_FragColor = vec4(c, a);
				#include <colorspace_fragment>
			}`
	});
	group.add(new Points(geo, mat));

	// ── Orbit ring ─────────────────────────────────────────────────────────
	const M = 420;
	const rp = new Float32Array(M * 3);
	for (let j = 0; j < M; j++) {
		const ang = (j / M) * Math.PI * 2;
		rp[j * 3] = Math.cos(ang) * RING_RADIUS;
		rp[j * 3 + 2] = Math.sin(ang) * RING_RADIUS;
	}
	const rg = new BufferGeometry();
	rg.setAttribute('position', new BufferAttribute(rp, 3));
	const rm = new PointsMaterial({
		color: new Color(palette.ring),
		size: 0.02,
		sizeAttenuation: true,
		transparent: true,
		opacity: 0.85,
		depthWrite: false
	});
	const ring = new Points(rg, rm);
	ring.rotation.x = 1.15;
	ring.rotation.z = -0.35;
	group.add(ring);

	// ── Comet: glowing head + fading trail, always drawn on top ────────────
	const TR = 32;
	const tp = new Float32Array(TR * 3);
	const tt = new Float32Array(TR);
	for (let k = 0; k < TR; k++) tt[k] = k / (TR - 1);
	const sg = new BufferGeometry();
	sg.setAttribute('position', new BufferAttribute(tp, 3));
	sg.setAttribute('aT', new BufferAttribute(tt, 1));
	const sm = new ShaderMaterial({
		uniforms: { uPR: uniforms.uPR, uCol: { value: new Color(palette.accent) } },
		transparent: true,
		depthWrite: false,
		depthTest: false,
		vertexShader: /* glsl */ `
			uniform float uPR;
			attribute float aT;
			varying float vT;
			void main() {
				vT = aT;
				vec4 mv = modelViewMatrix * vec4(position, 1.0);
				gl_Position = projectionMatrix * mv;
				float head = step(0.999, aT);
				gl_PointSize = mix(2.0 + 6.0 * aT, 34.0, head) * uPR * (8.2 / -mv.z);
			}`,
		fragmentShader: /* glsl */ `
			uniform vec3 uCol;
			varying float vT;
			void main() {
				float r = length(gl_PointCoord - 0.5);
				if (r > 0.5) discard;
				float head = step(0.999, vT);
				float core = smoothstep(0.17, 0.11, r);
				float halo = exp(-r * r * 20.0) * 0.5;
				float a = mix(smoothstep(0.5, 0.2, r) * vT * 0.9, max(core, halo), head);
				gl_FragColor = vec4(uCol, a);
				#include <colorspace_fragment>
			}`
	});
	const comet = new Points(sg, sm);
	comet.frustumCulled = false;
	comet.renderOrder = 5;
	ring.add(comet);

	const fit = () => {
		const w = canvas.clientWidth;
		const h = canvas.clientHeight;
		if (!w || !h) return;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		// Pull the camera back on tall/narrow canvases so the ring never clips.
		camera.position.z = CAMERA_Z / Math.max(0.55, Math.min(1, w / h));
		uniforms.uCam.value = camera.position.z;
		camera.updateProjectionMatrix();
	};
	fit();

	const placeComet = (t: number) => {
		for (let q = 0; q < TR; q++) {
			const a = t * 0.55 - (1 - tt[q]) * 1.1;
			tp[q * 3] = Math.cos(a) * RING_RADIUS;
			tp[q * 3 + 1] = 0;
			tp[q * 3 + 2] = Math.sin(a) * RING_RADIUS;
		}
		sg.attributes.position.needsUpdate = true;
	};

	let tx = 0,
		ty = 0,
		rx = 0,
		ry = 0,
		spin = 0,
		raf = 0;
	let visible = true;
	const onMove = (e: PointerEvent) => {
		tx = e.clientX / (window.innerWidth || 1) - 0.5;
		ty = e.clientY / (window.innerHeight || 1) - 0.5;
	};
	// Comet head → page coordinates: the launch point of the live-drafting cursors (comet.ts).
	// The canvas rect is re-read every 20 frames; the head is projected every frame.
	const headV = new Vector3();
	const cvDoc = { x: 0, y: 0, w: 1, h: 1 };
	let frameN = 0;
	const publishComet = () => {
		if (frameN++ % 20 === 0) {
			const r = canvas.getBoundingClientRect();
			cvDoc.x = r.left + window.scrollX;
			cvDoc.y = r.top + window.scrollY;
			cvDoc.w = r.width;
			cvDoc.h = r.height;
		}
		const i = (TR - 1) * 3;
		headV.set(tp[i], tp[i + 1], tp[i + 2]);
		comet.localToWorld(headV);
		headV.project(camera);
		cometPos.x = cvDoc.x + ((headV.x + 1) / 2) * cvDoc.w;
		cometPos.y = cvDoc.y + ((1 - headV.y) / 2) * cvDoc.h;
		cometPos.ready = true;
	};

	const clock = new Clock();
	const frame = () => {
		const dt = Math.min(clock.getDelta(), 0.05);
		const t = clock.elapsedTime;
		uniforms.uTime.value = t;
		spin += dt * 0.12;
		rx += (ty * 0.35 - rx) * 0.04;
		ry += (tx * 0.5 - ry) * 0.04;
		group.rotation.y = spin + ry;
		group.rotation.x = 0.18 + rx;
		placeComet(t);
		renderer.render(scene, camera);
		if (publish) publishComet();
		raf = visible ? requestAnimationFrame(frame) : 0;
	};
	const still = () => {
		uniforms.uTime.value = 1.6;
		group.rotation.set(0.18, 0.6, 0);
		placeComet(1.6);
		renderer.render(scene, camera);
	};

	const ro = new ResizeObserver(() => {
		fit();
		if (reduce) still();
	});
	ro.observe(canvas);

	// Pause the loop when the hero scrolls out of view.
	const io = new IntersectionObserver(([entry]) => {
		visible = entry.isIntersecting;
		if (visible && !reduce && !raf) {
			clock.getDelta();
			raf = requestAnimationFrame(frame);
		}
	});
	io.observe(canvas);

	// Recolour when <html data-theme> changes.
	const recolor = () => {
		const p = readPalette();
		uniforms.uA.value.set(p.accent);
		uniforms.uB.value.set(p.base);
		uniforms.uC.value.set(p.peak);
		rm.color.set(p.ring);
		(sm.uniforms.uCol.value as Color).set(p.accent);
		if (reduce || !raf) still();
	};
	const mo = new MutationObserver(recolor);
	mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

	if (reduce) still();
	else {
		window.addEventListener('pointermove', onMove, { passive: true });
		raf = requestAnimationFrame(frame);
	}

	return {
		dispose() {
			cancelAnimationFrame(raf);
			window.removeEventListener('pointermove', onMove);
			ro.disconnect();
			io.disconnect();
			mo.disconnect();
			geo.dispose();
			mat.dispose();
			rg.dispose();
			rm.dispose();
			sg.dispose();
			sm.dispose();
			renderer.dispose();
			if (publish) cometPos.ready = false;
		}
	};
}
