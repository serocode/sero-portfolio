<!-- GitHub / Facebook / Discord icon buttons (hero, footer, mobile menu). Missing hrefs render disabled. -->
<script lang="ts">
	import { heroSocials, socials } from '$lib/content/site';
	import Icon from './Icon.svelte';
	import MaybeLink from './MaybeLink.svelte';

	let {
		size = 20,
		class: cls = '',
		tone = 'body'
	}: { size?: number; class?: string; tone?: 'body' | 'muted' } = $props();

	const items = heroSocials
		.map((icon) => socials.find((s) => s.icon === icon))
		.filter((s) => s !== undefined);
</script>

<ul class="socials {cls}" class:muted={tone === 'muted'} aria-label="Social links">
	{#each items as s (s.icon)}
		<li>
			<MaybeLink href={s.href} label={s.label} external class="icon-link social">
				<Icon name={s.icon} {size} />
			</MaybeLink>
		</li>
	{/each}
</ul>

<style>
	/* List margin/padding/bullets are already reset by Tailwind's preflight, so callers can
	   position the list with utilities (e.g. -ml-3). */
	.socials {
		display: flex;
		align-items: center;
		gap: 2px;
	}
	.socials :global(.social) {
		display: flex;
		width: 44px;
		height: 44px;
		align-items: center;
		justify-content: center;
		color: var(--color-body);
	}
	.muted :global(.social) {
		color: var(--color-muted);
	}
</style>
