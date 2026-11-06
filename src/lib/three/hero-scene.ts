/**
 * Hero 3D scene: a Rubik's cube in the Paper & Ember palette that scrambles itself, holds, then
 * solves itself back, on a loop. Ported 1:1 from the approved design.
 *
 * - 27 rounded cubies with rounded stickers. Each layer turn is 90°, eased
 *   (easeInOutCubic, ~0.4s).
 * - Loop: 9 random turns → hold 1s → the same turns undone in reverse → hold 2.2s → repeat.
 * - The dotted orbit ring and the orange comet are unchanged. The comet still publishes its page
 *   position (`$lib/three/comet`) as the launch point for live drafting. It now passes behind the
 *   cube.
 * - Slow spin + gentle pointer tilt; the top face is tilted toward the viewer.
 *
 * Usage (client only): const scene = createHeroScene(canvas); … scene.dispose();
 * Pass { publishComet: false } for secondary copies of the scene (e.g. StrangerScreen) so they
 * don't overwrite the hero comet's page position.
 * Load it with a dynamic import inside onMount so three.js stays out of the initial bundle.
 *
 * Theme-aware: the colours come from CSS variables:
 * - --cube-body, --cube-1 … --cube-6
 * - --scene-ring, --color-accent
 * (values in src/lib/styles/theme.css). The scene watches <html data-theme> and
 * recolours itself in the same frame, so the theme-switch circle reveals the new colours.
 */

import {
	BoxGeometry,
	BufferAttribute,
	BufferGeometry,
	Clock,
	Color,
	DirectionalLight,
	Group,
	HemisphereLight,
	Matrix4,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	Scene,
	ShaderMaterial,
	Shape,
	ShapeGeometry,
	Vector3,
	WebGLRenderer
} from 'three';
import { comet as cometPos } from './comet';

export type HeroScene = { dispose: () => void };

type Palette = { accent: string; ring: string; body: string; faces: string[]; dark: boolean };

// +x, -x, +y, -y, +z, -z
const FALLBACK_FACES = ['#f97316', '#9a3412', '#f1f5f9', '#fdba74', '#5b6675', '#a9b3bf'];

function readPalette(): Palette {
	const root = document.documentElement;
	const css = getComputedStyle(root);
	const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
	const dark = root.dataset.theme === 'dark';
	return {
		dark,
		accent: v('--color-accent', '#f97316'),
		ring: v('--scene-ring', dark ? '#56606d' : '#9aa3ad'),
		body: v('--cube-body', dark ? '#232b36' : '#161b22'),
		faces: FALLBACK_FACES.map((f, i) => v(`--cube-${i + 1}`, f))
	};
}

const CAMERA_Z = 8.2;
const RING_RADIUS = 2.25;
const SPACING = 0.66; // centre-to-centre distance between cubies
const HALF = 0.31; // half the cubie size
const BEVEL = 0.07; // cubie corner radius
const AXES = ['x', 'y', 'z'] as const;
const NORMALS: [number, number, number][] = [
	[1, 0, 0],
	[-1, 0, 0],
	[0, 1, 0],
	[0, -1, 0],
	[0, 0, 1],
	[0, 0, -1]
];

type Move = { a: number; l: number; d: number; dur: number };

/** A box whose vertices are pushed out onto a rounded shell; normals point out of the shell. */
function roundedCubie(): BoxGeometry {
	const g = new BoxGeometry(HALF * 2, HALF * 2, HALF * 2, 6, 6, 6);
	const p = g.attributes.position;
	const n = g.attributes.normal;
	const v = new Vector3();
	const c = new Vector3();
	const lim = HALF - BEVEL;
	const cl = (x: number) => Math.max(-lim, Math.min(lim, x));
	for (let i = 0; i < p.count; i++) {
		v.fromBufferAttribute(p, i);
		c.set(cl(v.x), cl(v.y), cl(v.z));
		v.sub(c).normalize();
		n.setXYZ(i, v.x, v.y, v.z);
		v.multiplyScalar(BEVEL).add(c);
		p.setXYZ(i, v.x, v.y, v.z);
	}
	return g;
}

function stickerShape(): ShapeGeometry {
	const h = 0.25;
	const r = 0.075;
	const s = new Shape();
	s.moveTo(-h + r, -h);
	s.lineTo(h - r, -h);
	s.quadraticCurveTo(h, -h, h, -h + r);
	s.lineTo(h, h - r);
	s.quadraticCurveTo(h, h, h - r, h);
	s.lineTo(-h + r, h);
	s.quadraticCurveTo(-h, h, -h, h - r);
	s.lineTo(-h, -h + r);
	s.quadraticCurveTo(-h, -h, -h + r, -h);
	return new ShapeGeometry(s, 6);
}

