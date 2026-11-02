<script lang="ts">
	import HoloCard from '$lib/components/HoloCard.svelte';
	import Section from '$lib/components/Section.svelte';
	import SpinBadge from '$lib/components/SpinBadge.svelte';
	import { about } from '$lib/content/about';
	import { site } from '$lib/content/site';
	import { parseEmphasis } from '$lib/utils/format';

	const back = about.card.back;
	const credentials = back.credentials
		.map((c) => (c.note ? `${c.label} (${c.note.toLowerCase()})` : c.label))
		.join(', ');

	// First paragraph leads across the full column; the rest sit side by side when there's room.
	const [first, ...rest] = about.paragraphs;
	const groups = [
		{ cls: 'lead', paragraphs: [first] },
		{ cls: 'rest', paragraphs: rest }
	];
</script>

<Section id="about" n="01" label="About" heading={about.heading}>
	<div class="grid">
		<figure class="card-col">
			<span class="dots" aria-hidden="true"></span>
			<HoloCard />
			<div class="badge"><SpinBadge text={about.badge} /></div>
			<figcaption class="sr-only">
				{site.name}
				— {about.card.strapline}. By role: {back.byRole}. By practice: {back.byPractice}.
				Credentials: {credentials}.
			</figcaption>
		</figure>

		<div class="text">
			{#each groups as group (group.cls)}
				<div class={group.cls}>
					{#each group.paragraphs as paragraph, i (i)}
						<p>
							{#each parseEmphasis(paragraph) as part, j (j)}
								{#if part.strong}
									<strong>{part.value}</strong>
								{:else}
									{part.value}
								{/if}
							{/each}
						</p>
					{/each}
				</div>
			{/each}
			<p class="hint mono"><span class="dash" aria-hidden="true"></span>{about.hint}</p>
		</div>
	</div>
</Section>

<style>
	/* Card | text. The text column takes all remaining width (no max) so the row spans the
	   content column instead of leaving a dead band on the right. */
	.grid {
		display: grid;
		grid-template-columns: 284px minmax(0, 1fr);
		align-items: center;
		gap: 56px clamp(40px, 5vw, 72px);
	}
	.card-col {
		position: relative;
		margin: 0;
		padding: 0 24px 72px 0;
	}
	.dots {
		position: absolute;
		right: 0;
		bottom: 18px;
		width: 76%;
		height: 60%;
		border-radius: 24px;
		background-image: radial-gradient(var(--color-dots) 1.3px, transparent 1.6px);
		background-size: 14px 14px;
	}
	.badge {
		position: absolute;
		z-index: 2;
		right: 0;
		bottom: -12px;
		pointer-events: none;
	}
	.text {
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		gap: 22px;
	}
	.lead,
	.rest {
		display: flex;
		flex-direction: column;
		gap: 20px;
		text-wrap: pretty;
	}
	p {
		margin: 0;
	}
	.lead {
		max-width: 46em;
		font-size: clamp(17px, 1.45vw, 20px);
		line-height: 1.65;
		color: var(--color-strong);
	}
	.rest {
		font-size: 16px;
		line-height: 1.75;
	}
	/* Two reading columns once each can hold a comfortable ~45-character line. */
	@container (min-width: 720px) {
		.rest {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 20px clamp(32px, 4cqi, 56px);
		}
	}
	strong {
		font-weight: 500;
		color: var(--color-ink);
	}
	.hint {
		margin-top: 8px;
		display: inline-flex;
		align-items: center;
		gap: 10px;
		font-size: 12px;
		color: var(--color-muted);
	}
	.dash {
		width: 22px;
		height: 2px;
		background: var(--color-accent);
	}

	/* Tablet: card beside the text, so the copy keeps a readable measure. */
	@media (max-width: 820px) {
		.grid {
			grid-template-columns: 284px minmax(0, 1fr);
			align-items: start;
			gap: 36px;
		}
		.text {
			padding-top: 4px;
		}
	}
	/* Phone: card centred above the text. */
	@media (max-width: 699px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
		.card-col {
			width: min(284px, 100%);
			justify-self: center;
		}
		.text {
			padding-top: 0;
		}
	}
</style>
