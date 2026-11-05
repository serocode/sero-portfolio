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
		draft,
		children
	}: {
		href: string | Missing | null;
		class?: string;
		label?: string;
		external?: boolean;
		download?: boolean;
		comingSoon?: string;
		onclick?: HTMLAnchorAttributes['onclick'];
		draft?: string;
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
		data-draft={draft}
	>
		{@render children()}
		{#if external && !label}
			<span class="sr-only">{newTab}</span>
		{/if}
	</a>
{:else}
	<button
		type="button"
		class="cursor-not-allowed {cls}"
		aria-disabled="true"
		title={comingSoon}
		aria-label={label ? `${label} — ${comingSoon.toLowerCase()}` : undefined}
		data-draft={draft}
	>
		{@render children()}
		{#if !label}
			<span class="sr-only"> — {comingSoon.toLowerCase()}</span>
		{/if}
	</button>
{/if}
