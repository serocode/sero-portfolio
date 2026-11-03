/*!
 * Live drafting v4 — the page looks like it's being drafted live, in real time.
 * Each group (section, header, hero, project card, footer) starts when it scrolls into view
 * (or on a timer). A few cursors enter from random directions — the first can burst out of a
 * given origin, e.g. the hero's orbiting comet — and work through the group's elements in
 * reading order like people would: curved, slightly wobbly moves with a small overshoot,
 * short "thinking" pauses, then press-and-drag a marquee around each element. Handles and a
 * live "Label W × H" tag pop in; each box holds briefly and fades; when the queue is empty
 * the cursors drift off and fade. Only targets the reader can actually see get drafted;
 * anything skipped by a fast scroll or a nav jump waits and is drafted when it comes back
 * into view. Randomised per visit.
 *
 * Requires GSAP 3 + ScrollTrigger. Framework-agnostic ES module.
 *   createLiveDrafting({ gsap, ScrollTrigger, groups: [
 *     { node, targets: [{ el: 'h2', label: 'H2', text: true }, { el: '.row', label: 'Row', all: true, max: 3 }],
 *       cursors: 2, origin: () => ({ x, y }), autoplay: { delay: 3 }, start: 'top 85%', topInset: 0,
 *       local: true, range: () => ({ start }) }   // local = overlay inside node (sticky cards, header)
 *   ] })
 * Performance: layout is read once when a group starts (and on refresh). Frames write only
 * transforms, opacity and SVG attributes on a pointer-events:none overlay.
 */
const NS = 'http://www.w3.org/2000/svg';
const CSS =
	// The layer covers <body> (which must be position:relative) and clips, so the tall overlays
	// never add scroll height or width to the page.
	'.hx-layer{position:absolute;inset:0;overflow:clip;pointer-events:none;z-index:15}' +
	'.hx{position:absolute;left:0;top:0;overflow:visible;pointer-events:none}' +
	'.hx-label text,.hx-tag text{font:500 10.5px/1 var(--font-mono,ui-monospace,monospace);letter-spacing:.02em}';
