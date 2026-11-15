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
 * - Exploded view: every cubie sits in an inner group that can be pushed out from the centre and
 *   turned a little. The offset is recomputed from `explosion.cubelets[i].t` (0 → 1) every frame,
 *   on top of the cubie's logical pose, so nothing accumulates: at t = 0 every piece is exactly
 *   where the turn logic left it. Something else (GSAP ScrollTrigger in Hero.svelte, via
 *   `$lib/motion/cube-explode`) writes those values; while any piece is out, no new turn starts.
 * - Lighting: a room environment map for soft reflections, a key light casting shadows between
 *   the cubies (visible once they separate), clear-coated stickers.
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
	CanvasTexture,
	Clock,
	Color,
	DirectionalLight,
	EquirectangularReflectionMapping,
	Group,
	HemisphereLight,
	Matrix4,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	PCFShadowMap,
	PerspectiveCamera,
	PMREMGenerator,
	Points,
	PointsMaterial,
	Quaternion,
	Scene,
	ShaderMaterial,
	Shape,
	ShapeGeometry,
	SRGBColorSpace,
	type Texture,
	Vector3,
	WebGLRenderer
} from 'three';
import { comet as cometPos } from './comet';

/**
 * Exploded-view state, written by the scroll timeline and read every frame.
 * - `cubelets[i].t`: how far cubie i is out (0 = home, 1 = fully exploded). Index = identity.
 * - `ring[i]`: 0 corner · 1 edge · 2 centre · 3 core — a Rubik's move never changes a piece's
 *   kind, so this is a stable order to stagger by.
 * - `overall.t`: the whole view (camera pull-back), 0 → 1.
 */
export type CubeExplosion = {
	cubelets: { t: number }[];
	ring: number[];
	overall: { t: number };
};

export type HeroScene = {
	dispose: () => void;
	explosion: CubeExplosion;
	/** Resolves once shaders are compiled (in parallel where supported) and the first frame is drawn. */
	ready: Promise<void>;
};

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

