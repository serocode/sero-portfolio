<script lang="ts">
	import { untrack } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Section from '$lib/components/Section.svelte';
	import { approach, approachIntro } from '$lib/content/approach';
	import { HeightTween, swap } from '$lib/motion';
	import { pad2 } from '$lib/utils/format';

	const total = pad2(approach.length);

	let selected = $state(0);
	/** Hover preview; falls back to the selected item when the pointer leaves the list. */
	let preview = $state<number | null>(null);
	const shown = $derived(preview ?? selected);
	const cur = $derived(approach[shown]);

	// Moving to another topic: the panel's content swaps with a direction-aware slide while its
	// height glides to the new size (see src/lib/motion.ts).
	let stage = $state<HTMLElement>();
	const tween = new HeightTween();
	$effect(() => tween.attach(stage));
	/** +1 = next (content moves left), -1 = previous. */
	let dir = $state<1 | -1>(1);
	let forcedDir: 1 | -1 | null = null;
	let lastShown = 0;
	$effect.pre(() => {
		const s = shown;
		untrack(() => {
			if (s === lastShown) return;
			dir = forcedDir ?? (s > lastShown ? 1 : -1);
			forcedDir = null;
			lastShown = s;
			tween.lock();
		});
	});
	$effect(() => {
		const s = shown;
		untrack(() => tween.to(stage?.querySelector<HTMLElement>(`[data-key="${s}"]`)));
	});

	let tabs: HTMLButtonElement[] = $state([]);

	/** The topic panel (also the WAI-ARIA tabpanel, so it's focusable). */
	const panel =
		'relative flex min-h-[380px] flex-col gap-5 overflow-hidden rounded-3xl bg-mist p-[clamp(28px,4vw,48px)] focus-visible:rounded-3xl focus-visible:outline-offset-4';
	/** Previous / next topic buttons. */
	const navButton =
		'flex size-11 items-center justify-center rounded-full border border-line bg-surface text-strong [transition:background-color_0.15s_ease,border-color_0.15s_ease,color_0.15s_ease] hover:border-inverse hover:bg-inverse hover:text-on-inverse focus-visible:rounded-full';

	/** `step` says which way you moved (the prev/next buttons and arrow keys wrap around, but
	    still read as previous/next). */
	function select(i: number, step?: 1 | -1) {
		forcedDir = step ?? null;
		selected = (i + approach.length) % approach.length;
		preview = null;
	}

	function onKeydown(event: KeyboardEvent) {
		const keys: Record<string, [number, 1 | -1]> = {
			ArrowDown: [selected + 1, 1],
			ArrowRight: [selected + 1, 1],
			ArrowUp: [selected - 1, -1],
			ArrowLeft: [selected - 1, -1],
			Home: [0, -1],
			End: [approach.length - 1, 1]
		};
		if (!(event.key in keys)) return;
		event.preventDefault();
		select(...keys[event.key]);
		tabs[selected]?.focus();
	}
</script>

<Section
	id="approach"
	n="02"
	label="Approach"
	heading={approachIntro.heading}
	sub={approachIntro.sub}
