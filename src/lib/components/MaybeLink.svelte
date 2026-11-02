<!--
  A link whose target may not be supplied yet.
  - href is a string → a real <a> (external links open in a new tab and say so).
  - href is missing(...) → a <button aria-disabled="true"> with a "coming soon" title. Never href="#".
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import type { Missing } from '$lib/content/types';

	let {
		href,
		class: cls = '',
		label,
		external = false,
		download = false,
		comingSoon = 'Link coming soon',
		onclick,
		children
	}: {
		href: string | Missing;
		class?: string;
		/** Accessible name when the visible content is only an icon. */
		label?: string;
		external?: boolean;
		download?: boolean;
		/** Tooltip + accessible description while the target is missing. */
		comingSoon?: string;
		onclick?: HTMLAnchorAttributes['onclick'];
		children: Snippet;
	} = $props();

	const newTab = ' (opens in a new tab)';
</script>

{#if typeof href === 'string'}
	<a
		{href}
		class={cls}
		aria-label={label ? `${label}${external ? newTab : ''}` : undefined}
		target={external ? '_blank' : undefined}
		rel={external ? 'noopener noreferrer' : undefined}
		download={download || undefined}
		{onclick}
	>
		{@render children()}
		{#if external && !label}
			<span class="sr-only">{newTab}</span>
		{/if}
	</a>
{:else}
	<button
		type="button"
		class={cls}
		aria-disabled="true"
		title={comingSoon}
		aria-label={label ? `${label} — ${comingSoon.toLowerCase()}` : undefined}
	>
		{@render children()}
		{#if !label}
			<span class="sr-only"> — {comingSoon.toLowerCase()}</span>
		{/if}
	</button>
{/if}
