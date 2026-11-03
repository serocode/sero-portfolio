<!--
  Skills matrix. Built as a CSS grid of rows (not a <table>) to keep the design's layout:
  the column header + dots are aria-hidden, and each row carries a visually-hidden
  "Used in …" sentence built from the project titles.
-->
<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { projects } from '$lib/content/projects';
	import { projectColumns, skillGroups, skillsIntro } from '$lib/content/skills';

	const toolCount = skillGroups.reduce((n, g) => n + g.tools.length, 0);
	const total = projects.length;

	let selected = $state<string | null>(null);
	const current = $derived(projects.find((p) => p.id === selected));
	const usedBySelected = $derived.by(() => {
		const id = selected;
		if (id === null) return 0;
		return skillGroups.reduce((n, g) => n + g.tools.filter((t) => t.usedIn.includes(id)).length, 0);
	});
	const headline = $derived(
		current
			? `${current.title} uses ${usedBySelected} of these ${toolCount} tools.`
			: `${toolCount} tools across ${total} projects.`
	);
	const detail = $derived(current ? current.kind : 'Columns follow the project deck above');

	const filtering = $derived(selected !== null);

	// Shared row/column template: tool name | one column per project | "Used" count.
	const grid =
		'grid grid-cols-[minmax(0,1fr)_repeat(var(--n),76px)_52px] items-center gap-x-1 max-desk:grid-cols-[minmax(0,1fr)_repeat(var(--n),26px)_30px] max-desk:gap-x-0.5';
	const pad = 'px-6 max-desk:px-3.5';
	const chip =
		'min-h-11 rounded-full border border-line bg-surface px-4 text-[14px] font-medium text-strong [transition:background-color_0.2s_ease,border-color_0.2s_ease,color_0.2s_ease] hover:border-ink aria-pressed:border-inverse aria-pressed:bg-inverse aria-pressed:text-on-inverse';

	function pick(id: string | null) {
		selected = id === selected ? null : id;
	}

	const usedIn = (ids: string[]) =>
		`Used in ${projects
			.filter((p) => ids.includes(p.id))
			.map((p) => p.title)
			.join(', ')}.`;
</script>

<Section
	id="skills"
	n="04"
	label="Skills"
	heading={skillsIntro.heading}
	sub={skillsIntro.sub}
	subGap={32}
>
	<div
		class="mb-5 flex flex-wrap gap-2"
		role="group"
		aria-label="Show the stack of one project"
		data-draft="Filters"
		data-draft-fit
	>
		<button
			type="button"
			class={chip}
			data-draft="Chip"
			aria-pressed={selected === null}
			onclick={() => (selected = null)}
		>
			All projects
		</button>
		{#each projects as p, i (p.id)}
			<button
				type="button"
				class={chip}
				data-draft={i < 1 ? 'Chip' : undefined}
				aria-pressed={selected === p.id}
				onclick={() => pick(p.id)}
			>
				{p.title}
			</button>
		{/each}
	</div>

	<div class="overflow-hidden rounded-2xl border border-line bg-surface" style:--n={total}>
		<div
			class="{pad} flex flex-wrap items-baseline gap-x-3.5 gap-y-1 border-b border-line bg-mist py-[18px]"
			aria-live="polite"
			data-draft="Readout"
		>
			<span class="text-[17px] font-semibold tracking-[-0.01em] text-ink">{headline}</span>
			<span class="font-mono text-[12px] text-muted">{detail}</span>
		</div>

		<div
			class="{grid} {pad} border-b border-line pt-3.5 pb-2.5 font-mono text-[11px] leading-[1.4] text-muted"
			aria-hidden="true"
		>
			<span class="tracking-[0.1em] uppercase">Tool</span>
			{#each projects as p (p.id)}
				<span
					class={[
						'flex items-center justify-center self-stretch rounded-md py-1 whitespace-nowrap [transition:background-color_0.25s_ease,color_0.25s_ease]',
						selected === p.id
							? 'bg-accent/8 font-semibold text-accent-700'
							: filtering
								? 'text-muted'
								: 'text-body'
					]}
				>
					<span class="max-desk:hidden">{projectColumns[p.id]?.short ?? p.title}</span>
					<span class="hidden max-desk:inline"
						>{projectColumns[p.id]?.code ?? p.title.slice(0, 2)}</span
					>
				</span>
			{/each}
			<span class="text-right tracking-[0.1em] uppercase">Used</span>
		</div>

		{#each skillGroups as group, g (group.label)}
			<div>
				<h3
					class="{pad} pt-[18px] pb-1.5 font-mono text-[11px] leading-[1.4] font-medium tracking-[0.12em] text-accent-700 uppercase"
				>
					{group.label}
				</h3>
				<ul>
					{#each group.tools as tool, t (tool.name)}
						{@const hit = selected !== null && tool.usedIn.includes(selected)}
						{@const miss = selected !== null && !hit}
						<li
							data-draft={g === 0 && t < 3 ? 'Row' : undefined}
							class="{grid} {pad} min-h-11 border-t border-line-soft transition-colors duration-200 ease-[ease] hover:bg-[color-mix(in_srgb,var(--color-mist)_55%,var(--color-surface))]"
						>
							<!-- Rows the selected project doesn't use: dots + count drop to 30%; the name dims to
							     `muted` rather than 30% so it keeps ≥ 4.5:1 contrast. -->
							<span
								class={[
									'py-2.5 text-[15px] leading-[1.35] [transition:color_0.25s_ease,font-weight_0.25s_ease] max-desk:text-[14px]',
									hit && 'font-semibold',
									miss ? 'text-muted' : 'text-ink'
								]}
								>{tool.name}</span
							>
							{#each projects as p (p.id)}
								{@const on = tool.usedIn.includes(p.id)}
								{@const sel = selected === p.id}
								<span
									class={[
										'flex items-center justify-center self-stretch [transition:background-color_0.25s_ease,opacity_0.25s_ease]',
										sel && 'bg-accent/8',
										miss && 'opacity-30'
									]}
									aria-hidden="true"
								>
									<span
										class={[
											'rounded-full [transition:background-color_0.25s_ease,box-shadow_0.25s_ease]',
											!on && 'size-1 bg-dot-off',
											on && 'size-2.5',
											on && sel && 'bg-accent shadow-[0_0_0_4px_rgba(249,115,22,0.18)]',
											on && !sel && (filtering ? 'bg-dot-fade' : 'bg-accent')
										]}
									></span>
								</span>
							{/each}
							<span
								class={[
									'text-right font-mono text-[12px] transition-opacity duration-[250ms] ease-[ease]',
									miss ? 'text-muted' : 'text-body'
								]}
								>{tool.usedIn.length}<span class="text-muted">/{total}</span></span
							>
							<span class="sr-only">{usedIn(tool.usedIn)}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
		<div class="h-3.5"></div>
	</div>
</Section>
