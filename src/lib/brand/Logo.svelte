<script lang="ts">
	import { LOGO_MARK, LOGO_TILE } from './logo-paths';

	let {
		variant = 'tile',
		size = 32,
		decorative = false,
		label = 'Anthony Serojales'
	}: { variant?: 'tile' | 'mark'; size?: number; decorative?: boolean; label?: string } = $props();

	const g = $derived(variant === 'tile' ? LOGO_TILE : LOGO_MARK);
	const width = $derived(variant === 'tile' ? size : (size * LOGO_MARK.width) / LOGO_MARK.height);
</script>

<svg
	class="block flex-none"
	viewBox={g.viewBox}
	{width}
	height={size}
	role={decorative ? undefined : 'img'}
	aria-label={decorative ? undefined : label}
	aria-hidden={decorative ? 'true' : undefined}
	focusable="false"
>
	{#if variant === 'tile'}
		<rect
			width="64"
			height="64"
			rx={LOGO_TILE.radius}
			style="fill: var(--color-inverse, var(--color-ink))"
		/>
		<path d={g.letters} style="fill: var(--color-on-inverse, var(--color-paper))" />
	{:else}
		<path d={g.letters} fill="currentColor" />
	{/if}
	<circle cx={g.dot.cx} cy={g.dot.cy} r={g.dot.r} style="fill: var(--color-accent)" />
</svg>
