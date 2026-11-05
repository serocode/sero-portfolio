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
