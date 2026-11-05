<script lang="ts">
	import { heroSocials, socials } from '$lib/content/site';
	import { iconLink } from '$lib/ui';
	import Icon from './Icon.svelte';
	import MaybeLink from './MaybeLink.svelte';

	let {
		size = 20,
		class: cls = '',
		tone = 'body',
		draft,
		itemDraft
	}: {
		size?: number;
		class?: string;
		tone?: 'body' | 'muted';
		draft?: string;
		itemDraft?: string;
	} = $props();

	const items = heroSocials
		.map((icon) => socials.find((s) => s.icon === icon))
		.filter((s) => s !== undefined);
</script>

<ul class="socials flex items-center gap-0.5 {cls}" aria-label="Social links" data-draft={draft}>
	{#each items as s (s.icon)}
		<li data-cursor={typeof s.handle === 'string' ? s.handle : undefined}>
			<MaybeLink
				href={s.href}
				label={s.label}
				external
				draft={itemDraft}
				class="flex size-11 items-center justify-center {tone === 'muted'
					? 'text-muted'
					: 'text-body'} {iconLink}"
			>
				<Icon name={s.icon} {size} />
			</MaybeLink>
		</li>
	{/each}
</ul>
