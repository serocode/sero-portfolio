<!-- Section frame: label row + h2 + optional sub, inside the content column. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
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

<section {id} aria-labelledby="{id}-h" class:mist={tone === 'mist'}>
	<div class="wrap section-pad">
		<SectionLabel {n} {label} rule={tone === 'mist' ? 'var(--color-line)' : undefined} />
		<h2 id="{id}-h" class:has-sub={!!sub}>{heading}</h2>
		{#if sub}
			<p class="sub" style:margin-bottom="{subGap}px">{sub}</p>
		{/if}
		{@render children?.()}
	</div>
</section>

<style>
	.mist {
		background: var(--color-mist);
		border-block: 1px solid var(--color-line-soft);
	}
	h2 {
		margin: 0 0 48px;
		max-width: 760px;
		font-size: clamp(30px, 4.2vw, 48px);
		font-weight: 600;
		line-height: 1.08;
		letter-spacing: -0.035em;
		color: var(--color-ink);
		text-wrap: balance;
	}
	h2.has-sub {
		margin-bottom: 14px;
	}
	.sub {
		margin-top: 0;
		max-width: 560px;
	}
</style>