const PAINT = { fill: 1, stroke: 1 };
function el(tag, attrs, parent) {
	const n = document.createElementNS(NS, tag);
	for (const k in attrs) {
		if (PAINT[k] && String(attrs[k]).indexOf('var(') === 0) n.style[k] = attrs[k];
		else n.setAttribute(k, attrs[k]);
	}
	if (parent) parent.appendChild(n);
	return n;
}
const clamp = (v, a, b) => (v < a ? a : Math.min(v, b));
const f1 = (v) => Math.round(v * 10) / 10;
const CURSOR = 'M0 0 L0 17.5 L4.6 13.1 L7.6 19.8 L10.4 18.6 L7.4 12 L13.6 12 Z';
function mulberry(seed) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function createLiveDrafting(o) {
	const gsap = o.gsap,
		ST = o.ScrollTrigger;
	const noop = { refresh: () => {}, destroy: () => {} };
	if (!gsap || !ST || typeof window === 'undefined') return noop;
	if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return noop;
	gsap.registerPlugin(ST);

	const R = mulberry(o.seed != null ? o.seed : (Math.random() * 2147483647) | 0);
	const rand = (a, b) => a + (b - a) * R();
	const accent = o.accent || '#f97316';
	const onAccent = o.onAccent || '#0d1117';
	const handleFill = o.handleFill || '#ffffff';
	const name = o.name || 'Anthony';
	const speed = o.speed || 1; // >1 = faster
	// Seconds each finished box stays up before fading. Not scaled by `speed`: a long hold keeps
	// several boxes on screen at once, so the region reads as still being reconstructed.
	const hold = o.hold || [1.0, 1.6];
	const topInset = o.topInset || 0; // height of a sticky header covering the top of the viewport

	const style = document.createElement('style');
	style.textContent = CSS;
	document.head.appendChild(style);
	const layer = document.createElement('div');
	layer.className = 'hx-layer';
	layer.setAttribute('aria-hidden', 'true');
	document.body.appendChild(layer);

	const groups = [],
		triggers = [],
		calls = [];
	(o.groups || []).forEach((cfg) => {
		const node = cfg.node || (cfg.id ? document.getElementById(cfg.id) : null);
		if (!node) return;
		const G = makeGroup(node, cfg);
		if (G) groups.push(G);
	});

	function collect(node, cfg) {
		const out = [],
			seen = [];
		(cfg.targets || []).forEach((t) => {
			let list = [];
			if (typeof t.el !== 'string') list = [t.el];
			else if (t.all)
				list = Array.prototype.slice.call(node.querySelectorAll(t.el), 0, t.max || 99);
			else {
				const n = node.querySelector(t.el);
				if (n) list = [n];
			}
			list.forEach((n) => {
				if (seen.indexOf(n) >= 0) return;
				seen.push(n);
				out.push({ node: n, label: t.label || n.tagName, text: !!t.text, fit: !!t.fit });
			});
		});
		return out;
	}

	function makeGroup(node, cfg) {
		const targets = collect(node, cfg);
		if (!targets.length) return null;
		const G = {
			node: node,
			cfg: cfg,
			local: !!cfg.local,
			state: 'idle',
			targets: targets,
			cursors: [],
			queue: [],
			oy: 0
		};
		G.svg = el('svg', { class: 'hx', width: 1, height: 1 });
		G.svg.style.visibility = 'hidden';
		if (G.local) {
			G.svg.style.zIndex = '6';
			node.appendChild(G.svg);
		} else layer.appendChild(G.svg);
		G.boxes = el('g', {}, G.svg);
		G.spark = el(
			'circle',
			{ r: 3, fill: 'none', stroke: accent, 'stroke-width': 1.4, opacity: 0 },
			G.svg
		);
		targets.forEach((T) => {
			T.g = el('g', { opacity: 0 }, G.boxes);
			T.rect = el(
				'rect',
				{
					fill: accent,
					'fill-opacity': 0.05,
					stroke: accent,
					'stroke-width': 1.25,
					rx: 2,
					width: 0,
					height: 0
				},
				T.g
			);
			T.cross = [
				el('line', { stroke: accent, 'stroke-width': 1.1 }, T.g),
				el('line', { stroke: accent, 'stroke-width': 1.1 }, T.g)
			];
			T.ring = el(
				'circle',
				{ r: 4, fill: 'none', stroke: accent, 'stroke-width': 1.1, opacity: 0 },
				T.g
			);
			T.handles = [];
			for (let h = 0; h < 4; h++)
				T.handles.push(
					el(
						'rect',
						{
							width: 7,
							height: 7,
							x: -3.5,
							y: -3.5,
							fill: handleFill,
							stroke: accent,
							'stroke-width': 1.2,
							transform: 'scale(0)'
						},
						T.g
					)
				);
			T.lab = el('g', { class: 'hx-label', opacity: 0 }, T.g);
			T.labBg = el('rect', { rx: 4, height: 20, fill: accent }, T.lab);
			T.labText = el('text', { x: 7, y: 13.6, fill: onAccent }, T.lab);
		});
		const n = clamp(cfg.cursors || 2, 1, Math.min(6, targets.length));
		for (let i = 0; i < n; i++) {
			const C = { i: i, x: 0, y: 0, scale: 1, vis: 0, active: false, hist: [], tilt: 0 };
			C.trail = el(
				'polyline',
				{
					fill: 'none',
					stroke: accent,
					'stroke-width': 1.5,
					'stroke-linecap': 'round',
					'stroke-dasharray': '0.01 6',
					opacity: 0
				},
				G.svg
			);
			C.streak = el(
				'polyline',
				{
					fill: 'none',
					stroke: accent,
					'stroke-width': 2,
					'stroke-linecap': 'round',
					'stroke-linejoin': 'round',
					opacity: 0
				},
				G.svg
			);
			C.dots = [];
			for (let d = 0; d < 4; d++)
				C.dots.push(el('circle', { r: 2.6 - d * 0.45, fill: accent, opacity: 0 }, G.svg));
			C.g = el('g', { opacity: 0 }, G.svg);
			C.body = el('g', {}, C.g);
			el(
				'path',
				{
					d: CURSOR,
					fill: accent,
					stroke: handleFill,
					'stroke-width': 1.3,
					'stroke-linejoin': 'round'
				},
				C.body
			);
			if (i === 0 && !G.local) {
				C.tag = el('g', { class: 'hx-tag', transform: 'translate(14 20)' }, C.g);
				C.tagBg = el('rect', { rx: 4, height: 18, fill: accent }, C.tag);
				const tt = el('text', { x: 6, y: 12.6, fill: onAccent }, C.tag);
				tt.textContent = name;
				C.tagText = tt;
			}
			G.cursors.push(C);
		}
		if (cfg.autoplay) {
			calls.push(
				gsap.delayedCall(cfg.autoplay.delay || 0, () => {
					start(G);
				})
			);
		} else {
			triggers.push(
				ST.create({
					trigger: G.local ? document.documentElement : node,
					start: cfg.range ? () => cfg.range().start : cfg.start || 'top 85%',
					once: true,
					onEnter: () => {
						start(G);
					}
				})
			);
		}
		return G;
	}

	// Shrink-wrap a full-width row (e.g. an eyebrow flex row) to the children it actually shows.
	function unionRect(kids) {
		let l = Infinity,
			t = Infinity,
			r = -Infinity,
			b = -Infinity;
		for (let k = 0; k < kids.length; k++) {
			const q = kids[k].getBoundingClientRect();
			if (q.width < 1 || q.height < 1) continue;
			l = Math.min(l, q.left);
			t = Math.min(t, q.top);
			r = Math.max(r, q.right);
			b = Math.max(b, q.bottom);
		}
		if (l === Infinity) return kids[0].parentNode.getBoundingClientRect();
		return { left: l, top: t, width: r - l, height: b - t, right: r, bottom: b };
	}

	// A target is worth drafting only while the reader can actually see it.
	function inView(G, T) {
		const r = T.node.getBoundingClientRect();
		const inset = G.cfg.topInset != null ? G.cfg.topInset : topInset;
		return r.height > 0 && r.bottom > inset + 16 && r.top < window.innerHeight - 24;
	}
	function takeVisible(G) {
		for (let q = 0; q < G.queue.length; q++) {
			if (inView(G, G.queue[q])) return G.queue.splice(q, 1)[0];
		}
		return null;
	}

	function offsetIn(node, box) {
		let x = 0,
			y = 0,
			n = node;
		while (n && n !== box) {
			x += n.offsetLeft || 0;
			y += n.offsetTop || 0;
			n = n.offsetParent;
		}
		return { x: x, y: y };
	}
	// Vertical offset still pending from entrance motion (a section's reveal `translate`, the hero's
	// rise keyframes) on the target or its ancestors inside the group, so boxes land where the
	// element comes to rest rather than where it is mid-rise.
	function revealTy(node, within) {
		let ty = 0,
			n = node;
		while (n && n.nodeType === 1) {
			const cs = getComputedStyle(n);
			if (cs.translate && cs.translate !== 'none')
				ty += parseFloat(cs.translate.split(' ')[1]) || 0;
			if (cs.transform && cs.transform !== 'none') {
				try {
					ty += new DOMMatrixReadOnly(cs.transform).m42 || 0;
				} catch (_e) {}
			}
			if (n === within) break;
			n = n.parentElement;
		}
		return ty;
	}

	function measure(G) {
		let sx = window.scrollX,
			sy = window.scrollY,
			box = G.node,
			scale = 1;
		let W,
			minY = Infinity,
			maxY = -Infinity;
		if (G.local) {
			try {
				scale = new DOMMatrixReadOnly(getComputedStyle(box).transform).a || 1;
			} catch (_e) {}
			W = box.offsetWidth;
		} else W = document.documentElement.scrollWidth;
		G.targets.forEach((T) => {
			let n = T.node,
				x,
				y,
				w,
				h,
				rr;
			if (T.text) {
				const rg = document.createRange();
				rg.selectNodeContents(n);
				rr = rg.getBoundingClientRect();
			} else if (T.fit && n.children.length) rr = unionRect(n.children);
			else rr = n.getBoundingClientRect();
			if (G.local) {
				if (n.offsetParent !== undefined && n.offsetLeft !== undefined) {
					const off = offsetIn(n, box);
					x = off.x;
					y = off.y;
					if (T.text) {
						const nr = n.getBoundingClientRect();
						x += (rr.left - nr.left) / scale;
						y += (rr.top - nr.top) / scale;
					}
				} else {
					const br = box.getBoundingClientRect();
					x = (rr.left - br.left) / scale;
					y = (rr.top - br.top) / scale;
				}
				w = rr.width / scale;
				h = rr.height / scale;
			} else {
				x = rr.left + sx;
				y = rr.top + sy - revealTy(n, G.node);
				w = rr.width;
				h = rr.height;
			}
			const pad = T.text ? 7 : 5;
			T.B = { x: x - pad, y: y - pad, w: w + pad * 2, h: h + pad * 2, rw: w, rh: h };
			T.hidden = !(w > 2 && h > 2);
			minY = Math.min(minY, T.B.y);
			maxY = Math.max(maxY, T.B.y + T.B.h);
		});
		if (G.local) {
			G.oy = 0;
			G.svg.setAttribute('width', W);
			G.svg.setAttribute('height', box.offsetHeight);
		} else {
			G.oy = minY - 700;
			G.svg.style.top = `${G.oy}px`;
			G.svg.setAttribute('width', W);
			G.svg.setAttribute('height', Math.ceil(maxY - G.oy + 400));
		}
		// local coordinates + static cue geometry
		G.targets.forEach((T) => {
			const B = { x: T.B.x, y: T.B.y - G.oy, w: T.B.w, h: T.B.h };
			T.Bl = B;
			T.rect.setAttribute('x', f1(B.x));
			T.rect.setAttribute('y', f1(B.y));
			T.ring.setAttribute('cx', f1(B.x));
			T.ring.setAttribute('cy', f1(B.y));
			T.corners = [
				[B.x, B.y],
				[B.x + B.w, B.y],
				[B.x + B.w, B.y + B.h],
				[B.x, B.y + B.h]
			];
			T.labText.textContent = `${T.label}  ${Math.round(T.B.rw)} × ${Math.round(T.B.rh)}`;
			T.labW = T.labText.getComputedTextLength() + 14;
			T.labBg.setAttribute('width', f1(T.labW));
		});
		placeLabels(G, W);
		G.cursors.forEach((C) => {
			if (C.tag) C.tagBg.setAttribute('width', f1(C.tagText.getComputedTextLength() + 12));
		});
	}

	// Size tags: above-right, right, left margin, inside top-right, below — first spot that
	// doesn't collide with another box or tag in the group.
	function placeLabels(G, maxW) {
		const taken = G.targets.map((T) => T.Bl);
		const hit = (r, self) => {
			for (let t = 0; t < taken.length; t++) {
				const q = taken[t];
				if (q === self) continue;
				if (r.x < q.x + q.w && r.x + r.w > q.x && r.y < q.y + q.h && r.y + r.h > q.y) return true;
			}
			return false;
		};
		G.targets.forEach((T) => {
			const B = T.Bl,
				w = T.labW;
			let cands = [
				{ x: B.x + B.w - w, y: B.y - 26 },
				{ x: B.x + B.w + 10, y: B.y + 2 },
				{ x: B.x - w - 10, y: B.y + 2 },
				{ x: B.x + B.w - w - 6, y: B.y + 6, inside: true },
				{ x: B.x, y: B.y + B.h + 6 }
			].filter((c) => c.x >= 2 && c.x + w <= maxW - 2);
			if (!cands.length) cands = [{ x: B.x + 6, y: B.y + 6, inside: true }];
			let pick = null,
				inside = null;
			for (let c = 0; c < cands.length; c++) {
				if (!hit({ x: cands[c].x, y: cands[c].y, w: w, h: 20 }, B)) {
					pick = cands[c];
					break;
				}
				if (cands[c].inside) inside = cands[c];
			}
			pick = pick || inside || cands[0];
			T.labPos = pick;
			taken.push({ x: pick.x, y: pick.y, w: w, h: 20 });
		});
	}

	function entryFor(G, C, T) {
		if (C.i === 0 && G.cfg.origin) {
			let p = null;
			try {
				p = G.cfg.origin();
			} catch (_e) {}
			if (p) return { x: p.x - (G.local ? 0 : 0), y: p.y - G.oy, burst: true };
		}
		// Random direction: left, right, above, below or a diagonal.
		const dirs = [180, 0, -90, 90, -140, -40, 140, 40];
		const a = ((dirs[Math.floor(rand(0, dirs.length))] + rand(-18, 18)) * Math.PI) / 180;
		const dist = rand(260, 560);
		const W = parseFloat(G.svg.getAttribute('width')) || window.innerWidth;
		const x = clamp(T.Bl.x + Math.cos(a) * dist, -24, W + 24);
		const y = T.Bl.y + Math.sin(a) * dist;
		return { x: x, y: y };
	}

	function start(G) {
		if (G.state !== 'idle') return;
		measure(G);
		G.queue = G.targets
			.filter((T) => !T.hidden)
			.slice()
			.sort((a, b) => (Math.abs(a.Bl.y - b.Bl.y) < 24 ? a.Bl.x - b.Bl.x : a.Bl.y - b.Bl.y));
		G.live = 0;
		spawn(G, true);
	}

	// Bring cursors in — at first entry, or when the reader scrolls back to parts not yet drafted.
	function spawn(G, first) {
		const vis = G.queue.filter((T) => inView(G, T));
		if (!vis.length) {
			G.state = G.queue.length ? 'waiting' : 'done';
			return;
		}
		if (!first) measure(G);
		G.state = 'running';
		G.svg.style.visibility = 'visible';
		let k = 0;
		G.cursors.forEach((C, i) => {
			if (C.active || k >= vis.length) return;
			G.live++;
			const T0 = vis[k++];
			const e = entryFor(G, first ? C : { i: -1 }, T0);
			C.x = e.x;
			C.y = e.y;
			C.hist = [];
			C.active = true;
			calls.push(
				gsap.delayedCall((i * rand(0.18, 0.5)) / speed, () => {
					if (e.burst) {
						G.spark.setAttribute('cx', f1(e.x));
						G.spark.setAttribute('cy', f1(e.y));
						gsap.fromTo(
							G.spark,
							{ attr: { r: 3 }, opacity: 0.9 },
							{ attr: { r: 18 }, opacity: 0, duration: 0.6, ease: 'power2.out' }
						);
					}
					gsap.fromTo(
						C,
						{ vis: 0, scale: e.burst ? 0.4 : 0.8 },
						{ vis: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
					);
					next(G, C);
				})
			);
		});
	}

	function next(G, C) {
		if (!G.queue.length) return exitCursor(G, C);
		const T = takeVisible(G);
		if (!T) {
			// Nothing on screen left to draft: hover a beat in case the reader keeps scrolling, then leave.
			C.wait = (C.wait || 0) + 1;
			if (C.wait > 5) {
				C.wait = 0;
				return exitCursor(G, C);
			}
			calls.push(
				gsap.delayedCall(0.25, () => {
					next(G, C);
				})
			);
			return;
		}
		C.wait = 0;
		calls.push(
			gsap.delayedCall(rand(0.05, 0.32) / speed, () => {
				moveTo(C, T.Bl.x, T.Bl.y, () => {
					draft(G, C, T);
				});
			})
		);
	}

	function moveTo(C, x, y, done) {
		const x0 = C.x,
			y0 = C.y,
			dx = x - x0,
			dy = y - y0,
			dist = Math.hypot(dx, dy) || 1;
		const nx = -dy / dist,
			ny = dx / dist;
		const bend = rand(-0.26, 0.26) * dist;
		const cx = x0 + dx * 0.5 + nx * bend,
			cy = y0 + dy * 0.5 + ny * bend;
		const over = rand(3, 9);
		const ox = x + (dx / dist) * over,
			oy = y + (dy / dist) * over;
		const dur = (clamp(0.32 + dist / 1500, 0.34, 1.15) * rand(0.85, 1.18)) / speed;
		const wob = rand(1, 3.2),
			wf = rand(1.5, 3.5),
			s = { t: 0 };
		gsap.to(s, {
			t: 1,
			duration: dur,
			ease: 'power3.inOut',
			onUpdate: () => {
				const t = s.t,
					u = 1 - t;
				const px = u * u * x0 + 2 * u * t * cx + t * t * ox,
					py = u * u * y0 + 2 * u * t * cy + t * t * oy;
				const w = Math.sin(t * Math.PI * wf) * wob * Math.sin(t * Math.PI);
				C.x = px + nx * w;
				C.y = py + ny * w;
			},
			onComplete: () => {
				gsap.to(C, { x: x, y: y, duration: 0.13 / speed, ease: 'power2.out', onComplete: done });
			}
		});
	}

	function draft(G, C, T) {
		const B = T.Bl,
			d = { w: 0, h: 0 },
			arm = { v: 0 };
		const dragDur = (clamp(0.26 + (B.w + B.h) / 2400, 0.28, 0.75) * rand(0.85, 1.2)) / speed;
		gsap.set(T.g, { opacity: 1 });
		T.lab.setAttribute('transform', `translate(${f1(T.labPos.x)} ${f1(T.labPos.y + 6)})`);
		const tl = gsap.timeline();
		tl.to(C, { scale: 0.86, duration: 0.07 })
			.add(() => {
				gsap.fromTo(
					T.ring,
					{ attr: { r: 3 }, opacity: 0.85 },
					{ attr: { r: 14 }, opacity: 0, duration: 0.5, ease: 'power2.out' }
				);
				gsap.to(arm, {
					v: 1,
					duration: 0.22,
					ease: 'power2.out',
					onUpdate: () => {
						const a = 13 * arm.v;
						T.cross[0].setAttribute('x1', f1(B.x - a));
						T.cross[0].setAttribute('x2', f1(B.x + a));
						T.cross[0].setAttribute('y1', f1(B.y));
						T.cross[0].setAttribute('y2', f1(B.y));
						T.cross[1].setAttribute('y1', f1(B.y - a));
						T.cross[1].setAttribute('y2', f1(B.y + a));
						T.cross[1].setAttribute('x1', f1(B.x));
						T.cross[1].setAttribute('x2', f1(B.x));
					}
				});
			})
			.to(d, {
				w: B.w,
				h: B.h,
				duration: dragDur,
				ease: 'power2.out',
				onUpdate: () => {
					T.rect.setAttribute('width', f1(d.w));
					T.rect.setAttribute('height', f1(d.h));
					C.x = B.x + d.w;
					C.y = B.y + d.h;
				}
			})
			.to(C, { scale: 1, duration: 0.09 })
			.add(() => {
				T.handles.forEach((hd, i) => {
					const c = T.corners[i],
						hs = { v: 0 };
					gsap.to(hs, {
						v: 1,
						duration: 0.32,
						delay: i * 0.035,
						ease: 'back.out(2.2)',
						onUpdate: () => {
							hd.setAttribute(
								'transform',
								'translate(' +
									f1(c[0]) +
									' ' +
									f1(c[1]) +
									') scale(' +
									Math.max(0, hs.v).toFixed(3) +
									')'
							);
						}
					});
				});
				gsap.to(T.lab, { opacity: 1, duration: 0.25, delay: 0.08 });
				gsap.to(T.lab, {
					attr: { transform: `translate(${f1(T.labPos.x)} ${f1(T.labPos.y)})` },
					duration: 0.3,
					delay: 0.08,
					ease: 'power2.out'
				});
				// hold, then fade this box softly
				gsap.to(T.g, {
					opacity: 0,
					duration: 0.8,
					delay: rand(hold[0], hold[1]),
					ease: 'power1.inOut'
				});
				next(G, C);
			});
	}

	function exitCursor(G, C) {
		const a = rand(0, Math.PI * 2),
			dist = rand(40, 90);
		gsap.to(C, {
			x: C.x + Math.cos(a) * dist,
			y: C.y + Math.sin(a) * dist,
			duration: 0.6,
			ease: 'power1.out'
		});
		gsap.to(C, {
			vis: 0,
			duration: 0.6,
			delay: 0.15,
			ease: 'power1.in',
			onComplete: () => {
				C.active = false;
				G.live--;
				if (G.live > 0) return;
				if (G.queue.length) {
					G.state = 'waiting';
					return;
				}
				calls.push(
					gsap.delayedCall(2.6, () => {
						if (G.state === 'running' && G.live <= 0) {
							G.state = 'done';
							G.svg.style.visibility = 'hidden';
						}
					})
				);
			}
		});
	}

	function renderCursor(C) {
		if (!C.active && C.vis <= 0) {
			C.g.setAttribute('opacity', 0);
			C.trail.setAttribute('opacity', 0);
			C.streak.setAttribute('opacity', 0);
			return;
		}
		const h = C.hist,
			last = h.length ? h[h.length - 1] : null;
		const vx = last ? C.x - last.x : 0,
			vy = last ? C.y - last.y : 0;
		const sp = Math.min(1, Math.hypot(vx, vy) / 14);
		h.push({ x: C.x, y: C.y });
		if (h.length > 16) h.shift();
		C.tilt += (clamp(vx * 0.9, -12, 12) - C.tilt) * 0.2;
		C.g.setAttribute('opacity', C.vis.toFixed(3));
		C.g.setAttribute('transform', `translate(${f1(C.x)} ${f1(C.y)})`);
		C.body.setAttribute('transform', `rotate(${f1(C.tilt)}) scale(${C.scale.toFixed(3)})`);
		const pts = h.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' ');
		C.trail.setAttribute('points', pts);
		C.trail.setAttribute('opacity', (0.55 * Math.min(1, sp * 2.2) * C.vis).toFixed(3));
		const tail = h
			.slice(-6)
			.map((p) => `${f1(p.x)},${f1(p.y)}`)
			.join(' ');
		C.streak.setAttribute('points', tail);
		C.streak.setAttribute('opacity', (0.45 * sp * C.vis).toFixed(3));
		for (let d = 0; d < C.dots.length; d++) {
			const q = h[Math.max(0, h.length - 3 - d * 3)];
			C.dots[d].setAttribute('cx', f1(q.x));
			C.dots[d].setAttribute('cy', f1(q.y));
			C.dots[d].setAttribute('opacity', (sp * (0.6 - d * 0.13) * C.vis).toFixed(3));
		}
	}

	const tick = () => {
		for (let i = 0; i < groups.length; i++) {
			const G = groups[i];
			if (G.state !== 'running' && G.state !== 'waiting') continue;
			for (let c = 0; c < G.cursors.length; c++) renderCursor(G.cursors[c]);
		}
	};
	gsap.ticker.add(tick);
	let pend = false;
	const onScroll = () => {
		if (pend) return;
		pend = true;
		requestAnimationFrame(() => {
			pend = false;
			groups.forEach((G) => {
				if (G.state === 'waiting') spawn(G, false);
			});
		});
	};
	window.addEventListener('scroll', onScroll, { passive: true });
	const onRefreshInit = () => {
		groups.forEach((G) => {
			if (G.state === 'running') measure(G);
		});
	};
	ST.addEventListener('refreshInit', onRefreshInit);

	return {
		_groups: groups, // for debugging: each has .state ('idle' | 'running' | 'waiting' | 'done')
		refresh: () => {
			ST.refresh();
		},
		destroy: () => {
			gsap.ticker.remove(tick);
			window.removeEventListener('scroll', onScroll);
			ST.removeEventListener('refreshInit', onRefreshInit);
			triggers.forEach((t) => {
				t.kill();
			});
			calls.forEach((c) => {
				c.kill();
			});
			groups.forEach((G) => {
				G.cursors.forEach((C) => {
					gsap.killTweensOf(C);
				});
				G.targets.forEach((T) => {
					gsap.killTweensOf(T.g);
					gsap.killTweensOf(T.lab);
				});
				if (G.svg.parentNode) G.svg.parentNode.removeChild(G.svg);
			});
			layer.remove();
			style.remove();
		}
	};
}

export default createLiveDrafting;
