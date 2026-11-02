<!-- GitHub / Facebook / Discord icon buttons (hero, footer, mobile menu). Missing hrefs render disabled. -->
<script lang="ts">
	import { heroSocials, socials } from '$lib/content/site';
	import { iconLink } from '$lib/ui';
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

<!-- Preflight already resets list margins/bullets, so callers position it with utilities (e.g. -ml-3). -->
<ul class="socials flex items-center gap-0.5 {cls}" aria-label="Social links">
	{#each items as s (s.icon)}
		<li>
			<MaybeLink
				href={s.href}
				label={s.label}
				external
				class="flex size-11 items-center justify-center {tone === 'muted'
					? 'text-muted'
					: 'text-body'} {iconLink}"
			>
				<Icon name={s.icon} {size} />
			</MaybeLink>
		</li>
	{/each}
</ul>
