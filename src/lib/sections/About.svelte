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

	// First paragraph leads across the full column; the rest sit side by side once each column
	// can hold a comfortable ~45-character line (container ≥ 720px).
	const [first, ...rest] = about.paragraphs;
	const groups = [
		{
			id: 'lead',
			paragraphs: [first],
			class:
				'flex max-w-[46em] flex-col gap-5 text-[clamp(17px,1.45vw,20px)] leading-[1.65] text-pretty text-strong'
		},
		{
			id: 'rest',
			paragraphs: rest,
			class:
				'flex flex-col gap-5 text-[16px] leading-[1.75] text-pretty @min-[720px]:grid @min-[720px]:grid-cols-2 @min-[720px]:gap-x-[clamp(32px,4cqi,56px)]'
		}
	];
</script>

<Section id="about" n="01" label="About" heading={about.heading}>
	<!-- Card | text: the text column takes all remaining width, so the row spans the content column.
	     Tablet (≤820px): card beside the text, top-aligned. Phone (<700px): card centred above. -->
	<div
		class="grid grid-cols-[284px_minmax(0,1fr)] items-center gap-x-[clamp(40px,5vw,72px)] gap-y-14 max-desk:items-start max-desk:gap-9 max-[700px]:grid-cols-[minmax(0,1fr)]"
	>
		<figure
			class="relative pr-6 pb-[72px] max-[700px]:w-[min(284px,100%)] max-[700px]:justify-self-center"
		>
			<span
				class="absolute right-0 bottom-[18px] h-[60%] w-[76%] rounded-[24px] bg-[radial-gradient(var(--color-dots)_1.3px,transparent_1.6px)] bg-size-[14px_14px]"
				aria-hidden="true"
			></span>
			<HoloCard />
			<div class="pointer-events-none absolute right-0 -bottom-3 z-2">
				<SpinBadge text={about.badge} />
			</div>
			<figcaption class="sr-only">
				{site.name}
				— {about.card.strapline}. By role: {back.byRole}. By practice: {back.byPractice}.
				Credentials: {credentials}.
			</figcaption>
		</figure>

		<div class="@container flex flex-col gap-[22px] max-desk:pt-1 max-[700px]:pt-0">
			{#each groups as group (group.id)}
				<div class={group.class}>
					{#each group.paragraphs as paragraph, i (i)}
						<p>
							{#each parseEmphasis(paragraph) as part, j (j)}
								{#if part.strong}
									<strong class="font-medium text-ink">{part.value}</strong>
								{:else}
									{part.value}
								{/if}
							{/each}
						</p>
					{/each}
				</div>
			{/each}
			<p class="mt-2 inline-flex items-center gap-2.5 font-mono text-[12px] text-muted">
				<span class="h-0.5 w-[22px] bg-accent" aria-hidden="true"></span>{about.hint}
			</p>
		</div>
	</div>
</Section>