>
	<!-- Desktop: vertical tab list | panel. ≤820px: the tabs wrap into a grid (2 columns on phones,
	     4 on tablets) above the panel, so the whole section sits inside the viewport. -->
	<div
		class="grid grid-cols-[264px_minmax(0,1fr)] items-stretch gap-x-10 gap-y-6 max-desk:grid-cols-[minmax(0,1fr)]"
	>
		<div
			class="flex flex-col gap-1.5 max-desk:grid max-desk:grid-cols-[repeat(auto-fit,minmax(min(100%,148px),1fr))] max-desk:gap-2"
			role="tablist"
			aria-label="Approach topics"
			aria-orientation="vertical"
			tabindex="-1"
			onkeydown={onKeydown}
			onmouseleave={() => (preview = null)}
		>
			{#each approach as item, i (item.n)}
				<button
					bind:this={tabs[i]}
					type="button"
					role="tab"
					id="ap-tab-{i}"
					class={[
						'relative flex min-h-[76px] w-full items-center gap-[18px] rounded-[14px] border-0 py-4 pr-[18px] pl-6 text-left [transition:background-color_0.2s_ease,color_0.2s_ease] max-desk:min-h-13 max-desk:gap-2.5 max-desk:border max-desk:px-3.5 max-desk:py-2.5',
						shown === i
							? 'bg-mist text-ink max-desk:border-ink'
							: 'bg-transparent text-body max-desk:border-line'
					]}
					aria-selected={shown === i}
					aria-controls="ap-panel"
					data-draft="Topic"
					tabindex={selected === i ? 0 : -1}
					onclick={() => select(i)}
					onfocus={() => select(i)}
					onmouseenter={() => (preview = i)}
				>
					<span
						class={[
							'absolute top-[18px] bottom-[18px] left-0 w-[3px] rounded-[3px] bg-accent transition-opacity duration-[250ms] ease-[ease] max-desk:hidden',
							shown === i ? 'opacity-100' : 'opacity-0'
						]}
						aria-hidden="true"
					></span>
					<span class="font-mono text-[12px] text-accent-700">{item.n}</span>
					<span class="flex flex-1 flex-col gap-0.5">
						<span
							class="text-[17px] leading-[1.3] font-semibold tracking-[-0.01em] max-desk:text-[15px] max-desk:leading-[1.25]"
							>{item.label}</span
						>
						<span
							class="font-mono text-[11px] leading-[1.4] tracking-[0.06em] text-muted uppercase max-desk:hidden"
							>{item.from}</span
						>
					</span>
					<span
						class={[
							'flex [transition:opacity_0.25s_ease,transform_0.25s_ease] max-desk:hidden',
							shown === i ? 'transform-none opacity-100' : '[transform:translateX(-6px)] opacity-20'
						]}
						aria-hidden="true"
						><Icon name="arrow-right" size={18} strokeWidth={2} /></span
					>
				</button>
			{/each}
		</div>

		<!-- biome-ignore-start lint/a11y/noNoninteractiveTabindex: WAI-ARIA tabs pattern — the tabpanel is focusable -->
		<div
			id="ap-panel"
			class={panel}
			role="tabpanel"
			aria-labelledby="ap-tab-{shown}"
			tabindex="0"
			data-draft="Panel"
		>
			<!-- biome-ignore-end lint/a11y/noNoninteractiveTabindex: WAI-ARIA tabs pattern -->
			<!-- Decorative numeral drawn from a pseudo-element so it isn't read or contrast-checked as text. -->
			<span
				class="pointer-events-none absolute -right-2 -bottom-[0.26em] text-[clamp(120px,16vw,190px)] leading-none font-extrabold tracking-[-0.06em] text-numeral before:content-[attr(data-n)] max-desk:text-[120px]"
				aria-hidden="true"
				data-n={cur.n}
			></span>
			<div class="relative flex items-center justify-between gap-4">
				<p class="font-mono text-[12px] text-muted">
					<span class="text-accent-700">{cur.n}</span>
					/ {total} · {cur.from}
				</p>
				<div class="flex gap-2">
					<button
						type="button"
						class={navButton}
						aria-label="Previous topic"
						data-draft="Button"
						onclick={() => select(selected - 1, -1)}
					>
						<Icon name="arrow-left" size={16} strokeWidth={2} />
					</button>
					<button
						type="button"
						class={navButton}
						aria-label="Next topic"
						data-draft="Button"
						onclick={() => select(selected + 1, 1)}
					>
						<Icon name="arrow-right" size={16} strokeWidth={2} />
					</button>
				</div>
			</div>
			<!-- One grid cell: the outgoing and incoming topic overlap briefly while swapping. -->
			<div class="relative grid items-start [&>*]:[grid-area:1/1]" bind:this={stage}>
				{#key shown}
					<div
						class="flex flex-col gap-5"
						data-key={shown}
						in:swap={{ dir }}
						out:swap={{ dir, out: true }}
					>
						<h3
							class="mt-2 max-w-[520px] text-[clamp(26px,3vw,34px)] leading-[1.12] font-bold tracking-[-0.03em] text-balance text-ink"
						>
							{cur.title}
						</h3>
						<p class="max-w-[400px] text-[17px] leading-[1.7] text-pretty text-strong">
							{cur.body}
						</p>
						<ul class="flex flex-wrap gap-2 font-mono text-[12px] text-strong" aria-label="Related">
							{#each cur.tags as tag (tag)}
								<li class="rounded-md border border-line bg-surface px-2.5 py-1">{tag}</li>
							{/each}
						</ul>
					</div>
				{/key}
			</div>
			<div class="relative mt-auto flex max-w-[240px] gap-1.5 pt-3" aria-hidden="true">
				{#each approach as item, i (item.n)}
					<span
						class={[
							'h-[3px] flex-1 rounded-[3px] transition-colors duration-[250ms] ease-[ease]',
							i <= shown ? 'bg-accent' : 'bg-line'
						]}
					></span>
				{/each}
			</div>
		</div>
	</div>
</Section>
