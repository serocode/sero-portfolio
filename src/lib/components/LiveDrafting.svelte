<script lang="ts">
	import { onMount } from 'svelte';
	import type { DraftGroup, LiveDrafting } from '$lib/motion/live-drafting.js';
	import { comet } from '$lib/three/comet';

	let {
		name = 'Anthony',
		headerInset,
		loaderDelay = 0.6,
		speed = 1.7,
		hold = [2.4, 3.4]
	}: {
		name?: string;
		headerInset?: number;
		loaderDelay?: number;
		speed?: number;
		hold?: [number, number];
	} = $props();

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

	// Resolves on the visitor's first input. The header and hero runs are decoration over content
	// that's already there, so they wait for someone to engage instead of redrawing the page while it
	// is still settling (which cost ~2.7s of mobile Speed Index). Setup itself still happens at load:
	// its global ScrollTrigger refresh would cancel a smooth scroll in flight if it ran later.
	function firstInteraction(cleanups: (() => void)[]) {
		// No 'scroll': a restored or scripted scroll isn't engagement, and every real scroll starts with
		// one of these (touch, wheel, scrollbar pointerdown, keys).
		const events = ['pointermove', 'pointerdown', 'touchstart', 'wheel', 'keydown'];
		return new Promise<void>((resolve) => {
			const go = () => {
				off();
				resolve();
			};
			const off = () => {
				for (const e of events) window.removeEventListener(e, go);
			};
			for (const e of events) window.addEventListener(e, go, { once: true, passive: true });
			cleanups.push(off);
		});
	}

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let fx: LiveDrafting | undefined;
		let cancelled = false;
		const cleanups: (() => void)[] = [];
		const root = document.documentElement;
		const fromComet = () => (comet.ready ? { x: comet.x, y: comet.y } : null);

		const engaged = firstInteraction(cleanups);

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
					g.autoplay = {
						delay: Number(d.draftAutoplay || 0) + (hadLoader ? loaderDelay : 0),
						after: engaged
					};
				}
				const deck = node.parentElement;
				if (d.draftCard !== undefined && deck) {
					const cards = Array.from(
						deck.querySelectorAll<HTMLElement>(':scope > [data-draft-card]')
					);
					const i = cards.indexOf(node);
					g.range = () => {
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
				// Skip groups that aren't laid out (e.g. the project deck while the helix shows).
				groups: groups.filter((g) => g.targets.length && g.node?.getClientRects().length),
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
