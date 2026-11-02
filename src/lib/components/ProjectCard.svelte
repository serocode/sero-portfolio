<script lang="ts">
	import { untrack } from 'svelte';
	import { fitSticky } from '$lib/actions/fit-sticky';
	import { imageState } from '$lib/actions/image-state';
	import { swipe } from '$lib/actions/swipe';
	import type { DiagramBox, Project } from '$lib/content/types';
	import { HeightTween, swap } from '$lib/motion';
	import { btnGhostHover, btnPrimaryHover, imgFade, imgFrame } from '$lib/ui';
	import { pad2 } from '$lib/utils/format';
	import Icon from './Icon.svelte';

	let { project, index, total }: { project: Project; index: number; total: number } = $props();

	// Each card switches its views and shots independently.
	let viewIdx = $state(0);

	// Switching views: direction-aware slide + a smooth height change (see src/lib/motion.ts).
	let stage = $state<HTMLElement>();
	const tween = new HeightTween();
	$effect(() => tween.attach(stage));
	let viewDir = $state<1 | -1>(1);
	let lastView = 0;
	$effect.pre(() => {
		const v = viewIdx;
		untrack(() => {
			if (v === lastView) return;
			viewDir = v > lastView ? 1 : -1;
			lastView = v;
			tween.lock();
		});
	});
	$effect(() => {
		const v = viewIdx;
		untrack(() => tween.to(stage?.querySelector<HTMLElement>(`[data-key="${v}"]`)));
	});
	let shotIdx = $state<Record<number, number>>({});

	const view = $derived(project.views[viewIdx]);
	const shots = $derived(view.type === 'diagram' ? [] : view.shots);
	const shotI = $derived(shotIdx[viewIdx] ?? 0);
	const shot = $derived(shots[shotI]);

	function pickShot(i: number) {
		shotIdx[viewIdx] = (i + shots.length) % shots.length;
	}

	/** ←/→ on a focused thumbnail (or phone) moves to the previous/next shot and keeps focus with it. */
	function onShotKeys(event: KeyboardEvent) {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		const list = (event.currentTarget as HTMLElement).closest('ul');
		event.preventDefault();
		pickShot(shotI + (event.key === 'ArrowRight' ? 1 : -1));
		list?.querySelectorAll<HTMLButtonElement>('button')[shotI]?.focus();
	}

	/** Touch swipe on the screenshot (browser or phones) steps through the shots. */
	const swipeShots = $derived({
		onSwipe: (dir: 1 | -1) => pickShot(shotI + dir),
		enabled: shots.length > 1
	});

	const caption = 'flex justify-between gap-3 font-mono text-[12px] leading-[1.5] text-muted';
	/** Architecture diagram boxes: the highlighted layer, optional parts, and the data store. */
	const boxKind: Record<DiagramBox['kind'], string> = {
		plain: 'border border-line bg-surface',
		key: 'border-[1.5px] border-accent bg-surface font-semibold text-ink',
		soft: 'border border-dashed border-line-strong bg-surface',
		data: 'border border-inverse bg-inverse font-medium text-on-inverse'
	};

	const alt = (caption: string) => `${project.title} — ${caption}`;
	const isGithub = (href: string) => /^https?:\/\/(www\.)?github\.com\//.test(href);
</script>

<!--
  Sticky deck card. Offset: a stair-step under the header (--deck-top: 88px + i×16px; ≤820px a
  tighter 76px + i×10px), or — for a card taller than the viewport — bottom edge 24px above the fold
  (--card-h from fit-sticky.ts). svh = small viewport, so the offset holds still while mobile
  toolbars collapse. Reduced motion: a normal stack.
