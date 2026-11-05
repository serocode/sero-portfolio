<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import MaybeLink from '$lib/components/MaybeLink.svelte';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
	import { hero, site } from '$lib/content/site';
	import { fullScreen, wrap } from '$lib/ui';

	/** Entrance animations wait while the intro loader is up (they play as its curtain lifts). */
	const hold = 'loader-on:[animation-play-state:paused] motion-reduce:animate-none';

	let canvas = $state<HTMLCanvasElement>();
	/** The 3D figure's loading state: a skeleton until `ready`; a still dotted orb if `failed`. */
	let scene3d = $state<'loading' | 'ready' | 'failed'>('loading');
	/** The skeleton pulses only with JS running; without JS the still orb is the fallback. */
	let hydrated = $state(false);

	onMount(() => {
		hydrated = true;
		let scene: { dispose(): void } | undefined;
		let cancelled = false;
		let idle = 0;

		const settle = (state: 'ready' | 'failed') => {
			scene3d = state;
			window.dispatchEvent(new Event('hero-ready'));
		};
		const start = () => {
			import('$lib/three/hero-scene')
				.then(({ createHeroScene }) => {
					if (cancelled || !canvas) return;
					try {
						scene = createHeroScene(canvas);
						settle('ready');
					} catch {
						settle('failed'); // No WebGL (old device, disabled GPU)
					}
				})
				.catch(() => {
					if (!cancelled) settle('failed'); // chunk failed to download (offline, flaky network)
				});
		};
		const whenIdle = () => {
			idle =
				'requestIdleCallback' in window
					? window.requestIdleCallback(start, { timeout: 2500 })
					: Number(setTimeout(start, 300));
		};
		// three.js stays out of the critical path. Under the intro loader nothing else is on screen,
		// so start as soon as the fonts are in (not competing with them for bandwidth) and the sphere
		// is usually ready when the curtain lifts. Otherwise: once the page has loaded and is idle.
		if (document.documentElement.dataset.loader === 'on') {
			(document.fonts?.ready ?? Promise.resolve()).then(() => {
				if (!cancelled) start();
			});
		} else if (document.readyState === 'complete') whenIdle();
		else window.addEventListener('load', whenIdle, { once: true });

		return () => {
			cancelled = true;
			window.removeEventListener('load', whenIdle);
			if ('cancelIdleCallback' in window) window.cancelIdleCallback(idle);
			else clearTimeout(idle);
			scene?.dispose();
		};
	});
</script>

<!--
  Mobile-first Tailwind: base classes are the ≤820px layout (canvas on top, single column);
  `desk:` (≥821px, defined in app.css) is the two-column desktop layout.
-->
<section
	id="hero"
	class="relative overflow-hidden border-b border-line-soft {fullScreen}"
	aria-labelledby="hero-name"
	data-draft-group
	data-draft-origin="comet"
	data-draft-autoplay="0.5"
	data-draft-cursors="5"
