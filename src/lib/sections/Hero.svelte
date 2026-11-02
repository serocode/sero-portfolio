<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import MaybeLink from '$lib/components/MaybeLink.svelte';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
	import { hero, site } from '$lib/content/site';

	let canvas = $state<HTMLCanvasElement>();

	onMount(() => {
		let scene: { dispose(): void } | undefined;
		let cancelled = false;
		let idle = 0;

		// three.js stays out of the critical path: fetch + build the scene once the page has
		// loaded and the main thread is idle, so text paints (and becomes interactive) first.
		const start = () => {
			import('$lib/three/hero-scene')
				.then(({ createHeroScene }) => {
					if (cancelled || !canvas) return;
					try {
						scene = createHeroScene(canvas);
					} catch {
						// No WebGL (old device, disabled GPU): leave the figure empty.
					}
				})
				.catch(() => {});
		};
		const whenIdle = () => {
			idle =
				'requestIdleCallback' in window
					? window.requestIdleCallback(start, { timeout: 2500 })
					: Number(setTimeout(start, 300));
		};
		if (document.readyState === 'complete') whenIdle();
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
<section class="relative overflow-hidden border-b border-line-soft" aria-labelledby="hero-name">
	<div
		class="wrap flex flex-col pb-8 desk:flex-row desk:flex-wrap-reverse desk:items-center desk:gap-x-6 desk:gap-y-2 desk:pt-[clamp(20px,3vw,36px)] desk:pb-[clamp(36px,4.5vw,56px)]"
	>
		<div class="flex min-w-0 flex-col gap-5 desk:max-w-[760px] desk:flex-[1_1_480px] desk:gap-7">
			<p class="rise d1 font-mono text-[13px] tracking-[0.02em] text-accent-700">{hero.eyebrow}</p>

			<div class="rise-lcp d2 flex flex-col gap-1.5 desk:gap-2">
				<!-- The space between the spans keeps the accessible name "Anthony Serojales." -->
				<h1 id="hero-name" class="flex flex-col font-bold text-ink">
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
					class="text-[28px] leading-[1.1] font-semibold tracking-[-0.035em] text-balance text-subtle desk:text-[clamp(24px,4.6vw,38px)] desk:leading-[1.08]"
				>
					{hero.taglineLead} <span class="text-accent-600">{hero.taglineAccent}</span>
				</p>
			</div>

			<!-- ~2 balanced lines from 1280px up (the copy is ~1330px long on one line at 18px). -->
			<p
				class="rise d3 text-[15px] leading-[1.65] text-pretty desk:max-w-[740px] desk:text-[18px] desk:leading-[1.7] desk:text-balance"
			>
				{hero.intro}
			</p>

			<div class="rise d4 flex flex-wrap items-center gap-2.5 desk:gap-x-4 desk:gap-y-3.5">
				<a
					href="#contact"
					class="inline-flex min-h-[50px] flex-1 items-center justify-center gap-2.5 rounded-full bg-inverse px-[26px] text-[15px] font-medium text-on-inverse transition duration-200 hover:-translate-y-px hover:bg-accent hover:text-on-accent desk:min-h-[52px] desk:flex-none"
				>
					<span>Get in touch</span>
					<span class="hidden desk:inline-flex"
						><Icon name="arrow-right" size={16} strokeWidth={2} /></span
					>
				</a>
				<MaybeLink
					href={site.resume}
					class="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full border border-line-strong bg-transparent px-5 text-[15px] font-medium text-strong transition-colors not-aria-disabled:hover:border-ink not-aria-disabled:hover:text-accent-700 desk:min-h-[52px] desk:border-0 desk:px-2"
					external
					comingSoon="Résumé PDF coming soon"
				>
					<span>Résumé</span>
					<span class="hidden desk:inline-flex"
						><Icon name="arrow-up-right" size={14} strokeWidth={2} /></span
					>
				</MaybeLink>
				<span class="hidden h-[22px] w-px bg-line desk:block" aria-hidden="true"></span>
				<SocialLinks class="-ml-3 basis-full desk:ml-0 desk:basis-auto" />
			</div>
		</div>

		<figure
			class="fade relative order-first h-[270px] w-full min-w-0 desk:order-0 desk:ml-auto desk:h-[clamp(260px,34vw,440px)] desk:max-w-[460px] desk:flex-[0.75_1_340px]"
		>
			<canvas bind:this={canvas} class="block size-full" aria-hidden="true"></canvas>
		</figure>
	</div>
</section>
