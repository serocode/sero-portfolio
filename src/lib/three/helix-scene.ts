/**
 * Projects helix: every project is a curved card on a vertical helix around a central axis, two
 * dotted rails running along it like the edges of a film strip. Rendering only — the position
 * along the helix (a float project index), pointer parallax and layout come from outside
 * (`$lib/motion/helix-motion`), which calls `frame()` from its ticker.
 *
 * - Card faces are drawn on a 2D canvas (project number, title, kind, and a preview: the lead
 *   screenshot in a browser frame, three phone screens, or the architecture diagram) and used as
 *   textures. They redraw when screenshots arrive and when the theme changes.
 * - The focused card (|i − pos| → 0) is pushed out toward the camera, scaled up and fully opaque;
 *   the rest recede with scale, depth and opacity.
 * - Text that matters is not in WebGL: the focused project's details live in the DOM next to the
 *   canvas (Projects.svelte), and the canvas is aria-hidden.
 *
 * Theme-aware through CSS variables (surface, line, ink, muted, accent-700, mist, chip, inverse…,
 * --scene-ring); watches <html data-theme> like the hero scene.
 *
 * Usage (client only, dynamic import): const s = createHelixScene(canvas, projects); s.dispose().
 */

import {
	BackSide,
	BufferAttribute,
	BufferGeometry,
	CanvasTexture,
	Color,
	FrontSide,
	Group,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Points,
	PointsMaterial,
	Raycaster,
	Scene,
	SRGBColorSpace,
	Vector2,
	Vector3,
	WebGLRenderer
} from 'three';
import type { Project } from '$lib/content/types';

export const HELIX = {
	radius: 3.4,
	step: (Math.PI * 2) / 6.2, // angle between neighbouring cards
	rise: 1.05, // vertical drop between neighbouring cards
	cardW: 3.2,
	cardH: 2.2,
	push: 0.65 // how far the focused card comes out toward the camera
} as const;

const TW = 1024;
const TH = Math.round((TW * HELIX.cardH) / HELIX.cardW); // 704
const FOV = 34;

export type HelixLayout = {
	/** Canvas-space y (px) where the focused card's centre should sit. */
	focusY: number;
	/** Largest box (px) the focused card may take. */
	boxW: number;
	boxH: number;
};

export type HelixScene = {
	/** Draw the helix at `pos` (float index). `speed` in cards/s tilts it slightly. */
	frame: (pos: number, speed: number, dt: number) => void;
	setLayout: (layout: HelixLayout) => void;
	/** Pointer in [-0.5, 0.5]² for parallax, or null to recentre. */
	setPointer: (x: number | null, y?: number) => void;
	/** Index of the card under a client point, or -1. */
	pick: (clientX: number, clientY: number) => number;
	setHover: (i: number) => void;
	dispose: () => void;
};

type Palette = Record<
	| 'surface'
	| 'line'
	| 'lineStrong'
	| 'ink'
	| 'muted'
	| 'accent'
	| 'accent700'
	| 'mist'
	| 'chip'
	| 'inverse'
	| 'onInverse'
	| 'ring',
	string
> & { dark: boolean };

function readPalette(): Palette {
	const root = document.documentElement;
	const css = getComputedStyle(root);
	const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
	return {
		dark: root.dataset.theme === 'dark',
		surface: v('--color-surface', '#ffffff'),
		line: v('--color-line', '#e3e6ea'),
		lineStrong: v('--color-line-strong', '#d5d9df'),
		ink: v('--color-ink', '#0d1117'),
		muted: v('--color-muted', '#68727e'),
		accent: v('--color-accent', '#f97316'),
		accent700: v('--color-accent-700', '#c2410c'),
		mist: v('--color-mist', '#f6f7f9'),
		chip: v('--color-chip', '#f3f4f6'),
		inverse: v('--color-inverse', '#0d1117'),
		onInverse: v('--color-on-inverse', '#ffffff'),
		ring: v('--scene-ring', '#9aa3ad')
	};
}

const SANS = '"Schibsted Grotesk Variable", "Schibsted Grotesk", system-ui, sans-serif';
const MONO = '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace';

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
	ctx.beginPath();
	ctx.roundRect(x, y, w, h, r);
}

function dots(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	c: string
) {
	ctx.fillStyle = c;
	for (let yy = y + 12; yy < y + h; yy += 22)
		for (let xx = x + 12; xx < x + w; xx += 22) {
			ctx.beginPath();
			ctx.arc(xx, yy, 1.4, 0, Math.PI * 2);
			ctx.fill();
		}
}

