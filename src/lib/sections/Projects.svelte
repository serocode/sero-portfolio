<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { deckScroll } from '$lib/actions/deck-scroll';
	import Icon from '$lib/components/Icon.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import Section from '$lib/components/Section.svelte';
	import { projectsSection as copy, projects } from '$lib/content/projects';
	import { HeightTween, swap } from '$lib/motion';
	import type { HelixMotion } from '$lib/motion/helix-motion';
	import type { HelixScene } from '$lib/three/helix-scene';
	import { btnGhostHover, btnPrimaryHover, textLink } from '$lib/ui';
	import { pad2, spellCap } from '$lib/utils/format';

	/*
	 * Two presentations of the same data:
	 * - Helix (html[data-three="on"]: motion allowed, WebGL, capable device): a pinned stage whose
	 *   scroll track turns a 3D helix of project cards; the focused project's details, links and an
	 *   "Explore" dialog (the full ProjectCard) are DOM. Scene: $lib/three/helix-scene; motion:
	 *   $lib/motion/helix-motion.
	 * - Deck (no JS, reduced motion, no WebGL, low-end, or the scene failed): the sticky card deck.
	 */

	const total = projects.length;
	const sub = copy.sub(spellCap(total));

	let focus = $state(0);
	let dir = $state<1 | -1>(1);
	let scene3d = $state<'idle' | 'loading' | 'ready' | 'failed'>('idle');
	let track = $state<HTMLElement>();
	let stage = $state<HTMLElement>();
	let canvas = $state<HTMLCanvasElement>();
	let panel = $state<HTMLElement>();
	let ticks = $state<HTMLElement>();
	let detail = $state<HTMLElement>();
	let dialog = $state<HTMLDialogElement>();
	let openIdx = $state<number | null>(null);
	let motion: HelixMotion | undefined;

	const project = $derived(projects[focus]);
	const isGithub = (href: string) => /^https?:\/\/(www\.)?github\.com\//.test(href);

	// Details swap: direction-aware slide + smooth height, like the other swapping panels.
	// The panel sits inside the pinned stage, so its height never moves the page: don't announce.
	const tween = new HeightTween({ announce: false });
	$effect(() => tween.attach(detail));
	let lastFocus = 0;
	$effect.pre(() => {
		const f = focus;
		untrack(() => {
			if (f === lastFocus) return;
			dir = f > lastFocus ? 1 : -1;
			lastFocus = f;
			tween.lock();
		});
	});
	$effect(() => {
		const f = focus;
		untrack(() => tween.to(detail?.querySelector<HTMLElement>(`[data-key="${f}"]`)));
	});

	function openDetail(i: number) {
		openIdx = i;
		document.documentElement.style.overflow = 'hidden';
		queueMicrotask(() => dialog?.showModal());
	}
	// A click on the backdrop (the dialog box itself, outside the card) closes it; Escape is native.
	$effect(() => {
		const d = dialog;
		if (!d) return;
		const onClick = (e: MouseEvent) => {
			if (e.target === d) d.close();
		};
		d.addEventListener('click', onClick);
		return () => d.removeEventListener('click', onClick);
	});

	function onDialogClose() {
		document.documentElement.style.overflow = '';
		openIdx = null;
	}

	onMount(() => {
		if (document.documentElement.dataset.three !== 'on' || !track) return;
		let cancelled = false;
		let scene: HelixScene | undefined;
		let ro: ResizeObserver | undefined;

		const layout = () => {
			if (!scene || !stage || !panel) return;
			const s = stage.getBoundingClientRect();
			const free = Math.max(160, panel.getBoundingClientRect().top - s.top);
			const desk = s.width > 820;
			scene.setLayout({
				focusY: free / 2 + 4,
				boxH: free * (desk ? 0.74 : 0.8),
				boxW: desk ? Math.min(s.width * 0.44, 620) : s.width * 0.8
			});
		};

		const start = () => {
			scene3d = 'loading';
			Promise.all([
				import('$lib/three/helix-scene'),
				import('$lib/motion/helix-motion'),
				import('gsap'),
				import('gsap/ScrollTrigger'),
				import('gsap/Observer')
			])
				.then(
					([
						{ createHelixScene },
						{ createHelixMotion },
						{ gsap },
						{ ScrollTrigger },
						{ Observer }
					]) => {
						if (cancelled || !canvas || !track || !stage) return;
						try {
							scene = createHelixScene(canvas, projects);
							layout();
							ro = new ResizeObserver(layout);
							if (panel) ro.observe(panel);
							ro.observe(stage);
							motion = createHelixMotion({
								gsap,
								ScrollTrigger,
								Observer,
								scene,
								track,
								stage,
								canvas,
								count: total,
								onFocus: (i) => (focus = i),
								onOpen: openDetail,
								onPosition: (p) => ticks?.style.setProperty('--hx-pos', p.toFixed(4))
							});
							scene3d = 'ready';
						} catch {
							scene3d = 'failed';
						}
					}
				)
				.catch(() => {
					if (!cancelled) scene3d = 'failed';
				});
		};

		// Load three.js only as the section approaches.
		const near = new IntersectionObserver(
			([e]) => {
				if (!e?.isIntersecting) return;
				near.disconnect();
				start();
			},
			{ rootMargin: '120% 0px' }
		);
		near.observe(track);

		return () => {
			cancelled = true;
			near.disconnect();
			ro?.disconnect();
			motion?.kill();
			motion = undefined;
			scene?.dispose();
			if (openIdx !== null) document.documentElement.style.overflow = '';
		};
	});

	const roundBtn =
		'grid size-11 flex-none place-items-center rounded-full border border-line-strong bg-surface text-strong transition-[border-color,color,opacity] duration-[180ms] ease-[ease] not-disabled:hover:border-ink not-disabled:hover:text-ink disabled:opacity-40';
