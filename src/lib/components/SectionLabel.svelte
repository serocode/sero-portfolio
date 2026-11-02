<!-- "01 · ABOUT ——" row above each h2. `dark` is the variant used inside the Contact panel. -->
<script lang="ts">
	let {
		n,
		label,
		dark = false,
		rule = 'var(--color-line)'
	}: { n: string; label: string; dark?: boolean; rule?: string } = $props();
</script>

<div class="label-row" class:dark style:--rule={dark ? 'var(--color-inverse-line)' : rule}>
	<span class="n mono">{n}</span>
	<span class="label mono">{label}</span>
	<span class="rule" aria-hidden="true"></span>
</div>

<style>
	.label-row {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-bottom: 18px;
	}
	.n {
		font-size: 13px;
		line-height: 1.4;
		color: var(--color-accent-700);
	}
	.label {
		font-size: 12px;
		line-height: 1.4;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-muted);
	}
	.rule {
		flex: 1;
		max-width: 240px;
		height: 2px;
		background:
			linear-gradient(var(--color-accent), var(--color-accent)) left center / 28px 2px no-repeat,
			linear-gradient(var(--rule), var(--rule)) left center / 100% 1px no-repeat;
	}
	.dark {
		margin-bottom: 24px;
	}
	.dark .n {
		color: var(--color-inverse-accent);
	}
	.dark .label {
		color: var(--color-inverse-muted);
	}
	.dark .rule {
		max-width: 200px;
	}
</style>