/** Draw `img` into a box like `object-fit: cover; object-position: top`. */
function coverTop(
	ctx: CanvasRenderingContext2D,
	img: HTMLImageElement,
	x: number,
	y: number,
	w: number,
	h: number
) {
	const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
	const dw = img.naturalWidth * s;
	ctx.drawImage(img, x + (w - dw) / 2, y, dw, img.naturalHeight * s);
}

function ellipsize(ctx: CanvasRenderingContext2D, text: string, max: number) {
	if (ctx.measureText(text).width <= max) return text;
	let t = text;
	while (t.length > 1 && ctx.measureText(`${t}…`).width > max) t = t.slice(0, -1);
	return `${t.trimEnd()}…`;
}

type Img = { el: HTMLImageElement; state: 'loading' | 'ready' | 'error' };

function drawCard(
	ctx: CanvasRenderingContext2D,
	project: Project,
	index: number,
	total: number,
	pal: Palette,
	img: (src: string) => Img
) {
	ctx.clearRect(0, 0, TW, TH);
	// Card body
	rr(ctx, 1, 1, TW - 2, TH - 2, 30);
	ctx.fillStyle = pal.surface;
	ctx.fill();
	ctx.lineWidth = 2;
	ctx.strokeStyle = pal.line;
	ctx.stroke();

	// Header: number · title …… kind
	const pad = 34;
	ctx.textBaseline = 'alphabetic';
	ctx.font = `500 22px ${MONO}`;
	ctx.fillStyle = pal.accent700;
	const num = `${String(index + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;
	ctx.fillText(num, pad, 60);
	const numW = ctx.measureText(num).width;
	ctx.font = `500 18px ${MONO}`;
	ctx.fillStyle = pal.muted;
	const kind = ellipsize(ctx, project.kind.toUpperCase(), 360);
	const kindW = ctx.measureText(kind).width;
	ctx.fillText(kind, TW - pad - kindW, 59);
	ctx.font = `600 34px ${SANS}`;
	ctx.fillStyle = pal.ink;
	ctx.fillText(
		ellipsize(ctx, project.title, TW - pad * 2 - numW - kindW - 56),
		pad + numW + 20,
		61
	);

	// Preview
	const px = pad;
	const py = 90;
	const pw = TW - pad * 2;
	const ph = TH - py - pad;
	ctx.save();
	rr(ctx, px, py, pw, ph, 18);
	ctx.clip();
	const view = project.views[0];
	const unavailable = (x: number, y: number, w: number, h: number, label: string) => {
		ctx.fillStyle = pal.chip;
		ctx.fillRect(x, y, w, h);
		ctx.font = `400 18px ${MONO}`;
		ctx.fillStyle = pal.muted;
		ctx.textAlign = 'center';
		ctx.fillText(label, x + w / 2, y + h / 2);
		ctx.textAlign = 'left';
	};
	if (view.type === 'browser') {
		const bar = 42;
		ctx.fillStyle = view.background;
		ctx.fillRect(px, py, pw, ph);
		ctx.fillStyle = pal.surface;
		ctx.fillRect(px, py, pw, bar);
		ctx.fillStyle = pal.line;
		ctx.fillRect(px, py + bar - 1.5, pw, 1.5);
		for (let k = 0; k < 3; k++) {
			ctx.beginPath();
			ctx.arc(px + 22 + k * 18, py + bar / 2, 5.5, 0, Math.PI * 2);
			ctx.fill();
		}
		rr(ctx, px + 92, py + 9, Math.min(420, pw - 110), bar - 18, 6);
		ctx.fillStyle = pal.mist;
		ctx.fill();
		ctx.fillStyle = pal.accent;
		ctx.beginPath();
		ctx.arc(px + 108, py + bar / 2, 3.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.font = `400 15px ${MONO}`;
		ctx.fillStyle = pal.muted;
		ctx.fillText(ellipsize(ctx, view.addressBar, 360), px + 120, py + bar / 2 + 5);
		const shot = view.shots[0];
		const im = img(shot.src);
		if (im.state === 'ready') coverTop(ctx, im.el, px, py + bar, pw, ph - bar);
		else if (im.state === 'error')
			unavailable(px, py + bar, pw, ph - bar, 'Screenshot unavailable');
	} else if (view.type === 'phones') {
		ctx.fillStyle = pal.mist;
		ctx.fillRect(px, py, pw, ph);
		dots(ctx, px, py, pw, ph, pal.line);
		const shots = view.shots.slice(0, 3);
		const n = shots.length;
		const h0 = ph * 0.8;
		shots.forEach((s, k) => {
			const mid = k === Math.floor(n / 2);
			const h = mid ? h0 : h0 * 0.9;
			const w = h * (s.width / s.height) + 12;
			const cx = px + pw / 2 + (k - (n - 1) / 2) * (w + 38);
			const x = cx - w / 2;
			const y = py + (ph - h) / 2 - (mid ? 6 : -4);
			rr(ctx, x, y, w, h, 26);
			ctx.fillStyle = pal.inverse;
			ctx.fill();
			ctx.save();
			rr(ctx, x + 6, y + 6, w - 12, h - 12, 21);
			ctx.clip();
			const im = img(s.src);
			if (im.state === 'ready') coverTop(ctx, im.el, x + 6, y + 6, w - 12, h - 12);
			else unavailable(x + 6, y + 6, w - 12, h - 12, im.state === 'error' ? '—' : '');
			ctx.restore();
		});
	} else {
		ctx.fillStyle = pal.mist;
		ctx.fillRect(px, py, pw, ph);
		dots(ctx, px, py, pw, ph, pal.line);
		const rows = view.rows;
		const boxH = Math.min(66, (ph - 60 - (rows.length - 1) * 30) / rows.length);
		const gap = 30;
		const total = rows.length * boxH + (rows.length - 1) * gap;
		let y = py + (ph - total) / 2;
		const innerW = pw - 120;
		ctx.textAlign = 'center';
		rows.forEach((row, r) => {
			if (r > 0) {
				ctx.fillStyle = pal.lineStrong;
				ctx.fillRect(px + pw / 2 - 1, y - gap, 2, gap);
			}
			const bw = (innerW - (row.length - 1) * 16) / row.length;
			row.forEach((box, b) => {
				const x = px + 60 + b * (bw + 16);
				rr(ctx, x, y, bw, boxH, 12);
				ctx.setLineDash(box.kind === 'soft' ? [7, 6] : []);
				ctx.fillStyle = box.kind === 'data' ? pal.inverse : pal.surface;
				ctx.fill();
				ctx.lineWidth = box.kind === 'key' ? 3 : 1.5;
				ctx.strokeStyle =
					box.kind === 'key' ? pal.accent : box.kind === 'soft' ? pal.lineStrong : pal.line;
				if (box.kind !== 'data') ctx.stroke();
				ctx.setLineDash([]);
				ctx.font = `${box.kind === 'key' ? 600 : 400} 19px ${MONO}`;
				ctx.fillStyle = box.kind === 'data' ? pal.onInverse : pal.ink;
				ctx.fillText(ellipsize(ctx, box.label, bw - 20), x + bw / 2, y + boxH / 2 + 7);
			});
			y += boxH + gap;
		});
		ctx.textAlign = 'left';
	}
	ctx.restore();
	// Hairline around the preview
	rr(ctx, px, py, pw, ph, 18);
	ctx.lineWidth = 1.5;
	ctx.strokeStyle = pal.line;
	ctx.stroke();
}

/** A plane bent onto the helix cylinder so each card follows the curve of the strip. */
function curvedCard(radius: number): PlaneGeometry {
	const g = new PlaneGeometry(HELIX.cardW, HELIX.cardH, 32, 1);
	const p = g.attributes.position;
	for (let i = 0; i < p.count; i++) {
		const x = p.getX(i);
		const a = x / radius;
		p.setXYZ(i, Math.sin(a) * radius, p.getY(i), Math.cos(a) * radius - radius);
	}
	g.computeVertexNormals();
	return g;
}

const smooth = (x: number) => x * x * (3 - 2 * x);

export function createHelixScene(canvas: HTMLCanvasElement, projects: Project[]): HelixScene {
	const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	renderer.setClearColor(0xffffff, 0);

	let pal = readPalette();
	const scene = new Scene();
	const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
	const helix = new Group();
	scene.add(helix);

	const { radius: R, step, rise, cardH } = HELIX;
	const total = projects.length;

	// ── Images (shared by src) ───────────────────────────────────────────────────────
	const images = new Map<string, Img>();
	const waiting = new Map<string, Set<number>>();
	let disposed = false;
	const img = (src: string, card = -1): Img => {
		let im = images.get(src);
		if (!im) {
			const el = new Image();
			el.decoding = 'async';
			const entry: Img = { el, state: 'loading' };
			el.onload = () => {
				entry.state = 'ready';
				for (const c of waiting.get(src) ?? []) redraw(c);
			};
			el.onerror = () => {
				entry.state = 'error';
				for (const c of waiting.get(src) ?? []) redraw(c);
			};
			el.src = src;
			images.set(src, entry);
			im = entry;
		}
		if (card >= 0) {
			const set = waiting.get(src) ?? new Set<number>();
			waiting.set(src, set);
			set.add(card);
		}
		return im;
	};

	// ── Cards ───────────────────────────────────────────────────────────────────────
	const geo = curvedCard(R);
	// Back faces: a plain rounded card in the line colour (shared alpha shape).
	const backCanvas = document.createElement('canvas');
	backCanvas.width = 256;
	backCanvas.height = Math.round((256 * TH) / TW);
	{
		const b = backCanvas.getContext('2d');
		if (b) {
			rr(b, 0, 0, backCanvas.width, backCanvas.height, 8);
			b.fillStyle = '#fff';
			b.fill();
		}
	}
	const backTex = new CanvasTexture(backCanvas);
	backTex.colorSpace = SRGBColorSpace;

	const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
	type Card = {
		group: Group;
		front: Mesh<PlaneGeometry, MeshBasicMaterial>;
		back: Mesh<PlaneGeometry, MeshBasicMaterial>;
		ctx: CanvasRenderingContext2D | null;
		tex: CanvasTexture;
		theta: number;
	};
	const cards: Card[] = projects.map((project, i) => {
		const c = document.createElement('canvas');
		c.width = TW;
		c.height = TH;
		const tex = new CanvasTexture(c);
		tex.colorSpace = SRGBColorSpace;
		tex.anisotropy = maxAniso;
		const front = new Mesh(
			geo,
			new MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.02, side: FrontSide })
		);
		front.userData.index = i;
		const back = new Mesh(
			geo,
			new MeshBasicMaterial({
				map: backTex,
				color: new Color(pal.lineStrong),
				transparent: true,
				alphaTest: 0.02,
				side: BackSide
			})
		);
		const group = new Group();
		group.add(front, back);
		const theta = i * step;
		group.rotation.y = theta;
		helix.add(group);
		// Ask for the images this card needs so it redraws when they land.
		const view = project.views[0];
		if (view.type !== 'diagram') for (const s of view.shots.slice(0, 3)) img(s.src, i);
		return { group, front, back, ctx: c.getContext('2d'), tex, theta };
	});

	let needsRender = true;
	const redraw = (i: number) => {
		if (disposed) return;
		const card = cards[i];
		if (!card.ctx) return;
		drawCard(card.ctx, projects[i], i, total, pal, (src) => img(src));
		card.tex.needsUpdate = true;
		needsRender = true;
	};
	const redrawAll = () => {
		for (let i = 0; i < cards.length; i++) redraw(i);
	};
	redrawAll();
	// Fonts may still be swapping in; draw once more when they're ready.
	document.fonts?.ready.then(() => redrawAll());

	// ── Rails: two dotted lines along the strip's edges ──────────────────────────────
	const railPts: number[] = [];
	const edge = cardH / 2 + 0.2;
	for (let s = -1.4; s <= total + 0.4; s += 0.014) {
		const a = s * step;
		const x = Math.sin(a) * R;
		const z = Math.cos(a) * R;
		railPts.push(x, -s * rise + edge, z, x, -s * rise - edge, z);
	}
	const railGeo = new BufferGeometry();
	railGeo.setAttribute('position', new BufferAttribute(new Float32Array(railPts), 3));
	const railMat = new PointsMaterial({
		color: new Color(pal.ring),
		size: 0.028,
		sizeAttenuation: true,
		transparent: true,
		opacity: 0.75,
		depthWrite: false
	});
	const rails = new Points(railGeo, railMat);
	helix.add(rails);

	// ── Camera + layout ──────────────────────────────────────────────────────────────
	let W = 1;
	let H = 1;
	let layout: HelixLayout = { focusY: 0.5, boxW: 400, boxH: 260 };
	let dist = 10;
	let focusY = -1;
	let px = 0;
	let py = 0;
	let tx = 0;
	let ty = 0;
	let tilt = 0;
	let hover = -1;
	const hoverAmt = projects.map(() => 0);
	const look = new Vector3();

	const targetDist = () => {
		const f = H / (2 * Math.tan((FOV * Math.PI) / 360));
		const byH = (HELIX.cardH * f) / Math.max(80, layout.boxH);
		const byW = (HELIX.cardW * f) / Math.max(120, layout.boxW);
		return Math.max(byH, byW);
	};

	const fit = () => {
		W = canvas.clientWidth;
		H = canvas.clientHeight;
		if (!W || !H) return;
		renderer.setSize(W, H, false);
		camera.aspect = W / H;
		if (focusY < 0) {
			focusY = layout.focusY;
			dist = targetDist();
		}
		needsRender = true;
	};
	fit();

	const ro = new ResizeObserver(fit);
	ro.observe(canvas);

	const recolor = () => {
		pal = readPalette();
		railMat.color.set(pal.ring);
		for (const c of cards) c.back.material.color.set(pal.lineStrong);
		redrawAll();
		render();
	};
	const mo = new MutationObserver(recolor);
	mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

	let lastPos = Number.NaN;
	const render = () => {
		renderer.render(scene, camera);
		needsRender = false;
	};

	const frame = (pos: number, speed: number, dt: number) => {
		if (!W || !H) return;
		const k = 1 - Math.exp(-dt * 6);
		// Layout + parallax, eased.
		const d0 = targetDist();
		dist += (d0 - dist) * k;
		focusY += (layout.focusY - focusY) * k;
		px += (tx - px) * (1 - Math.exp(-dt * 4));
		py += (ty - py) * (1 - Math.exp(-dt * 4));
		const tTilt = Math.max(-0.07, Math.min(0.07, -speed * 0.025));
		tilt += (tTilt - tilt) * (1 - Math.exp(-dt * 5));

		let moving =
			Math.abs(d0 - dist) > 1e-4 ||
			Math.abs(layout.focusY - focusY) > 0.05 ||
			Math.abs(tx - px) > 1e-4 ||
			Math.abs(ty - py) > 1e-4 ||
			Math.abs(tTilt - tilt) > 1e-4 ||
			pos !== lastPos;
		for (let i = 0; i < total; i++) {
			const h = i === hover ? 1 : 0;
			const before = hoverAmt[i];
			hoverAmt[i] += (h - before) * (1 - Math.exp(-dt * 10));
			if (Math.abs(hoverAmt[i] - before) > 1e-4) moving = true;
		}
		if (!moving && !needsRender) return;
		lastPos = pos;

		const front = R + HELIX.push;
		camera.position.set(px * 1.1, -py * 0.6, front + dist);
		look.set(0, 0, front - 4);
		camera.lookAt(look);
		camera.setViewOffset(W, H, 0, H / 2 - focusY, W, H);
		camera.updateProjectionMatrix();

		helix.rotation.y = -pos * step;
		helix.position.y = pos * rise;
		helix.rotation.z = tilt;

		for (let i = 0; i < total; i++) {
			const c = cards[i];
			const ad = Math.abs(i - pos);
			const a = smooth(1 - Math.min(ad, 1));
			const r = R + HELIX.push * a;
			c.group.position.set(Math.sin(c.theta) * r, -i * rise, Math.cos(c.theta) * r);
			c.group.scale.setScalar(0.82 + 0.18 * a + 0.025 * hoverAmt[i]);
			const op = ad < 1 ? 1 - 0.3 * smooth(ad) : Math.max(0, 0.7 - 0.28 * (ad - 1));
			c.group.visible = op > 0.02;
			c.front.material.opacity = op;
			c.back.material.opacity = op * 0.28;
			c.front.material.color.setScalar(1 - 0.1 * Math.min(1, ad));
			// Nearest cards draw last so the transparent sort never lets a far card cover them.
			c.group.renderOrder = -Math.round(ad * 10);
		}
		render();
	};

	const raycaster = new Raycaster();
	const ndc = new Vector2();
	const fronts = cards.map((c) => c.front);
	const pick = (clientX: number, clientY: number) => {
		const r = canvas.getBoundingClientRect();
		if (!r.width || !r.height) return -1;
		ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
		raycaster.setFromCamera(ndc, camera);
		for (const hit of raycaster.intersectObjects(fronts, false)) {
			const m = hit.object as Mesh<PlaneGeometry, MeshBasicMaterial>;
			if (m.parent?.visible && m.material.opacity > 0.3) return m.userData.index as number;
		}
		return -1;
	};

	return {
		frame,
		setLayout(l) {
			layout = l;
			if (focusY < 0) fit();
			needsRender = true;
		},
		setPointer(x, y = 0) {
			tx = x ?? 0;
			ty = x === null ? 0 : y;
		},
		pick,
		setHover(i) {
			hover = i;
		},
		dispose() {
			disposed = true;
			ro.disconnect();
			mo.disconnect();
			for (const im of images.values()) {
				im.el.onload = null;
				im.el.onerror = null;
			}
			for (const c of cards) {
				c.tex.dispose();
				c.front.material.dispose();
				c.back.material.dispose();
			}
			backTex.dispose();
			geo.dispose();
			railGeo.dispose();
			railMat.dispose();
			renderer.dispose();
		}
	};
}
