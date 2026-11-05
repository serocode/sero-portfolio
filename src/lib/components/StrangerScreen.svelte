<!--
  While the browser's DevTools are open (src/lib/devtools.ts), the site gives way to one quiet
  screen: the hero's 3D sphere and "Hello stranger" (src/lib/content/stranger.ts), and the console
  greets the visitor the same way. Close DevTools and the site is back exactly as it was.

  A visual deterrent, not protection. The site underneath is never unmounted: it's covered, then
  hidden (`stranger-veiled:invisible` on the page) once the screen is opaque, and scrolling is
  locked (`stranger:overflow-hidden` on <body>, plus the scroll keys), so scroll position, open
  tabs, flipped cards and filters all survive. Desktop Chromium only.
  In `pnpm dev`, open the site with ?nostranger to switch it off for that tab while you debug
  (?stranger switches it back on).
  Reduced motion: no fades or blur, and the sphere is a still frame.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { blur, fade } from 'svelte/transition';
	import { stranger, strangerText } from '$lib/content/stranger';
	import { canWatchDevtools, watchDevtools } from '$lib/devtools';
	import { ease, MOTION_MS } from '$lib/motion';
	import { prefersReducedMotion } from '$lib/utils/format';

	let open = $state(false);
	let canvas = $state<HTMLCanvasElement>();
	let sceneReady = $state(false);
	const ms = (n: number) => (prefersReducedMotion() ? 0 : n);

	/** The console greeting: an accent tag like the site's collaborator cursors, in its own fonts. */
	function greet() {
		const css = getComputedStyle(document.documentElement);
		const v = (name: string) => css.getPropertyValue(name).trim();
		console.log(
			`%c${strangerText}`,
			[
				`font: 600 24px/1.4 ${v('--font-sans')}`,
				'letter-spacing: -0.03em',
				`color: ${v('--color-on-accent')}`,
				`background: ${v('--color-accent')}`,
				'padding: 6px 14px',
				'border-radius: 8px'
			].join(';')
		);
	}

	/** Dev only: ?nostranger turns the screen off for this tab (kept across reloads), ?stranger on. */
	function devOptOut() {
		const q = new URLSearchParams(location.search);
		try {
			if (q.has('nostranger')) sessionStorage.setItem('nostranger', '1');
			if (q.has('stranger')) sessionStorage.removeItem('nostranger');
			return sessionStorage.getItem('nostranger') === '1';
		} catch {
			return q.has('nostranger');
		}
	}

	onMount(() => {
		if (import.meta.env.DEV && devOptOut()) return;
		if (!canWatchDevtools()) return;
		return watchDevtools({
			onChange: (next) => {
				open = next;
				// Closing: show the site again first, then the screen fades off it.
				if (!next) delete document.documentElement.dataset.stranger;
				else document.documentElement.dataset.stranger = '';
			},
			whileOpen: greet
		});
	});

	// The page can't scroll underneath: <body> is overflow-hidden (wheel, touchpad), and Chrome still
	// scrolls the page from the keyboard, so those keys do nothing while the screen is up. Keys
	// with a modifier (zoom, shortcuts) pass through.
	const SCROLL_KEYS = new Set([' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown']);
	$effect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (SCROLL_KEYS.has(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) e.preventDefault();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	// The hero's scene, a second copy (three.js is already cached from the hero) for as long as the
	// screen is up. It doesn't publish its comet, so live drafting keeps launching from the hero's.
	$effect(() => {
		if (!canvas) return;
		const el = canvas;
		let scene: { dispose(): void } | undefined;
		let cancelled = false;
		import('$lib/three/hero-scene')
			.then(({ createHeroScene }) => {
				if (cancelled) return;
				scene = createHeroScene(el, { publishComet: false });
				sceneReady = true;
			})
			.catch(() => {}); // no WebGL / chunk failed: the words stand alone
		return () => {
			cancelled = true;
			scene?.dispose();
			sceneReady = false;
		};
	});
</script>

{#if open}
	<div
		class="fixed inset-0 z-1100 grid place-items-center overflow-hidden bg-paper select-none"
		transition:fade={{ duration: ms(MOTION_MS), easing: ease }}
		onintroend={() => {
			if (open) document.documentElement.dataset.stranger = 'veiled';
		}}
	>
		<canvas
			bind:this={canvas}
			class={[
				'pointer-events-none absolute size-[min(92vmin,760px)] transition-opacity duration-1600 ease-smooth',
				sceneReady ? 'opacity-100' : 'opacity-0'
			]}
			aria-hidden="true"
		></canvas>
		<p
			class="relative px-5 text-center text-[clamp(44px,9vw,104px)] leading-[0.98] font-bold tracking-[-0.045em] text-ink"
		>
			<span
				class="inline-block"
				in:blur={{ amount: 10, duration: ms(1100), delay: ms(260), easing: ease }}
				>{stranger.lead}</span
			>
			<span
				class="inline-block text-accent-600"
				in:blur={{ amount: 10, duration: ms(1100), delay: ms(620), easing: ease }}
				>{stranger.accent}</span
			>
		</p>
	</div>
{/if}
