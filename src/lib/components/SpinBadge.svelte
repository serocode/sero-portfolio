<!-- The rotating "HR BY ROLE · DEVELOPER BY PRACTICE" seal that sits on the About card's corner. -->
<script lang="ts">
	let {
		text,
		initials = 'AS',
		size = 96
	}: { text: string; initials?: string; size?: number } = $props();
	const id = `badge-ring-${Math.random().toString(36).slice(2, 8)}`;
</script>

<div class="badge" style:width="{size}px" style:height="{size}px">
	<svg
		class="spin"
		role="img"
		aria-label={text.replace(/ · $/, '')}
		viewBox="0 0 120 120"
		width={size}
		height={size}
	>
		<defs><path {id} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
		<text><textPath href="#{id}">{text}</textPath></text>
	</svg>
	<span class="core" aria-hidden="true">{initials}</span>
</div>

<style>
	.badge {
		position: relative;
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: var(--color-surface);
		box-shadow:
			0 10px 30px -12px rgb(var(--shadow-rgb) / calc(0.35 * var(--shadow-k))),
			0 0 0 1px var(--color-line);
	}
	svg {
		position: absolute;
		inset: 0;
	}
	text {
		font-family: var(--font-mono);
		font-size: 8.4px;
		letter-spacing: 2.3px;
		fill: var(--color-ink);
	}
	.core {
		width: 30%;
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: var(--color-accent);
		color: var(--color-on-accent);
		font: 600 11px / 1 var(--font-mono);
	}
	.spin {
		animation: spin 24s linear infinite;
		transform-origin: 50% 50%;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.spin {
			animation: none;
		}
	}
</style>