export function createHeroScene(
	canvas: HTMLCanvasElement,
	{ publishComet: publish = true }: { publishComet?: boolean } = {}
): HeroScene {
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	renderer.setClearColor(0xffffff, 0);

	let palette = readPalette();
	const scene = new Scene();
	const camera = new PerspectiveCamera(35, 1, 0.1, 100);
	camera.position.set(0, 0, CAMERA_Z);
	const group = new Group();
	scene.add(group);

	// ── Light: soft sky/ground fill, key from the upper left, warm ember rim from behind ──
	const hemi = new HemisphereLight(0xffffff, 0xd8dde4, 1.9);
	const key = new DirectionalLight(0xffffff, 2.6);
	key.position.set(-3, 5, 6);
	const rim = new DirectionalLight(0xfb923c, 1.1);
	rim.position.set(5, -1, -4);
	scene.add(hemi, key, rim);
	const lightFor = (dark: boolean) => {
		hemi.groundColor.set(dark ? 0x1a2029 : 0xd8dde4);
		hemi.intensity = dark ? 1.5 : 1.9;
		key.intensity = dark ? 2.4 : 2.6;
		rim.intensity = dark ? 1.6 : 1.1;
	};
	lightFor(palette.dark);

	// ── Cube: 27 cubies, stickers only on outward faces ──────────────────────────────
	const bodyGeo = roundedCubie();
	const bodyMat = new MeshStandardMaterial({
		color: new Color(palette.body),
		roughness: 0.55,
		metalness: 0.05
	});
	const stGeo = stickerShape();
	const stMats = palette.faces.map(
		(c) => new MeshStandardMaterial({ color: new Color(c), roughness: 0.32, metalness: 0 })
	);

	const cube = new Group();
	cube.scale.setScalar(1.15);
	group.add(cube);
	const cubies: Group[] = [];
	for (let x = -1; x <= 1; x++)
		for (let y = -1; y <= 1; y++)
			for (let z = -1; z <= 1; z++) {
				const piece = new Group();
				piece.position.set(x * SPACING, y * SPACING, z * SPACING);
				piece.add(new Mesh(bodyGeo, bodyMat));
				const at = [x, y, z];
				NORMALS.forEach((n, f) => {
					const axis = n[0] ? 0 : n[1] ? 1 : 2;
					if (at[axis] !== n[0] + n[1] + n[2]) return;
					const st = new Mesh(stGeo, stMats[f]);
					const o = HALF + 0.002;
					st.position.set(n[0] * o, n[1] * o, n[2] * o);
					st.lookAt(n[0] * 2, n[1] * 2, n[2] * 2);
					piece.add(st);
				});
				cube.add(piece);
				cubies.push(piece);
			}

	// ── Layer turns: attach a layer to a pivot, turn 90°, hand pieces back snapped to the grid ──
	const pivot = new Object3D();
	cube.add(pivot);
	const m4 = new Matrix4();
	let turn: (Move & { t: number }) | null = null;
	let plan: Move[] = [];
	let history: Move[] = [];
	let pause = 1.2;
	let scrambled = false;
	const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
	const snap = (o: Object3D) => {
		o.position.set(
			Math.round(o.position.x / SPACING) * SPACING,
			Math.round(o.position.y / SPACING) * SPACING,
			Math.round(o.position.z / SPACING) * SPACING
		);
		m4.makeRotationFromQuaternion(o.quaternion);
		const e = m4.elements;
		for (let k = 0; k < 16; k++) e[k] = Math.round(e[k]);
		o.quaternion.setFromRotationMatrix(m4);
	};
	const startTurn = (mv: Move) => {
		pivot.rotation.set(0, 0, 0);
		pivot.updateMatrixWorld(true);
		for (const o of cubies)
			if (Math.round(o.position[AXES[mv.a]] / SPACING) === mv.l) pivot.attach(o);
		turn = { ...mv, t: 0 };
	};
	const endTurn = () => {
		if (!turn) return;
		pivot.rotation[AXES[turn.a]] = (turn.d * Math.PI) / 2;
		pivot.updateMatrixWorld(true);
		for (const o of pivot.children.slice()) {
			cube.attach(o);
			snap(o);
		}
		turn = null;
	};
	const scramble = (): Move[] => {
		const out: Move[] = [];
		let last = -1;
		for (let q = 0; q < 9; q++) {
			let a: number;
			do a = Math.floor(Math.random() * 3);
			while (a === last);
			last = a;
			out.push({
				a,
				l: Math.floor(Math.random() * 3) - 1,
				d: Math.random() < 0.5 ? 1 : -1,
				dur: 0.38 + Math.random() * 0.12
			});
		}
		return out;
	};
	const step = (dt: number) => {
		if (turn) {
			turn.t += dt / turn.dur;
			if (turn.t >= 1) {
				endTurn();
				pause = plan.length ? 0.08 + Math.random() * 0.14 : scrambled ? 1.0 : 2.2;
			} else pivot.rotation[AXES[turn.a]] = ((turn.d * Math.PI) / 2) * ease(turn.t);
			return;
		}
		pause -= dt;
		if (pause > 0) return;
		if (!plan.length) {
			if (scrambled) {
				plan = history
					.reverse()
					.map((m) => ({ a: m.a, l: m.l, d: -m.d, dur: 0.3 + Math.random() * 0.08 }));
				history = [];
				scrambled = false;
			} else {
				plan = scramble();
				scrambled = true;
			}
		}
		const mv = plan.shift();
		if (!mv) return;
		if (scrambled) history.push(mv);
		startTurn(mv);
	};

	// ── Orbit ring ───────────────────────────────────────────────────────────────────
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
		size: 0.022,
		sizeAttenuation: true,
		transparent: true,
		opacity: 0.85,
		depthWrite: false
	});
	const ring = new Points(rg, rm);
	ring.rotation.x = 1.15;
	ring.rotation.z = -0.35;
	group.add(ring);

	// ── Comet: glowing head + fading trail; depth-tested so it passes behind the cube ──
	const TR = 32;
	const tp = new Float32Array(TR * 3);
	const tt = new Float32Array(TR);
	for (let k = 0; k < TR; k++) tt[k] = k / (TR - 1);
	const sg = new BufferGeometry();
	sg.setAttribute('position', new BufferAttribute(tp, 3));
	sg.setAttribute('aT', new BufferAttribute(tt, 1));
	const sm = new ShaderMaterial({
		uniforms: {
			uPR: { value: renderer.getPixelRatio() },
			uCol: { value: new Color(palette.accent) }
		},
		transparent: true,
		depthWrite: false,
		vertexShader: /* glsl */ `
			uniform float uPR;
			attribute float aT;
			varying float vT;
			void main() {
				vT = aT;
				vec4 mv = modelViewMatrix * vec4(position, 1.0);
				gl_Position = projectionMatrix * mv;
				float head = step(0.999, aT);
				gl_PointSize = mix(2.0 + 6.0 * aT, 34.0, head) * uPR * (${CAMERA_Z.toFixed(1)} / -mv.z);
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
		spin = 0.62,
		raf = 0;
	let visible = true;
	const onMove = (e: PointerEvent) => {
		tx = e.clientX / (window.innerWidth || 1) - 0.5;
		ty = e.clientY / (window.innerHeight || 1) - 0.5;
	};
	const clock = new Clock();
	// Comet head → page coordinates, the launch point for live drafting.
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
	const frame = () => {
		const dt = Math.min(clock.getDelta(), 0.05);
		const t = clock.elapsedTime;
		step(dt);
		spin += dt * 0.16;
		rx += (ty * 0.35 - rx) * 0.04;
		ry += (tx * 0.5 - ry) * 0.04;
		group.rotation.y = spin + ry;
		group.rotation.x = 0.5 + rx;
		placeComet(t);
		renderer.render(scene, camera);
		if (publish) publishComet();
		raf = visible ? requestAnimationFrame(frame) : 0;
	};
	const still = () => {
		group.rotation.set(0.5, 0.62, 0);
		placeComet(1.6);
		renderer.render(scene, camera);
	};

	const ro = new ResizeObserver(() => {
		fit();
		if (reduce) still();
	});
	ro.observe(canvas);

	// Pause the loop while the hero is off screen.
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
		palette = readPalette();
		lightFor(palette.dark);
		bodyMat.color.set(palette.body);
		stMats.forEach((m, i) => {
			m.color.set(palette.faces[i]);
		});
		rm.color.set(palette.ring);
		(sm.uniforms.uCol.value as Color).set(palette.accent);
		// Draw now so the theme-switch snapshot already has the new colours. Reduced motion
		// redraws its still frame; otherwise the current pose (and any half-done turn) is kept.
		if (reduce) still();
		else renderer.render(scene, camera);
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
			bodyGeo.dispose();
			bodyMat.dispose();
			stGeo.dispose();
			for (const m of stMats) m.dispose();
			rg.dispose();
			rm.dispose();
			sg.dispose();
			sm.dispose();
			renderer.dispose();
			if (publish) cometPos.ready = false;
		}
	};
}
