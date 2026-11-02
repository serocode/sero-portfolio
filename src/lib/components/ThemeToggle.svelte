<!--
  38px round theme switch (44px hit area). Shows the theme you'll switch TO: moon in light mode,
  sun in dark mode. The icon follows <html data-theme> in CSS, so it's right from first paint —
  the inline script in app.html sets the attribute before the page renders, long before hydration.
-->
<script lang="ts">
	import { theme } from '$lib/theme.svelte';

	const next = $derived(theme.current === 'dark' ? 'light' : 'dark');
</script>

<button
	type="button"
	class="theme-toggle"
	onclick={() => theme.toggle()}
	aria-label="Switch to {next} theme"
	title="Switch to {next} theme"
>
	<svg
		class="sun"
		aria-hidden="true"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
	>
		<circle cx="12" cy="12" r="4.5" />
		<line x1="12" y1="1.5" x2="12" y2="3.5" />
		<line x1="12" y1="20.5" x2="12" y2="22.5" />
		<line x1="4.2" y1="4.2" x2="5.6" y2="5.6" />
		<line x1="18.4" y1="18.4" x2="19.8" y2="19.8" />
		<line x1="1.5" y1="12" x2="3.5" y2="12" />
		<line x1="20.5" y1="12" x2="22.5" y2="12" />
		<line x1="4.2" y1="19.8" x2="5.6" y2="18.4" />
		<line x1="18.4" y1="5.6" x2="19.8" y2="4.2" />
	</svg>
	<svg
		class="moon"
		aria-hidden="true"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
	</svg>
</button>

<style>
	.theme-toggle {
		position: relative;
		width: 38px;
		height: 38px;
		flex: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		background: transparent;
		border: 1px solid var(--color-line-strong);
		border-radius: 999px;
		color: var(--color-strong);
		transition:
			border-color 0.18s ease,
			color 0.18s ease;
	}
	/* 44px touch target without changing the visual size */
	.theme-toggle::after {
		content: "";
		position: absolute;
		inset: -3px;
	}
	.theme-toggle:focus-visible {
		border-radius: 999px;
	}
	@media (hover: hover) {
		.theme-toggle:hover {
			border-color: var(--color-ink);
			color: var(--color-ink);
		}
	}
	.sun {
		display: none;
	}
	:global([data-theme="dark"]) .sun {
		display: block;
	}
	:global([data-theme="dark"]) .moon {
		display: none;
	}
</style>
