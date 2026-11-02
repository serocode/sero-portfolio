<script lang="ts">
	import { deckScroll } from '$lib/actions/deck-scroll';
	import Icon from '$lib/components/Icon.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import Section from '$lib/components/Section.svelte';
	import { projects } from '$lib/content/projects';
	import { textLink } from '$lib/ui';
	import { spellCap } from '$lib/utils/format';

	const sub = `${spellCap(projects.length)} projects, one card each — keep scrolling and the next one slides in over the last.`;
</script>

<Section id="projects" n="03" label="Projects" heading="Things I've built." {sub} tone="mist">
	<div class="flex flex-col gap-[72px] max-desk:gap-6" use:deckScroll>
		{#each projects as project, i (project.id)}
			<ProjectCard {project} index={i} total={projects.length} />
		{/each}
	</div>

	<div class="mt-10">
		<a
			class="inline-flex min-h-11 items-center gap-2 text-[14px] font-medium text-ink {textLink}"
			href="https://github.com/serocode"
			target="_blank"
			rel="noopener noreferrer"
		>
			<span>Everything else on GitHub</span>
			<Icon name="arrow-up-right" size={14} strokeWidth={2} />
			<span class="sr-only"> (opens in a new tab)</span>
		</a>
	</div>
</Section>
