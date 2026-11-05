<script lang="ts">
	let {
		text,
		initials = 'AS',
		size = 96
	}: { text: string; initials?: string; size?: number } = $props();
	const id = `badge-ring-${Math.random().toString(36).slice(2, 8)}`;
</script>

<div
	class="relative grid place-items-center rounded-full bg-surface shadow-[0_10px_30px_-12px_rgb(var(--shadow-rgb)/calc(0.35*var(--shadow-k))),0_0_0_1px_var(--color-line)]"
	style:width="{size}px"
	style:height="{size}px"
>
	<svg
		class="spin absolute inset-0 origin-center animate-badge-spin motion-reduce:animate-none"
		role="img"
		aria-label={text.replace(/ · $/, '')}
		viewBox="0 0 120 120"
		width={size}
		height={size}
	>
		<defs><path {id} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
		<text class="fill-ink font-mono text-[8.4px] tracking-[2.3px]">
			<textPath href="#{id}">{text}</textPath>
		</text>
	</svg>
	<span
		class="grid aspect-square w-[30%] place-items-center rounded-full bg-accent font-mono text-[11px] leading-none font-semibold text-on-accent"
		aria-hidden="true"
		>{initials}</span
	>
</div>
