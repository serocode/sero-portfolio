<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import MaybeLink from '$lib/components/MaybeLink.svelte';
	import Placeholder from '$lib/components/Placeholder.svelte';
	import SectionLabel from '$lib/components/SectionLabel.svelte';
	import { contact, site, socials } from '$lib/content/site';
	import { isMissing } from '$lib/content/types';

	const email = site.email;
	const mailto = typeof email === 'string' ? `mailto:${email}` : email;
</script>

<section id="contact" aria-labelledby="contact-h">
	<div class="wrap outer">
		<div class="panel">
			<SectionLabel n="05" label="Contact" dark />
			<h2 id="contact-h">{contact.heading}</h2>
			<p class="body">{contact.body}</p>

			<div class="cta-row">
				<MaybeLink href={mailto} class="btn-primary hello" comingSoon="Email address coming soon">
					<Icon name="mail" size={16} strokeWidth={2} />
					<span>{contact.cta}</span>
				</MaybeLink>
				{#if typeof email === 'string'}
					<span class="email mono">{email}</span>
				{:else}
					<Placeholder dark text={email.placeholder} />
				{/if}
			</div>

			<ul class="list">
				{#each socials as s (s.label)}
					<li>
						<MaybeLink href={s.href} external class="item">
							<span>{s.label}</span>
							{#if s.handle !== undefined}
								{#if isMissing(s.handle)}
									<Placeholder dark text={s.handle.placeholder} />
								{:else}
									<span class="handle mono">{s.handle}</span>
								{/if}
							{/if}
						</MaybeLink>
					</li>
				{/each}
				<li>
					<MaybeLink href={site.resume} external class="item" comingSoon="Résumé PDF coming soon">
						<span>Résumé</span>
						{#if isMissing(site.resume)}
							<Placeholder dark text={site.resume.placeholder} />
						{:else}
							<span class="handle mono">PDF</span>
						{/if}
					</MaybeLink>
				</li>
			</ul>
		</div>
	</div>
</section>

<style>
	.outer {
		padding-top: clamp(20px, 3vw, 36px);
		padding-bottom: clamp(40px, 5vw, 64px);
	}
	.panel {
		padding: clamp(36px, 6vw, 80px);
		background: var(--color-inverse);
		border-radius: 28px;
		color: var(--color-inverse-body);
	}
	h2 {
		margin: 0;
		max-width: 820px;
		font-size: clamp(38px, 6.2vw, 72px);
		font-weight: 700;
		line-height: 1.02;
		letter-spacing: -0.045em;
		color: var(--color-on-inverse);
		text-wrap: balance;
	}
	.body {
		margin: 24px 0 0;
		max-width: 540px;
		font-size: 18px;
		line-height: 1.7;
		text-wrap: pretty;
	}
	.cta-row {
		margin-top: 36px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 14px 20px;
		font-size: 15px;
	}
	.cta-row :global(.hello) {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		min-height: 52px;
		padding: 0 28px;
		background: var(--color-on-inverse);
		border: 0;
		border-radius: 999px;
		font-size: 15px;
		font-weight: 500;
		color: var(--color-inverse);
	}
	.email {
		font-size: 14px;
		color: var(--color-on-inverse);
	}
	.list {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 32px;
		margin: 48px 0 0;
		padding: 22px 0 0;
		list-style: none;
		border-top: 1px solid var(--color-inverse-line);
		font-size: 14px;
	}
	.list :global(.item) {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 0;
		background: none;
		border: 0;
		font-size: 14px;
		color: var(--color-on-inverse);
		transition: color 0.15s ease;
	}
	.list :global(a.item:hover) {
		color: var(--color-inverse-accent);
	}
	.handle {
		font-size: 12px;
		color: var(--color-inverse-muted);
	}
	.list :global(.ph) {
		font-size: 12px;
	}
	.panel :global(:focus-visible) {
		outline-color: var(--color-accent);
	}
</style>
