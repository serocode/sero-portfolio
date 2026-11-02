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
	<div class="filters" role="group" aria-label="Show the stack of one project">
		<button
			type="button"
			class="chip"
			aria-pressed={selected === null}
			onclick={() => (selected = null)}
		>
			All projects
		</button>
		{#each projects as p (p.id)}
			<button
				type="button"
				class="chip"
				aria-pressed={selected === p.id}
				onclick={() => pick(p.id)}
			>
				{p.title}
			</button>
		{/each}
	</div>

	<div class="matrix" class:filtering={selected !== null} style:--n={total}>
		<div class="readout pad" aria-live="polite">
			<span class="headline">{headline}</span>
			<span class="detail mono">{detail}</span>
		</div>

		<div class="grid pad colhead mono" aria-hidden="true">
			<span>Tool</span>
			{#each projects as p (p.id)}
				<span class="col" class:sel={selected === p.id}>
					<span class="long">{projectColumns[p.id]?.short ?? p.title}</span>
					<span class="code">{projectColumns[p.id]?.code ?? p.title.slice(0, 2)}</span>
				</span>
			{/each}
			<span class="used">Used</span>
		</div>

		{#each skillGroups as group (group.label)}
			<div class="group">
				<h3 class="group-label pad mono">{group.label}</h3>
				<ul>
					{#each group.tools as tool (tool.name)}
						{@const hit = selected !== null && tool.usedIn.includes(selected)}
						<li class="grid pad row" class:hit class:miss={selected !== null && !hit}>
							<span class="tool">{tool.name}</span>
							{#each projects as p (p.id)}
								{@const on = tool.usedIn.includes(p.id)}
								<span class="cell" class:sel={selected === p.id} aria-hidden="true">
									<span class="dot" class:on></span>
								</span>
							{/each}
							<span class="n mono">{tool.usedIn.length}<span class="of">/{total}</span></span>
							<span class="sr-only">{usedIn(tool.usedIn)}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
		<div class="end"></div>
	</div>
</Section>

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 20px;
	}
	.chip {
		min-height: 44px;
		padding: 0 16px;
		border: 1px solid var(--color-line);
		border-radius: 999px;
		background: var(--color-surface);
		font-size: 14px;
		font-weight: 500;
		color: var(--color-strong);
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease;
	}
	.chip:hover {
		border-color: var(--color-ink);
	}
	.chip[aria-pressed="true"] {
		background: var(--color-inverse);
		border-color: var(--color-inverse);
		color: var(--color-on-inverse);
	}

	.matrix {
		overflow: hidden;
		border: 1px solid var(--color-line);
		border-radius: 16px;
		background: var(--color-surface);
	}
	.pad {
		padding-inline: 24px;
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) repeat(var(--n), 76px) 52px;
		column-gap: 4px;
		align-items: center;
	}
	.readout {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 14px;
		padding-block: 18px;
		background: var(--color-mist);
		border-bottom: 1px solid var(--color-line);
	}
	.headline {
		font-size: 17px;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--color-ink);
	}
	.detail {
		font-size: 12px;
		color: var(--color-muted);
	}

	.colhead {
		padding-block: 14px 10px;
		border-bottom: 1px solid var(--color-line);
		font-size: 11px;
		line-height: 1.4;
		color: var(--color-muted);
	}
	.colhead > span:first-child,
	.used {
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.used {
		text-align: right;
	}
	.col {
		align-self: stretch;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px 0;
		border-radius: 6px;
		white-space: nowrap;
		color: var(--color-body);
		transition:
			background-color 0.25s ease,
			color 0.25s ease;
	}
	.filtering .col {
		color: var(--color-muted);
	}
	.col.sel,
	.filtering .col.sel {
		background: rgba(249, 115, 22, 0.08);
		font-weight: 600;
		color: var(--color-accent-700);
	}
	.code {
		display: none;
	}

	.group ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.group-label {
		margin: 0;
		padding-block: 18px 6px;
		font-size: 11px;
		font-weight: 500;
		line-height: 1.4;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-accent-700);
	}
	.row {
		min-height: 44px;
		border-top: 1px solid var(--color-line-soft);
		transition: background-color 0.2s ease;
	}
	.row:hover {
		background: color-mix(in srgb, var(--color-mist) 55%, var(--color-surface));
	}
	.tool {
		padding-block: 10px;
		font-size: 15px;
		line-height: 1.35;
		color: var(--color-ink);
		transition:
			color 0.25s ease,
			font-weight 0.25s ease;
	}
	.hit .tool {
		font-weight: 600;
	}
	/* Rows the selected project doesn't use: dots + count drop to 30%; the name dims to `muted`
	   rather than 30% so it keeps ≥ 4.5:1 contrast. */
	.miss .tool {
		color: var(--color-muted);
	}
	.cell,
	.n {
		transition: opacity 0.25s ease;
	}
	.miss .cell {
		opacity: 0.3;
	}
	.miss .n {
		color: var(--color-muted);
	}
	.cell {
		align-self: stretch;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			background-color 0.25s ease,
			opacity 0.25s ease;
	}
	.cell.sel {
		background: rgba(249, 115, 22, 0.08);
	}
	.dot {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--color-dot-off);
		transition:
			background-color 0.25s ease,
			box-shadow 0.25s ease;
	}
	.dot.on {
		width: 10px;
		height: 10px;
		background: var(--color-accent);
	}
	.filtering .cell:not(.sel) .dot.on {
		background: var(--color-dot-fade);
	}
	.cell.sel .dot.on {
		box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.18);
	}
	.n {
		text-align: right;
		font-size: 12px;
		color: var(--color-body);
	}
	.of {
		color: var(--color-muted);
	}
	.end {
		height: 14px;
	}

	@media (max-width: 820px) {
		.grid {
			grid-template-columns: minmax(0, 1fr) repeat(var(--n), 26px) 30px;
			column-gap: 2px;
		}
		.pad {
			padding-inline: 14px;
		}
		.long {
			display: none;
		}
		.code {
			display: inline;
		}
		.tool {
			font-size: 14px;
		}
	}
</style>
