<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { projects } from '$lib/content/projects';
	import { projectColumns, skillGroups, skillsCopy, skillsIntro } from '$lib/content/skills';

	const total = projects.length;
	const tools = skillGroups.flatMap((g) => g.tools);
	const toolCount = tools.length;
	const groups = skillGroups.map((g, gi) => ({
		...g,
		start: skillGroups.slice(0, gi).reduce((n, x) => n + x.tools.length, 0)
	}));
	const stackSize = (id: string) => tools.filter((t) => t.usedIn.includes(id)).length;
	const short = (id: string) => projectColumns[id]?.short ?? id;

	// One selection at a time: a project (its stack) or a tool (where it's used).
	let project = $state<string | null>(null);
	let tool = $state<string | null>(null);
	// Hovering a tile previews its projects on the chips (visual only, not announced).
	let hoverTool = $state<string | null>(null);
	let focusIdx = $state(0);
	let tiles: HTMLButtonElement[] = $state([]);

	const current = $derived(projects.find((p) => p.id === project));
	const currentTool = $derived(tools.find((t) => t.name === tool));
	const litTool = $derived(tools.find((t) => t.name === (hoverTool ?? tool)));
	const used = $derived(project ? stackSize(project) : 0);

	const headline = $derived(
		current
			? skillsCopy.project(current.title, used, toolCount)
			: currentTool
				? skillsCopy.tool(currentTool.name, currentTool.usedIn.length, total)
				: skillsCopy.overview(toolCount, total)
	);
	const detail = $derived(
		current
			? current.kind
			: currentTool
				? projects
						.filter((p) => currentTool.usedIn.includes(p.id))
						.map((p) => p.title)
						.join(' · ')
				: skillsCopy.overviewDetail
	);
	const meter = $derived(
		current ? used / toolCount : currentTool ? currentTool.usedIn.length / total : 0
	);

	function pickProject(id: string | null) {
		tool = null;
		project = id === project ? null : id;
	}
	function pickTool(name: string, i: number) {
		project = null;
		tool = name === tool ? null : name;
		focusIdx = i;
	}
	function clear() {
		project = null;
		tool = null;
	}

	function onTileKey(e: KeyboardEvent) {
		const step: Record<string, number> = {
			ArrowRight: 1,
			ArrowDown: 1,
			ArrowLeft: -1,
			ArrowUp: -1
		};
		let next = focusIdx;
		if (e.key in step) next = (focusIdx + step[e.key] + toolCount) % toolCount;
		else if (e.key === 'Home') next = 0;
		else if (e.key === 'End') next = toolCount - 1;
		else return;
		e.preventDefault();
		focusIdx = next;
		tiles[next]?.focus();
	}

	function tileState(t: { name: string; usedIn: string[] }) {
		if (tool === t.name) return 'picked';
		if (project) return t.usedIn.includes(project) ? 'hit' : 'miss';
		if (tool) return 'miss';
		return 'idle';
	}

	const chip =
		'group/chip relative inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-[14px] font-medium text-strong transition-[background-color,border-color,color,box-shadow] duration-200 ease-smooth hover:border-ink aria-pressed:border-inverse aria-pressed:bg-inverse aria-pressed:text-on-inverse data-lit:border-accent/60 data-lit:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_14%,transparent)] motion-reduce:transition-none';
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
		class="mb-4 flex flex-wrap gap-2"
		role="group"
		aria-label={skillsCopy.projectsLabel}
		data-draft="Filters"
		data-draft-fit
	>
		<button
			type="button"
			class={chip}
			data-draft="Chip"
			aria-pressed={project === null && tool === null}
			onclick={clear}
		>
			{skillsCopy.all}
		</button>
		{#each projects as p (p.id)}
			<button
				type="button"
				class={chip}
				aria-pressed={project === p.id}
				data-lit={litTool?.usedIn.includes(p.id) || undefined}
				onclick={() => pickProject(p.id)}
			>
				<span
					class="absolute -top-0.5 -right-0.5 size-2.5 scale-0 rounded-full bg-accent ring-2 ring-paper transition-transform duration-200 ease-smooth group-data-lit/chip:scale-100 motion-reduce:transition-none"
					aria-hidden="true"
				></span>
				{p.title}
				<span
					class="font-mono text-[11px] text-muted group-aria-pressed/chip:text-on-inverse/70"
					aria-hidden="true"
					>{stackSize(p.id)}</span
				>
			</button>
		{/each}
	</div>

	<div
		class="mb-8 flex min-h-[88px] flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-line bg-mist px-6 py-4 max-desk:mb-6 max-desk:px-4"
		data-draft="Readout"
	>
		<div class="min-w-0 flex-[1_1_320px]" aria-live="polite">
			<p class="text-[17px] font-semibold tracking-[-0.01em] text-ink">{headline}</p>
			<p class="mt-1 font-mono text-[12px] leading-normal text-muted">{detail}</p>
		</div>
		<div class="flex flex-none items-center gap-4" aria-hidden="true">
			<span class="h-1.5 w-[clamp(96px,14vw,168px)] overflow-hidden rounded-full bg-line">
				<span
					class="block h-full origin-left rounded-full bg-accent transition-transform duration-500 ease-smooth motion-reduce:transition-none"
					style:transform="scaleX({meter})"
				></span>
			</span>
			<span class="w-10 text-right font-mono text-[12px] text-body"
				>{Math.round(meter * 100)}%</span
			>
		</div>
		<button
			type="button"
			class="min-h-11 flex-none rounded-full px-3 font-mono text-[12px] tracking-[0.06em] text-body uppercase transition-colors hover:text-accent-700 disabled:invisible"
			disabled={project === null && tool === null}
			onclick={clear}
		>
			{skillsCopy.clear}
		</button>
	</div>

	<div class="flex flex-col" role="group" aria-label={skillsCopy.toolsLabel}>
		{#each groups as group, g (group.label)}
			{@const hits = project
				? group.tools.filter((t) => t.usedIn.includes(project as string)).length
				: null}
			<div
				class="grid grid-cols-[168px_minmax(0,1fr)] gap-x-8 border-t border-line py-5 max-desk:grid-cols-1 max-desk:gap-y-3 max-desk:py-4"
			>
				<div
					class="flex items-baseline justify-between gap-3 self-start pt-1 desk:flex-col desk:gap-1.5"
				>
					<h3
						class="font-mono text-[11px] leading-[1.4] font-medium tracking-[0.12em] text-accent-700 uppercase"
					>
						{group.label}
					</h3>
					<p class="font-mono text-[12px] text-muted">
						{#if hits !== null}
							<span class="text-ink">{hits}</span>
							/ {group.tools.length}
						{:else}
							{skillsCopy.toolCount(group.tools.length)}
						{/if}
					</p>
				</div>
				<ul
					class="grid grid-cols-[repeat(auto-fill,minmax(178px,1fr))] gap-2.5 max-desk:grid-cols-[repeat(auto-fill,minmax(148px,1fr))] max-desk:gap-2"
				>
					{#each group.tools as t, ti (t.name)}
						{@const i = group.start + ti}
						{@const state = tileState(t)}
						<li>
							<button
								type="button"
								bind:this={tiles[i]}
								tabindex={i === focusIdx ? 0 : -1}
								aria-pressed={tool === t.name}
								aria-describedby="skill-tool-{i}"
								data-state={state}
								data-draft={g === 0 && ti < 3 ? 'Tile' : undefined}
								class="group/tile flex size-full min-h-[78px] flex-col justify-between gap-3 rounded-xl border border-line bg-surface p-3.5 text-left transition-[background-color,border-color,box-shadow,translate] duration-300 ease-smooth [transition-delay:calc(var(--i)*7ms)] hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_8px_20px_-12px_rgb(var(--shadow-rgb)/calc(var(--shadow-k)*0.35))] hover:[transition-delay:0ms] data-[state=hit]:-translate-y-0.5 data-[state=hit]:border-accent/55 data-[state=hit]:bg-accent/6 data-[state=miss]:border-line-soft data-[state=miss]:bg-transparent data-[state=picked]:border-inverse data-[state=picked]:bg-inverse motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:data-[state=hit]:translate-y-0 max-desk:min-h-[74px] max-desk:p-3"
								style:--i={i}
								onclick={() => pickTool(t.name, i)}
								onfocus={() => (focusIdx = i)}
								onkeydown={onTileKey}
								onpointerenter={(e) => {
									if (e.pointerType === 'mouse') hoverTool = t.name;
								}}
								onpointerleave={() => (hoverTool = null)}
							>
								<span class="flex w-full items-start justify-between gap-3">
									<span
										class="text-[15px] leading-[1.3] font-medium text-ink transition-colors duration-300 group-data-[state=miss]/tile:text-muted group-data-[state=picked]/tile:text-on-inverse max-desk:text-[14px]"
										>{t.name}</span
									>
									<span
										class="flex-none font-mono text-[12px] text-body group-data-[state=picked]/tile:text-on-inverse"
										aria-hidden="true"
										>{t.usedIn.length}<span
											class="text-muted group-data-[state=picked]/tile:text-on-inverse/70"
											>/{total}</span
										></span
									>
								</span>
								<span class="flex w-full gap-1" aria-hidden="true">
									{#each projects as p (p.id)}
										{@const on = t.usedIn.includes(p.id)}
										<span
											title={short(p.id)}
											class={[
												'h-1.5 flex-1 rounded-full transition-[background-color,transform] duration-300 ease-smooth motion-reduce:transition-none',
												!on && 'bg-line group-data-[state=picked]/tile:bg-inverse-line',
												on && project === p.id && 'scale-y-150 bg-accent',
												on && project !== null && project !== p.id && 'bg-dot-fade',
												on && project === null && 'bg-accent'
											]}
										></span>
									{/each}
								</span>
							</button>
							<span class="sr-only" id="skill-tool-{i}">
								{skillsCopy.usedIn(
									projects.filter((p) => t.usedIn.includes(p.id)).map((p) => p.title)
								)}
							</span>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</Section>