-->
<article
	class="deck-card sticky top-[min(var(--deck-top),calc(100svh_-_var(--card-h,0px)_-_24px_-_env(safe-area-inset-bottom,0px)))] flex origin-top flex-col gap-[22px] rounded-[28px] border border-line bg-surface p-[clamp(20px,2.6vw,32px)] shadow-[0_1px_2px_rgb(var(--shadow-rgb)/calc(0.04*var(--shadow-k))),0_-18px_48px_-32px_rgb(var(--shadow-rgb)/calc(0.28*var(--shadow-k))),0_30px_60px_-40px_rgb(var(--shadow-rgb)/calc(0.35*var(--shadow-k)))] will-change-transform [--deck-top:calc(88px_+_var(--i,0)_*_16px)] max-desk:rounded-[22px] max-desk:[--deck-top:calc(76px_+_var(--i,0)_*_10px)] motion-reduce:relative! motion-reduce:top-auto!"
	aria-labelledby="{project.id}-title"
	style:--i={index}
	use:fitSticky
>
	<div class="flex flex-wrap items-center justify-between gap-x-5 gap-y-2.5">
		<p
			class="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5 font-mono text-[12px] tracking-[0.06em] text-muted"
		>
			<span
				><span class="text-[15px] font-medium text-accent-700">{pad2(index + 1)}</span>
				/ {pad2(total)}</span
			>
			<span class="text-accent-700">{project.kind}</span>
		</p>
		<ul class="flex flex-wrap gap-2" aria-label="Status">
			{#each project.badges as b (b.label)}
				<li
					class={[
						'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] font-mono text-[11px] leading-[1.5]',
						b.tone === 'live'
							? 'border-[rgba(249,115,22,0.25)] bg-[rgba(249,115,22,0.12)] text-accent-800'
							: 'border-line bg-surface text-body'
					]}
				>
					{#if b.tone === 'private'}
						<Icon name="lock" size={11} strokeWidth={2} />
					{:else}
						<span
							class={['size-1.5 rounded-full', b.tone === 'live' ? 'bg-accent' : 'bg-faint']}
							aria-hidden="true"
						></span>
					{/if}
					{b.label}
				</li>
			{/each}
		</ul>
	</div>

	<!-- Media ~55% + text; stacked at ≤820px. -->
	<div class="flex flex-wrap items-start gap-x-12 gap-y-7">
		<figure class="flex min-w-0 flex-[1.35_1_440px] flex-col gap-3 max-desk:basis-full">
			{#if project.views.length > 1}
				<div
					class="flex gap-1.5 self-start rounded-full bg-chip p-1"
					role="group"
					aria-label="{project.title} views"
				>
					{#each project.views as v, i (v.label)}
						<button
							type="button"
							class="min-h-9 rounded-full border-0 bg-transparent px-4 text-[13px] font-medium text-body [transition:background-color_0.2s_ease,box-shadow_0.2s_ease,color_0.2s_ease] aria-pressed:bg-surface aria-pressed:text-ink aria-pressed:shadow-[0_1px_2px_rgb(var(--shadow-rgb)/calc(0.08*var(--shadow-k))),0_2px_8px_-4px_rgb(var(--shadow-rgb)/calc(0.15*var(--shadow-k)))]"
							aria-pressed={viewIdx === i}
							onclick={() => (viewIdx = i)}
						>
							{v.label}
						</button>
					{/each}
				</div>
			{/if}

			<!-- One grid cell: switching views cross-slides the media while the card glides to its new
			     height (and, through fit-sticky, its new sticky position). -->
			<div class="grid items-start [&>*]:[grid-area:1/1]" bind:this={stage}>
				{#key viewIdx}
					<div
						class="flex min-w-0 flex-col gap-3"
						data-key={viewIdx}
						in:swap={{ dir: viewDir }}
						out:swap={{ dir: viewDir, out: true }}
					>
						{#if view.type === 'browser'}
							{@const first = view.shots[0]}
							<div class="relative" use:swipe={swipeShots}>
								<div
									class="flex flex-col overflow-hidden rounded-2xl border border-line shadow-[0_24px_48px_-30px_rgb(var(--shadow-rgb)/calc(0.3*var(--shadow-k)))]"
									style:aspect-ratio="{first.width} / {first.height + 36}"
									style:background={view.background}
								>
									<div
										class="flex h-9 flex-none items-center gap-1.5 border-b border-line-soft bg-surface px-3.5"
										aria-hidden="true"
									>
										<span class="size-[9px] flex-none rounded-full bg-line"></span
										><span class="size-[9px] flex-none rounded-full bg-line"></span
										><span class="size-[9px] flex-none rounded-full bg-line"></span>
										<!-- mist, not chip: muted 10px text on chip would be 4.44:1 (under 4.5). -->
										<span
											class="ml-3 flex h-[22px] max-w-[300px] min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-md bg-mist px-2.5 font-mono text-[10px] whitespace-nowrap text-muted"
											><span class="size-1.5 flex-none rounded-full bg-accent"></span>
											{view.addressBar}
											· {shot.label}</span
										>
									</div>
									<div
										class="screen relative min-h-0 flex-1 {imgFrame}"
										data-fallback="Screenshot unavailable"
									>
										<img
											use:imageState
											class="absolute inset-0 size-full object-cover object-top {imgFade}"
											src={shot.src}
											alt={alt(shot.caption)}
											width={shot.width}
											height={shot.height}
											loading="lazy"
											decoding="async"
										>
									</div>
								</div>
								{#if view.phoneOverlay}
									<span
										class="absolute right-3.5 bottom-3 aspect-[780/1688] w-[22%] rounded-[20px] bg-inverse p-1 shadow-[0_18px_32px_-14px_rgb(var(--shadow-rgb)/calc(0.5*var(--shadow-k)))] [--skel-inset:4px] [--skel-radius:16px] max-desk:rounded-[14px] max-desk:p-[3px] max-desk:[--skel-inset:3px] max-desk:[--skel-radius:11px] {imgFrame}"
										data-fallback=""
									>
										<img
											use:imageState
											class="block size-full rounded-2xl object-cover object-top max-desk:rounded-[11px] {imgFade}"
											src={view.phoneOverlay.src}
											alt={view.phoneOverlay.alt}
											width={view.phoneOverlay.width}
											height={view.phoneOverlay.height}
											loading="lazy"
											decoding="async"
										>
									</span>
								{/if}
							</div>
							<p class={caption}>
								<span>{shot.caption}</span
								><span class="flex-none">{pad2(shotI + 1)} / {pad2(shots.length)}</span>
							</p>
							{#if shots.length > 1}
								<ul
									class="grid grid-cols-[repeat(var(--cols),minmax(0,1fr))] gap-2 max-desk:grid-cols-4"
									style:--cols={Math.max(3, shots.length)}
									aria-label="{project.title} screenshots"
								>
									{#each shots as s, i (s.src)}
										<li>
											<button
												type="button"
												class={[
													'relative block aspect-[16/10] w-full overflow-hidden rounded-lg border-2 p-0 [transition:opacity_0.2s_ease,border-color_0.2s_ease] hover:opacity-100',
													imgFrame,
													shotI === i
														? 'border-accent opacity-100'
														: 'border-transparent opacity-60'
												]}
												data-fallback=""
												aria-pressed={shotI === i}
												aria-label="Show the {s.label} screenshot"
												style:background={view.background}
												onclick={() => pickShot(i)}
												onkeydown={onShotKeys}
											>
												<img
													use:imageState
													class="absolute inset-0 size-full object-cover object-top {imgFade}"
													src={s.src}
													alt=""
													width={s.width}
													height={s.height}
													loading="lazy"
													decoding="async"
												>
											</button>
										</li>
									{/each}
								</ul>
							{/if}
						{:else if view.type === 'phones'}
							<ul
								class="flex aspect-[16/11] items-center justify-center gap-[4%] overflow-hidden rounded-2xl border border-line bg-surface bg-[radial-gradient(var(--color-line)_1px,transparent_1.3px)] [background-size:18px_18px] px-4 py-7 max-desk:px-2.5 max-desk:py-5"
								aria-label="{project.title} screens"
								use:swipe={swipeShots}
							>
								{#each shots as s, i (s.src)}
									<li class="w-1/4 flex-none">
										<button
											type="button"
											class={[
												'relative block aspect-[9/19] w-full rounded-[22px] border-0 bg-inverse p-[5px] [--skel-inset:5px] [--skel-radius:17px] [transition:transform_0.45s_cubic-bezier(0.2,0.7,0.2,1),opacity_0.3s_ease,box-shadow_0.3s_ease] hover:opacity-100 focus-visible:rounded-[22px] max-desk:rounded-2xl max-desk:p-[3px] max-desk:[--skel-inset:3px] max-desk:[--skel-radius:13px]',
												imgFrame,
												shotI === i
													? 'opacity-100 shadow-[0_26px_40px_-18px_rgb(var(--shadow-rgb)/calc(0.45*var(--shadow-k)))] [transform:translateY(-6px)_scale(1.06)]'
													: 'opacity-70 shadow-[0_10px_20px_-14px_rgb(var(--shadow-rgb)/calc(0.3*var(--shadow-k)))] [transform:scale(0.94)]'
											]}
											data-fallback="Screen unavailable"
											aria-pressed={shotI === i}
											aria-label="Show the {s.label} screen"
											onclick={() => pickShot(i)}
											onkeydown={onShotKeys}
										>
											<img
												use:imageState
												class="block size-full rounded-[17px] object-cover object-top max-desk:rounded-[13px] {imgFade}"
												src={s.src}
												alt={alt(s.caption)}
												width={s.width}
												height={s.height}
												loading="lazy"
												decoding="async"
											>
										</button>
									</li>
								{/each}
							</ul>
							<p class={caption}>
								<span>{shot.caption}</span
								><span class="flex-none">{pad2(shotI + 1)} / {pad2(shots.length)}</span>
							</p>
						{:else}
							<div
								class="flex min-h-[300px] flex-col justify-center rounded-2xl bg-mist bg-[radial-gradient(var(--color-line)_1px,transparent_1.3px)] [background-size:18px_18px] p-[clamp(20px,3vw,36px)] font-mono text-[13px] text-strong"
								role="img"
								aria-label={view.ariaLabel}
							>
								{#each view.rows as row, r (r)}
									{#if r > 0}
										<span
											class="mx-auto block h-[18px] w-px bg-line-strong"
											aria-hidden="true"
										></span>
									{/if}
									<div
										class="grid grid-cols-[repeat(var(--cols),minmax(0,1fr))] gap-2.5 max-desk:gap-1.5"
										style:--cols={row.length}
									>
										{#each row as box (box.label)}
											<span
												class={[
													'flex min-h-11 items-center justify-center rounded-[10px] px-2.5 py-1.5 text-center leading-[1.35] max-desk:p-1.5 max-desk:text-[11px]',
													boxKind[box.kind]
												]}
												>{box.label}</span
											>
										{/each}
									</div>
								{/each}
							</div>
							<p class={caption}><span>{view.caption}</span></p>
						{/if}
					</div>
				{/key}
			</div>
		</figure>

		<div class="flex min-w-0 flex-[1_1_340px] flex-col gap-4 max-desk:basis-full">
			<h3
				id="{project.id}-title"
				class="text-[clamp(28px,3vw,36px)] leading-[1.1] font-bold tracking-[-0.03em] text-ink"
			>
				{project.title}
			</h3>
			<p class="text-[16px] leading-[1.65] text-pretty text-strong">{project.description}</p>
			<ul class="flex flex-col gap-2 text-[15px] leading-[1.55]">
				{#each project.highlights as h (h)}
					<li class="flex gap-3">
						<span class="text-accent-700" aria-hidden="true">–</span><span>{h}</span>
					</li>
				{/each}
			</ul>
			<ul class="flex flex-wrap gap-2 font-mono text-[12px] text-strong" aria-label="Tech stack">
				{#each project.stack as t (t)}
					<li class="rounded-md bg-chip px-2.5 py-1">{t}</li>
				{/each}
			</ul>
			{#if project.links.length}
				<div class="mt-1 flex flex-wrap items-center gap-2.5">
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
				</div>
			{/if}
		</div>
	</div>
</article>