</script>

<Section
	id="projects"
	n="03"
	label="Projects"
	heading={copy.heading}
	{sub}
	tone="mist"
	draftCursors={3}
>
	{#if scene3d !== 'failed'}
		<!-- The track is the scroll length; the stage pins under the header while it passes. -->
		<div
			class="hidden h-[calc(100svh_-_var(--header-h)_+_var(--steps)_*_62svh)] three-on:block"
			style:--steps={total - 1}
			bind:this={track}
		>
			<div class="sticky top-(--header-h) h-[calc(100svh_-_var(--header-h))]" bind:this={stage}>
				<span
					class="pointer-events-none absolute inset-x-0 top-0 bottom-[40%] grid place-items-center transition-opacity duration-500 ease-[ease] data-[state=ready]:opacity-0"
					data-state={scene3d}
					data-draft="Helix"
					aria-hidden="true"
					><span
						class={[
							'aspect-[16/11] h-[62%] max-w-full rounded-[22px] bg-[radial-gradient(var(--scene-base)_1.2px,transparent_1.6px)] bg-size-[11px_11px] opacity-50 mask-[radial-gradient(closest-side,#000_70%,transparent_100%)]',
							scene3d === 'loading' && 'animate-orb-pulse motion-reduce:animate-none'
						]}
					></span></span
				>
				<!-- Full-bleed canvas; #top clips the overflow. -->
				<canvas
					bind:this={canvas}
					class={[
						'absolute inset-y-0 left-1/2 block h-full w-screen -translate-x-1/2 touch-pan-y transition-opacity duration-700 ease-[ease] data-dragging:cursor-grabbing data-[hover=go]:cursor-pointer data-[hover=open]:cursor-zoom-in',
						scene3d === 'ready' ? 'opacity-100' : 'opacity-0'
					]}
					aria-hidden="true"
				></canvas>

				<div
					class="absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-mist from-65% to-transparent pt-14 pb-[clamp(14px,3.2svh,40px)]"
					bind:this={panel}
					data-draft="Details"
				>
					<div class="mb-3 flex items-center gap-3 desk:mb-5 desk:gap-5" data-draft="Nav">
						<p class="flex-none font-mono text-[12px] tracking-[0.06em] text-muted">
							<span class="text-[15px] font-medium text-accent-700">{pad2(focus + 1)}</span>
							/ {pad2(total)}
						</p>
						<ol
							class="flex min-w-0 flex-1 items-center"
							aria-label={copy.listLabel}
							bind:this={ticks}
							style="--hx-pos: 0"
						>
							{#each projects as p, i (p.id)}
								<li class="min-w-0 flex-1">
									<button
										type="button"
										class="group flex h-11 w-full items-center px-0.5"
										aria-label={copy.goTo(p.title)}
										aria-current={i === focus ? 'true' : undefined}
										onclick={() => motion?.go(i)}
									>
										<!-- Fills with the position, so the strip shows progress between projects too. -->
										<span
											class="relative h-0.5 w-full overflow-hidden rounded-full bg-line-strong transition-[background-color,height] duration-300 ease-smooth group-hover:bg-faint group-aria-[current=true]:h-1"
										>
											<span
												class="absolute inset-0 origin-left rounded-full bg-accent/45 transition-colors duration-300 group-aria-[current=true]:bg-accent"
												style:scale="clamp(0, calc(var(--hx-pos) - {i} + 1), 1) 1"
											></span>
										</span>
									</button>
								</li>
							{/each}
						</ol>
						<p
							class="hidden flex-none font-mono text-[11px] tracking-[0.08em] text-muted uppercase [@media(pointer:fine)]:desk:block"
						>
							{copy.hint}
						</p>
						<div class="flex flex-none gap-2">
							<button
								type="button"
								class={roundBtn}
								aria-label={copy.prev}
								disabled={focus === 0}
								onclick={() => motion?.go(focus - 1)}
							>
								<Icon name="arrow-left" size={16} strokeWidth={2} />
							</button>
							<button
								type="button"
								class={roundBtn}
								aria-label={copy.next}
								disabled={focus === total - 1}
								onclick={() => motion?.go(focus + 1)}
							>
								<Icon name="arrow-right" size={16} strokeWidth={2} />
							</button>
						</div>
					</div>

					<div class="grid items-start [&>*]:[grid-area:1/1]" bind:this={detail}>
						{#key focus}
							<div
								class="grid min-w-0 items-start gap-x-12 gap-y-3 desk:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
								data-key={focus}
								in:swap={{ dir }}
								out:swap={{ dir, out: true }}
							>
								<div class="flex min-w-0 flex-col gap-1.5 desk:gap-3">
									<p
										class="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] tracking-[0.06em] text-accent-700"
									>
										<span>{project.kind}</span>
										{#each project.badges as b (b.label)}
											<span class="inline-flex items-center gap-1.5 text-muted">
												{#if b.tone === 'private'}
													<Icon name="lock" size={11} strokeWidth={2} />
												{:else}
													<span
														class={[
															'size-1.5 rounded-full',
															b.tone === 'live' ? 'bg-accent' : 'bg-faint'
														]}
														aria-hidden="true"
													></span>
												{/if}
												{b.label}
											</span>
										{/each}
									</p>
									<h3
										class="text-[clamp(28px,3.6vw,46px)] leading-[1.04] font-bold tracking-[-0.035em] text-balance text-ink"
									>
										{project.title}
									</h3>
								</div>
								<div class="flex min-w-0 flex-col gap-3 desk:gap-4">
									<p
										class="max-w-[62ch] text-[15px] leading-[1.6] text-pretty text-strong max-desk:line-clamp-3 desk:text-[16px] desk:leading-[1.65]"
									>
										{project.description}
									</p>
									<ul
										class="flex flex-wrap gap-1.5 font-mono text-[11px] text-strong max-desk:max-h-[52px] max-desk:overflow-hidden desk:gap-2 desk:text-[12px]"
										aria-label="Tech stack"
									>
										{#each project.stack as t (t)}
											<li class="rounded-md bg-chip px-2 py-0.5 desk:px-2.5 desk:py-1">{t}</li>
										{/each}
									</ul>
									<div class="flex flex-wrap items-center gap-2 desk:gap-2.5">
										{#each project.links as l (l.href)}
											<a
												href={l.href}
												target="_blank"
												rel="noopener noreferrer"
												class={[
													'inline-flex min-h-11 items-center gap-2 rounded-full px-[18px] text-[14px] font-medium',
													l.variant === 'primary'
														? ['bg-inverse text-on-inverse', btnPrimaryHover]
														: ['border border-line-strong bg-surface text-strong', btnGhostHover]
												]}
											>
												{#if l.variant === 'ghost' && isGithub(l.href)}
													<Icon name="github" size={16} />
												{/if}
												<span>{l.label}</span>
												{#if l.variant === 'primary'}
													<Icon name="arrow-up-right" size={14} strokeWidth={2} />
												{/if}
												<span class="sr-only"> — {project.title} (opens in a new tab)</span>
											</a>
										{/each}
										<button
											type="button"
											class="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[14px] font-medium text-ink {textLink}"
											aria-label={copy.exploreFor(project.title)}
											aria-haspopup="dialog"
											onclick={() => openDetail(focus)}
										>
											<span>{copy.explore}</span>
											<Icon name="arrow-right" size={14} strokeWidth={2} />
										</button>
									</div>
								</div>
							</div>
						{/key}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<div
		class={['flex flex-col gap-[72px] max-desk:gap-6', scene3d !== 'failed' && 'three-on:hidden']}
		use:deckScroll
	>
		{#each projects as p, i (p.id)}
			<ProjectCard project={p} index={i} {total} />
		{/each}
	</div>

	<div class="mt-10">
		<a
			class="inline-flex min-h-11 items-center gap-2 text-[14px] font-medium text-ink {textLink}"
			href={copy.github.href}
			target="_blank"
			rel="noopener noreferrer"
		>
			<span>{copy.github.label}</span>
			<Icon name="arrow-up-right" size={14} strokeWidth={2} />
			<span class="sr-only"> (opens in a new tab)</span>
		</a>
	</div>
</Section>

<!-- Full project (views, screenshots, highlights) — opened from the helix. -->
<dialog
	bind:this={dialog}
	class="m-auto max-h-[calc(100svh_-_24px)] w-[min(1180px,calc(100vw_-_24px))] translate-y-3 overflow-y-auto overscroll-contain bg-transparent p-0 opacity-0 transition-[opacity,translate,display,overlay] transition-discrete duration-300 ease-smooth backdrop:bg-transparent backdrop:transition-[background-color,display,overlay] backdrop:transition-discrete backdrop:duration-300 open:translate-y-0 open:opacity-100 open:backdrop:bg-[rgb(var(--shadow-rgb)/0.55)] starting:open:translate-y-3 starting:open:opacity-0 starting:open:backdrop:bg-transparent"
	aria-labelledby={openIdx !== null ? `dlg-${projects[openIdx].id}-title` : undefined}
	onclose={onDialogClose}
>
	{#if openIdx !== null}
		<div class="sticky top-0 z-10 flex justify-end pb-2">
			<button
				type="button"
				class="grid size-11 place-items-center rounded-full border border-line-strong bg-surface text-strong shadow-[0_8px_24px_-12px_rgb(var(--shadow-rgb)/calc(0.4*var(--shadow-k)))] transition-[border-color,color] duration-[180ms] hover:border-ink hover:text-ink"
				aria-label={copy.close}
				onclick={() => dialog?.close()}
			>
				<Icon name="close" size={18} strokeWidth={2} />
			</button>
		</div>
		<ProjectCard
			project={projects[openIdx]}
			index={openIdx}
			{total}
			variant="plain"
			idPrefix="dlg-"
		/>
	{/if}
</dialog>
