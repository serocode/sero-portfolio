<!-- Section frame: label row + h2 + optional sub, inside the content column. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { reveal } from '$lib/actions/reveal';
	import { fullScreen, revealItem, sectionPad, wrap } from '$lib/ui';
	import SectionLabel from './SectionLabel.svelte';

	let {
		id,
		n,
		label,
		heading,
		sub,
		tone = 'paper',
		subGap = 48,
		children
	}: {
		id: string;
		n: string;
		label: string;
		heading: string;
		sub?: string;
		/** `mist` = full-bleed grey band (Projects). */
		tone?: 'paper' | 'mist';
		/** Space under the sub line, px. */
		subGap?: number;
		children?: Snippet;
	} = $props();
</script>

<section
	{id}
	aria-labelledby="{id}-h"
	class={['group/reveal', fullScreen, tone === 'mist' && 'border-y border-line-soft bg-mist']}
	use:reveal
>
	<!-- On arrival the label, heading, intro and content rise into place, staggered. -->
	<div class="{wrap} {sectionPad}">
		<div class={revealItem} style:--reveal-i={0}>
			<SectionLabel {n} {label} rule={tone === 'mist' ? 'var(--color-line)' : undefined} />
		</div>
		<h2
			id="{id}-h"
			style:--reveal-i={1}
			class={[
				revealItem,
				'max-w-[760px] text-[clamp(30px,4.2vw,48px)] leading-[1.08] font-semibold tracking-[-0.035em] text-balance text-ink',
				sub ? 'mb-3.5' : 'mb-12'
			]}
		>
			{heading}
		</h2>
		{#if sub}
			<p class="max-w-[560px] {revealItem}" style:margin-bottom="{subGap}px" style:--reveal-i={2}>
				{sub}
			</p>
		{/if}
		<div class={revealItem} style:--reveal-i={sub ? 3 : 2}>
			{@render children?.()}
		</div>
	</div>
</section>