>
	<div
		class="{wrap} flex flex-col pb-8 desk:flex-row desk:flex-wrap-reverse desk:items-center desk:gap-x-6 desk:gap-y-2 desk:pt-[clamp(20px,3vw,36px)] desk:pb-[clamp(36px,4.5vw,56px)]"
	>
		<div class="flex min-w-0 flex-col gap-5 desk:max-w-190 desk:flex-[1_1_480px] desk:gap-7">
			<p
				class="animate-rise-1 {hold} font-mono text-[13px] tracking-[0.02em] text-accent-700"
				data-draft="Eyebrow"
				data-draft-text
			>
				{hero.eyebrow}
			</p>

			<div class="animate-rise-lcp {hold} flex flex-col gap-1.5 desk:gap-2">
				<!-- The space between the spans keeps the accessible name "Anthony Serojales." -->
				<h1 id="hero-name" class="flex flex-col font-bold text-ink" data-draft="H1" data-draft-text>
					<span
						class="text-[clamp(24px,7vw,34px)] leading-[1.1] font-semibold tracking-[-0.03em] desk:text-[clamp(24px,3.3vw,42px)]"
						>{hero.firstName}</span
					>
					<span
						class="text-[clamp(48px,15vw,72px)] leading-[0.98] tracking-[-0.045em] whitespace-nowrap desk:text-[clamp(52px,7.2vw,72px)] desk:leading-[0.95]"
						>{hero.lastName}<span class="text-accent-600">.</span></span
					>
				</h1>
				<p
					data-draft="Tagline"
					data-draft-text
					class="text-[28px] leading-[1.1] font-semibold tracking-[-0.035em] text-balance text-subtle desk:text-[clamp(24px,4.6vw,38px)] desk:leading-[1.08]"
				>
					{hero.taglineLead} <span class="text-accent-600">{hero.taglineAccent}</span>
				</p>
			</div>

			<!-- ~2 balanced lines from 1280px up (the copy is ~1330px long on one line at 18px). -->
			<p
				data-draft="Intro"
				data-draft-text
				class="hero-intro animate-rise-3 {hold} text-[15px] leading-[1.65] text-pretty desk:max-w-185 desk:text-[18px] desk:leading-[1.7] desk:text-balance"
			>
				{hero.intro}
			</p>

			<div
				class="animate-rise-4 {hold} flex flex-wrap items-center gap-2.5 desk:gap-x-4 desk:gap-y-3.5"
			>
				<a
					href="#contact"
					data-draft="Button"
					class="inline-flex min-h-12.5 flex-1 items-center justify-center gap-2.5 rounded-full bg-inverse px-6.5 text-[15px] font-medium text-on-inverse transition duration-200 hover:-translate-y-px hover:bg-accent hover:text-on-accent desk:min-h-13 desk:flex-none"
				>
					<span>Get in touch</span>
					<span class="hidden desk:inline-flex"
						><Icon name="arrow-right" size={16} strokeWidth={2} /></span
					>
				</a>
				<MaybeLink
					href={site.resume}
					class="inline-flex min-h-12.5 items-center justify-center gap-2 rounded-full border border-line-strong bg-transparent px-5 text-[15px] font-medium text-strong transition-colors not-aria-disabled:hover:border-ink not-aria-disabled:hover:text-accent-700 desk:min-h-13 desk:border-0 desk:px-2"
					external
					comingSoon="Résumé PDF coming soon"
					draft="Link"
				>
					<span>Résumé</span>
					<span class="hidden desk:inline-flex"
						><Icon name="arrow-up-right" size={14} strokeWidth={2} /></span
					>
				</MaybeLink>
				<span class="hidden h-5.5 w-px bg-line desk:block" aria-hidden="true"></span>
				<SocialLinks class="-ml-3 basis-full desk:ml-0 desk:basis-auto" draft="Socials" />
			</div>
		</div>

		<figure
			class="animate-fade-in {hold} relative order-first h-67.5 w-full min-w-0 desk:order-0 desk:ml-auto desk:h-[clamp(260px,34vw,440px)] desk:max-w-115 desk:flex-[0.75_1_340px]"
		>
			<!-- Loading states: a dotted-orb skeleton at the sphere's size sits behind the canvas (so
			     nothing shifts), fades out when the scene is ready, and stays still if WebGL fails. -->
			<span
				class="scene-skel pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-500 ease-[ease] data-[state=ready]:opacity-0"
				data-state={scene3d}
				aria-hidden="true"
				><span
					class={[
						'aspect-square h-[66%] max-w-full rounded-full bg-[radial-gradient(var(--scene-base)_1.2px,transparent_1.6px)] bg-size-[11px_11px] opacity-55 mask-[radial-gradient(circle_closest-side,#000_72%,transparent_100%)]',
						hydrated && scene3d === 'loading' && 'animate-orb-pulse motion-reduce:animate-none'
					]}
				></span></span
			>
			<canvas
				bind:this={canvas}
				data-draft="Canvas"
				class={[
					'relative block size-full transition-opacity duration-600 ease-[ease]',
					scene3d === 'ready' ? 'opacity-100' : 'opacity-0'
				]}
				aria-hidden="true"
			></canvas>
		</figure>
	</div>
</section>
