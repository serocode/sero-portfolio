<script lang="ts">
	import { deckScroll } from '$lib/actions/deck-scroll';
	import Icon from '$lib/components/Icon.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import Section from '$lib/components/Section.svelte';
	import { projects } from '$lib/content/projects';
	import { spellCap } from '$lib/utils/format';

	const sub = `${spellCap(projects.length)} projects, one card each — keep scrolling and the next one slides in over the last.`;
</script>

<Section id="projects" n="03" label="Projects" heading="Things I've built." {sub} tone="mist">
	<div class="deck" use:deckScroll>
		{#each projects as project, i (project.id)}
			<ProjectCard {project} index={i} total={projects.length} />
		{/each}
	</div>

	<div class="more">
		<a
			class="textlink"
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

<style>
	.deck {
		display: flex;
		flex-direction: column;
		gap: 72px;
	}
	.more {
		margin-top: 40px;
	}
	.more a {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		font-size: 14px;
		font-weight: 500;
		color: var(--color-ink);
	}
	@media (max-width: 820px) {
		.deck {
			gap: 24px;
		}
	}
</style>
