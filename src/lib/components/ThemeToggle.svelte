<!--
  38px round theme switch (44px hit area via ::after): left of Résumé on desktop, left of the menu button on
  phones. Shows the theme you'll switch TO (moon in light, sun in dark); the icons swap with a
  quarter turn. Clicking reveals the new theme as a circle growing from this button.

  The icon state follows <html data-theme> in CSS, not JS state, so it's right from first paint —
  the inline script in app.html sets the attribute before the page renders, long before hydration.
-->
<script lang="ts">
	import { theme } from '$lib/theme.svelte';

	let el = $state<HTMLButtonElement>();
	const next = $derived(theme.current === 'dark' ? 'light' : 'dark');
	/** Sun/moon swap: a quarter turn with a slight overshoot. */
	const icon =
		'absolute [transition:transform_0.5s_cubic-bezier(0.3,1.4,0.5,1),opacity_0.25s_ease] motion-reduce:transition-none';
</script>

<button
	bind:this={el}
	type="button"
	class="theme-toggle relative inline-flex size-[38px] flex-none items-center justify-center rounded-full border border-line-strong bg-transparent p-0 text-strong transition-colors duration-[180ms] ease-[ease] after:absolute after:-inset-[3px] hover:border-ink hover:text-ink focus-visible:rounded-full"
	onclick={() => theme.toggle(el)}
	aria-label="Switch to {next} theme"
	title="Switch to {next} theme"
>
	<svg
		class="{icon} [transform:rotate(-90deg)_scale(0.4)] opacity-0 dark:transform-none dark:opacity-100"
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
		class="{icon} transform-none opacity-100 dark:[transform:rotate(90deg)_scale(0.4)] dark:opacity-0"
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