/** Small deterministic PRNG so every cubie flies the same way on every visit. */
function mulberry32(seed: number) {
	let a = seed;
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const SPREAD = 1.15; // how far a corner travels, in multiples of its distance from the centre

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
	// Shadows and reflections are switched on after load (see `enhance`), so none of their shader
	// variants compile during the intro.
	renderer.shadowMap.enabled = false;
	renderer.shadowMap.type = PCFShadowMap;

	let palette = readPalette();
	const scene = new Scene();
	// Reflections: a tiny procedural studio panorama (soft top light, a warm side card, darker
	// floor). Small on purpose — PMREM-baking it costs a fraction of a room scene.
	const studio = document.createElement('canvas');
	studio.width = 128;
	studio.height = 64;
	const sctx = studio.getContext('2d');
	if (sctx) {
		const g = sctx.createLinearGradient(0, 0, 0, 64);
		g.addColorStop(0, '#ffffff');
		g.addColorStop(0.42, '#d9dee5');
		g.addColorStop(0.6, '#8a929c');
		g.addColorStop(1, '#2a3038');
		sctx.fillStyle = g;
		sctx.fillRect(0, 0, 128, 64);
		sctx.fillStyle = '#ffffff';
		sctx.fillRect(20, 6, 30, 14); // key softbox
		sctx.fillStyle = '#e9c9ae';
		sctx.fillRect(86, 20, 10, 16); // warm rim card
	}
	const studioTex = new CanvasTexture(studio);
	studioTex.mapping = EquirectangularReflectionMapping;
	studioTex.colorSpace = SRGBColorSpace;
	let envMap: Texture | null = null;
	// 0 → 1 as reflections fade in after `enhance`; the fill lights ease down to compensate.
	let envMix = 0;
	const camera = new PerspectiveCamera(35, 1, 0.1, 100);
	camera.position.set(0, 0, CAMERA_Z);
	const group = new Group();
	scene.add(group);

	// ── Light: soft sky/ground fill, key from the upper left, warm ember rim from behind ──
	const hemi = new HemisphereLight(0xffffff, 0xd8dde4, 1.9);
	const key = new DirectionalLight(0xffffff, 2.6);
	key.position.set(-3, 5, 6);
	key.castShadow = true;
	key.shadow.mapSize.set(1024, 1024);
	key.shadow.camera.left = key.shadow.camera.bottom = -3.2;
	key.shadow.camera.right = key.shadow.camera.top = 3.2;
	key.shadow.camera.near = 1;
	key.shadow.camera.far = 16;
	key.shadow.bias = -0.0004;
	key.shadow.normalBias = 0.025;
	key.shadow.radius = 3;
	const rim = new DirectionalLight(0xfb923c, 1.1);
	rim.position.set(5, -1, -4);
	scene.add(hemi, key, rim);
	const mix = (a: number, b: number) => a + (b - a) * envMix;
	const lightFor = (dark: boolean) => {
		hemi.groundColor.set(dark ? 0x1a2029 : 0xd8dde4);
		hemi.intensity = dark ? mix(1.5, 1.1) : mix(1.9, 1.45);
		key.intensity = dark ? mix(2.4, 2.3) : mix(2.6, 2.4);
		rim.intensity = dark ? 1.6 : 1.1;
		scene.environmentIntensity = (dark ? 0.4 : 0.55) * envMix;
	};
	lightFor(palette.dark);

	// ── Cube: 27 cubies, stickers only on outward faces ──────────────────────────────
	const bodyGeo = roundedCubie();
	const bodyMat = new MeshStandardMaterial({
		color: new Color(palette.body),
		roughness: 0.42,
		metalness: 0.08
	});
	const stGeo = stickerShape();
	const stMats = palette.faces.map(
		(c) =>
			new MeshStandardMaterial({
				color: new Color(c),
				roughness: 0.26,
				metalness: 0,
				envMapIntensity: 1.25
			})
	);

	const cube = new Group();
	cube.scale.setScalar(1.15);
	group.add(cube);
	const cubies: Group[] = [];
	const inners: Group[] = [];
	const explosion: CubeExplosion = { cubelets: [], ring: [], overall: { t: 0 } };
	// Per-cubie flight: travel factor, a turn (axis + angle) and a small sideways drift.
	const flights: { dist: number; axis: Vector3; angle: number; drift: Vector3 }[] = [];
	const rand = mulberry32(0x5e70);
	for (let x = -1; x <= 1; x++)
		for (let y = -1; y <= 1; y++)
			for (let z = -1; z <= 1; z++) {
				const piece = new Group();
				piece.position.set(x * SPACING, y * SPACING, z * SPACING);
				const inner = new Group();
				piece.add(inner);
				const body = new Mesh(bodyGeo, bodyMat);
				body.castShadow = true;
				body.receiveShadow = true;
				inner.add(body);
				const at = [x, y, z];
				NORMALS.forEach((n, f) => {
					const axis = n[0] ? 0 : n[1] ? 1 : 2;
					if (at[axis] !== n[0] + n[1] + n[2]) return;
					const st = new Mesh(stGeo, stMats[f]);
					st.receiveShadow = true;
					const o = HALF + 0.002;
					st.position.set(n[0] * o, n[1] * o, n[2] * o);
					st.lookAt(n[0] * 2, n[1] * 2, n[2] * 2);
					inner.add(st);
				});
				cube.add(piece);
				cubies.push(piece);
				inners.push(inner);
				const kind = 3 - (Math.abs(x) + Math.abs(y) + Math.abs(z)); // 0 corner … 3 core
				explosion.cubelets.push({ t: 0 });
				explosion.ring.push(kind);
				flights.push({
					dist: 0.82 + rand() * 0.4,
					axis: new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
					angle: (0.35 + rand() * 0.75) * (rand() < 0.5 ? -1 : 1),
					drift: new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.22)
				});
			}

	// ── Exploded view: offset each inner group from its cubie's *current* pose ────────
	const qIdentity = new Quaternion();
	const qc = new Quaternion();
	const qInv = new Quaternion();
	const qTurn = new Quaternion();
	const pc = new Vector3();
	const off = new Vector3();
	const exploding = () => explosion.overall.t > 0.0005;
	const applyExplosion = () => {
		for (let i = 0; i < cubies.length; i++) {
			const inner = inners[i];
			const t = explosion.cubelets[i].t;
			if (t <= 0) {
				inner.position.set(0, 0, 0);
				inner.quaternion.identity();
				continue;
			}
			const piece = cubies[i];
			const f = flights[i];
			// Pose in the cube's frame (a piece mid-turn hangs off the pivot).
			const parentQ = piece.parent === pivot ? pivot.quaternion : qIdentity;
			pc.copy(piece.position).applyQuaternion(parentQ);
			qc.copy(parentQ).multiply(piece.quaternion);
			off
				.copy(pc)
				.multiplyScalar(SPREAD * f.dist * t)
				.addScaledVector(f.drift, t);
			qInv.copy(qc).invert();
			inner.position.copy(off).applyQuaternion(qInv);
			qTurn.setFromAxisAngle(f.axis, f.angle * t);
			inner.quaternion.copy(qInv).multiply(qTurn).multiply(qc);
		}
	};

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
			// Finish a half-done turn quickly once the cube starts coming apart.
			turn.t += (dt / turn.dur) * (exploding() ? 3 : 1);
			if (turn.t >= 1) {
				endTurn();
				pause = plan.length ? 0.08 + Math.random() * 0.14 : scrambled ? 1.0 : 2.2;
			} else pivot.rotation[AXES[turn.a]] = ((turn.d * Math.PI) / 2) * ease(turn.t);
			return;
		}
		if (exploding()) {
			pause = Math.max(pause, 0.6);
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

	let baseZ = CAMERA_Z;
	const fit = () => {
		const w = canvas.clientWidth;
		const h = canvas.clientHeight;
		if (!w || !h) return;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		// Pull the camera back on tall/narrow canvases so the ring never clips.
		baseZ = CAMERA_Z / Math.max(0.55, Math.min(1, w / h));
		camera.position.z = baseZ;
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
	let compiled = false;
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
		if (enhanced && envMix < 1) {
			envMix = Math.min(1, envMix + dt / 0.9);
			lightFor(palette.dark);
		}
		applyExplosion();
		// Ease the camera back as the pieces spread so the exploded view stays in frame.
		const ex = explosion.overall.t;
		camera.position.z = baseZ * (1 + 0.42 * ex * ex * (3 - 2 * ex));
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
		if (reduce && compiled) still();
	});
	ro.observe(canvas);

	// Pause the loop while the hero is off screen.
	const io = new IntersectionObserver(([entry]) => {
		visible = entry.isIntersecting;
		if (visible && compiled && !reduce && !raf) {
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
		if (!compiled) return;
		if (reduce) still();
		else renderer.render(scene, camera);
	};
	const mo = new MutationObserver(recolor);
	mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

	// Compile every shader off the main thread where the browser allows it
	// (KHR_parallel_shader_compile), so the first frame doesn't stall the page or the intro loader.
	let disposed = false;
	// Shadows: compile the shadowed variants in parallel while frames keep using the compiled
	// shadow-free programs (the program cache is keyed on shadowMap.enabled), then switch over.
	let enhancing = false;
	let enhanced = false;
	let enhanceTimer = 0;
	// After load: bake the studio environment and compile the reflective + shadowed variants in
	// parallel while frames keep using the compiled plain programs (the program cache is keyed on
	// environment and shadow state), then switch over and fade the reflections in.
	const enhance = () => {
		if (disposed || enhancing) return;
		enhancing = true;
		const pmrem = new PMREMGenerator(renderer);
		envMap = pmrem.fromEquirectangular(studioTex).texture;
		pmrem.dispose();
		studioTex.dispose();
		scene.environment = envMap;
		renderer.shadowMap.enabled = true;
		for (const m of [bodyMat, ...stMats]) m.needsUpdate = true;
		const pending = renderer.compileAsync(scene, camera);
		scene.environment = null;
		renderer.shadowMap.enabled = false;
		pending
			.catch(() => {})
			.then(() => {
				if (disposed) return;
				scene.environment = envMap;
				renderer.shadowMap.enabled = true;
				renderer.shadowMap.needsUpdate = true;
				enhanced = true;
				if (reduce) {
					envMix = 1;
					lightFor(palette.dark);
					still();
				}
			});
	};
	const ready = renderer
		.compileAsync(scene, camera)
		.catch(() => {})
		.then(() => {
			if (disposed) return;
			compiled = true;
			const idle = () =>
				'requestIdleCallback' in window
					? window.requestIdleCallback(enhance, { timeout: 3000 })
					: enhance();
			enhanceTimer = window.setTimeout(idle, 2500);
			if (reduce) still();
			else {
				window.addEventListener('pointermove', onMove, { passive: true });
				clock.getDelta();
				if (visible) raf = requestAnimationFrame(frame);
			}
		});

	return {
		dispose() {
			disposed = true;
			clearTimeout(enhanceTimer);
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
			envMap?.dispose();
			studioTex.dispose();
			renderer.dispose();
			if (publish) cometPos.ready = false;
		},
		explosion,
		ready
	};
}
