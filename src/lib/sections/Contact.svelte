<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import Icon from '$lib/components/Icon.svelte';
	import MaybeLink from '$lib/components/MaybeLink.svelte';
	import Placeholder from '$lib/components/Placeholder.svelte';
	import SectionLabel from '$lib/components/SectionLabel.svelte';
	import { contact, site, socials } from '$lib/content/site';
	import { isMissing } from '$lib/content/types';
	import { btnPrimaryHover, fullScreen, revealItem, wrap } from '$lib/ui';

	/** A contact list entry; only real links (not disabled placeholders) take the hover colour. */
	const item =
		'inline-flex min-h-11 items-center gap-2 text-[14px] text-on-inverse transition-colors duration-150 ease-[ease] not-aria-disabled:hover:text-inverse-accent';

	const email = site.email;
	const mailto = typeof email === 'string' ? `mailto:${email}` : email;
</script>

<section
	id="contact"
	aria-labelledby="contact-h"
	class="group/reveal {fullScreen}"
	use:reveal
	data-draft-group
	data-draft-cursors="4"
>
	<div class="{wrap} pt-[clamp(20px,3vw,36px)] pb-[clamp(40px,5vw,64px)]">
		<!-- The one inverted panel: dark in light mode, light in dark mode. -->
		<div
			class="rounded-[28px] bg-inverse p-[clamp(36px,6vw,80px)] text-inverse-body [&_:focus-visible]:outline-accent {revealItem}"
		>
			<SectionLabel n="05" label="Contact" dark />
			<h2
				id="contact-h"
				class="max-w-[820px] text-[clamp(38px,6.2vw,72px)] leading-[1.02] font-bold tracking-[-0.045em] text-balance text-on-inverse"
				data-draft="H2"
				data-draft-text
			>
				{contact.heading}
			</h2>
			<p
				class="mt-6 max-w-[540px] text-[18px] leading-[1.7] text-pretty"
				data-draft="Body"
				data-draft-text
			>
				{contact.body}
			</p>

			<div class="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3.5 text-[15px]">
				<MaybeLink
					href={mailto}
					class="inline-flex min-h-13 items-center gap-2.5 rounded-full bg-on-inverse px-7 text-[15px] font-medium text-inverse {btnPrimaryHover}"
					comingSoon="Email address coming soon"
					draft="CTA"
				>
					<Icon name="mail" size={16} strokeWidth={2} />
					<span>{contact.cta}</span>
				</MaybeLink>
				{#if typeof email === 'string'}
					<span class="font-mono text-[14px] text-on-inverse" data-draft="Email">{email}</span>
				{:else}
					<span data-draft="Email"><Placeholder dark text={email.placeholder} /></span>
				{/if}
			</div>

			<ul
				class="mt-12 flex flex-wrap gap-x-8 gap-y-1 border-t border-inverse-line pt-[22px] text-[14px]"
			>
				{#each socials as s (s.label)}
					<li data-draft="Link">
						<MaybeLink href={s.href} external class={item}>
							<span>{s.label}</span>
							{#if s.handle !== undefined}
								{#if isMissing(s.handle)}
									<Placeholder dark small text={s.handle.placeholder} />
								{:else}
									<span class="font-mono text-[12px] text-inverse-muted">{s.handle}</span>
								{/if}
							{/if}
						</MaybeLink>
					</li>
				{/each}
				<li data-draft="Link">
					<MaybeLink href={site.resume} external class={item} comingSoon="Résumé PDF coming soon">
						<span>Résumé</span>
						{#if isMissing(site.resume)}
							<Placeholder dark small text={site.resume.placeholder} />
						{:else}
							<span class="font-mono text-[12px] text-inverse-muted">PDF</span>
						{/if}
					</MaybeLink>
				</li>
			</ul>
		</div>
	</div>
</section>
