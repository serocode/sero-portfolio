<!--
  "Live drafting" (v4) across the whole page. Cursors enter from random directions (the hero's
  and About's first cursor bursts out of the orbiting comet). They work through each group in
  reading order, drawing a measuring box with handles and a "Label W × H" tag around every
  marked element. Each box holds briefly and fades; when a group is done the cursors drift off.

  Only what is on screen gets drafted. Anything skipped by a fast scroll or a nav jump waits,
  and is drafted when it comes back into view. Client-only. GSAP is lazy-loaded (not in the
  initial chunk). Off for prefers-reduced-motion. The effect itself is src/lib/motion/live-drafting.js.

  Mount once, after the sections:   <LiveDrafting />

  Groups (one per region): data-draft-group, plus
      data-draft-cursors="1–6"   data-draft-origin="comet"   data-draft-autoplay="<s>"
      data-draft-local (overlay inside the element: sticky header)
      data-draft-card (a stacked deck card, a direct child of the deck; implies local)
      data-draft-start="top bottom"   data-draft-inset="0"
  Targets (inside a group; each belongs to its nearest group):
      data-draft="Label"  required, the tag text
      data-draft-text     measure the text's own box (headings, paragraphs)
      data-draft-fit      shrink-wrap a full-width row to its children (eyebrow rows)
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { DraftGroup, LiveDrafting } from '$lib/motion/live-drafting.js';
	import { comet } from '$lib/three/comet';

	let {
		name = 'Anthony',
		/** Sticky header height: targets under it count as off screen. Default: the `--header-h` token. */
		headerInset,
		/** Seconds after the intro loader's curtain starts lifting before timed groups may start. */
		loaderDelay = 0.6,
		/** > 1 = faster cursor moves, drags and pauses. */
		speed = 1.7,
		/** Seconds a finished box holds before fading, [min, max]. Long enough that several boxes
		    overlap and the page reads as still being reconstructed. */
		hold = [2.4, 3.4]
	}: {
		name?: string;
		headerInset?: number;
		loaderDelay?: number;
		speed?: number;
		hold?: [number, number];
	} = $props();

	/** Resolves once <html data-loader> is gone (the loader lifts, or never showed). */
	function loaderGone(root: HTMLElement) {
		return new Promise<boolean>((resolve) => {
			if (!root.dataset.loader) return resolve(false);
			const mo = new MutationObserver(() => {
				if (root.dataset.loader) return;
				mo.disconnect();
				resolve(true);
			});
			mo.observe(root, { attributes: true, attributeFilter: ['data-loader'] });
		});
	}

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let fx: LiveDrafting | undefined;
		let cancelled = false;
		const cleanups: (() => void)[] = [];
		const root = document.documentElement;
		const fromComet = () => (comet.ready ? { x: comet.x, y: comet.y } : null);

		(async () => {
			const [{ gsap }, { ScrollTrigger }, { createLiveDrafting }, hadLoader] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger'),
				import('$lib/motion/live-drafting.js'),
				loaderGone(root)
			]);
			if (cancelled) return;

			const inset =
				headerInset ??
				(Number.parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 64);
			const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-draft-group]'));

			const groups: DraftGroup[] = nodes.map((node) => {
				const d = node.dataset;
				const targets = Array.from(node.querySelectorAll<HTMLElement>('[data-draft]'))
					// a target belongs to its nearest group (cards sit inside the Projects section)
					.filter((el) => el.closest('[data-draft-group]') === node)
					.map((el) => ({
						el,
						label: el.dataset.draft,
						text: el.dataset.draftText !== undefined,
						fit: el.dataset.draftFit !== undefined
					}));

				const g: DraftGroup = {
					node,
					targets,
					cursors: d.draftCursors ? Number(d.draftCursors) : 2,
					local: d.draftLocal !== undefined || d.draftCard !== undefined,
					start: d.draftStart || undefined,
					topInset: d.draftInset !== undefined ? Number(d.draftInset) : undefined,
					origin: d.draftOrigin === 'comet' ? fromComet : undefined
				};
				if (d.draftAutoplay !== undefined) {
					g.autoplay = { delay: Number(d.draftAutoplay || 0) + (hadLoader ? loaderDelay : 0) };
				}
				// Stacked project cards are sticky, so they never "enter" by normal scroll —
				// start each one when its slot in the deck reaches the lower part of the screen.
				const deck = node.parentElement;
				if (d.draftCard !== undefined && deck) {
					const cards = Array.from(
						deck.querySelectorAll<HTMLElement>(':scope > [data-draft-card]')
					);
					const i = cards.indexOf(node);
					g.range = () => {
						// The deck's gap changes at the 820px breakpoint, so read it live.
						const gap = Number.parseFloat(getComputedStyle(deck).rowGap) || 0;
						let top = deck.getBoundingClientRect().top + window.scrollY;
						for (let j = 0; j < i; j++) top += cards[j].offsetHeight + gap;
						return { start: top - window.innerHeight * 0.75 };
					};
				}
				return g;
			});

			fx = createLiveDrafting({
				gsap,
				ScrollTrigger,
				groups: groups.filter((g) => g.targets.length),
				name,
				speed,
				hold,
				topInset: inset,
				accent: 'var(--color-accent)',
				onAccent: 'var(--color-on-accent)',
				handleFill: 'var(--color-paper)'
			});

			const refresh = () => fx?.refresh();
			document.fonts?.ready.then(refresh);
			if (document.readyState !== 'complete')
				window.addEventListener('load', refresh, { once: true });
			window.addEventListener('layout-settled', refresh);
			const mo = new MutationObserver(refresh);
			mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
			cleanups.push(
				() => mo.disconnect(),
				() => window.removeEventListener('layout-settled', refresh),
				() => window.removeEventListener('load', refresh)
			);
		})();

		return () => {
			cancelled = true;
			for (const f of cleanups) f();
			fx?.destroy();
		};
	});
</script>
