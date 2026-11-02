<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import Section from '$lib/components/Section.svelte';
	import { approach, approachIntro } from '$lib/content/approach';
	import { pad2, prefersReducedMotion } from '$lib/utils/format';

	const total = pad2(approach.length);

	let selected = $state(0);
	/** Hover preview; falls back to the selected item when the pointer leaves the list. */
	let preview = $state<number | null>(null);
	const shown = $derived(preview ?? selected);
	const cur = $derived(approach[shown]);

	let reduce = $state(false);
	onMount(() => {
		reduce = prefersReducedMotion();
	});

	let tabs: HTMLButtonElement[] = $state([]);

	function select(i: number) {
		selected = (i + approach.length) % approach.length;
		preview = null;
	}

	function onKeydown(event: KeyboardEvent) {
		const keys: Record<string, number> = {
			ArrowDown: selected + 1,
			ArrowRight: selected + 1,
			ArrowUp: selected - 1,
			ArrowLeft: selected - 1,
			Home: 0,
			End: approach.length - 1
		};
		if (!(event.key in keys)) return;
		event.preventDefault();
		select(keys[event.key]);
		tabs[selected]?.focus();
	}
</script>

<Section
	id="approach"
	n="02"
	label="Approach"
	heading={approachIntro.heading}
	sub={approachIntro.sub}
>
	<div class="layout">
		<div
			class="list"
			role="tablist"
			aria-label="Approach topics"
			aria-orientation="vertical"
			tabindex="-1"
			onkeydown={onKeydown}
			onmouseleave={() => (preview = null)}
		>
			{#each approach as item, i (item.n)}
				<button
					bind:this={tabs[i]}
					type="button"
					role="tab"
					id="ap-tab-{i}"
					class="item"
					class:on={shown === i}
					aria-selected={shown === i}
					aria-controls="ap-panel"
					tabindex={selected === i ? 0 : -1}
					onclick={() => select(i)}
					onfocus={() => select(i)}
					onmouseenter={() => (preview = i)}
				>
					<span class="bar" aria-hidden="true"></span>
					<span class="n mono">{item.n}</span>
					<span class="labels">
						<span class="label">{item.label}</span>
						<span class="from mono">{item.from}</span>
					</span>
					<span class="arrow" aria-hidden="true"
						><Icon name="arrow-right" size={18} strokeWidth={2} /></span
					>
				</button>
			{/each}
		</div>

		<!-- biome-ignore lint/a11y/noNoninteractiveTabindex: WAI-ARIA tabs pattern — the tabpanel is focusable -->
		<div id="ap-panel" class="panel" role="tabpanel" aria-labelledby="ap-tab-{shown}" tabindex="0">
			<span class="big" aria-hidden="true" data-n={cur.n}></span>
			<div class="top">
				<p class="count mono"><span class="n">{cur.n}</span> / {total} · {cur.from}</p>
				<div class="navs">
					<button
						type="button"
						class="ap-nav"
						aria-label="Previous topic"
						onclick={() => select(selected - 1)}
					>
						<Icon name="arrow-left" size={16} strokeWidth={2} />
					</button>
					<button
						type="button"
						class="ap-nav"
						aria-label="Next topic"
						onclick={() => select(selected + 1)}
					>
						<Icon name="arrow-right" size={16} strokeWidth={2} />
					</button>
				</div>
			</div>
			{#key shown}
				<div class="content" in:fly={{ y: 8, duration: reduce ? 0 : 180 }}>
					<h3>{cur.title}</h3>
					<p class="body">{cur.body}</p>
					<ul class="tags mono" aria-label="Related">
						{#each cur.tags as tag (tag)}
							<li>{tag}</li>
						{/each}
					</ul>
				</div>
			{/key}
			<div class="segs" aria-hidden="true">
				{#each approach as item, i (item.n)}
					<span class:done={i <= shown}></span>
				{/each}
			</div>
		</div>
	</div>
</Section>

<style>
	.layout {
		display: grid;
		grid-template-columns: 264px minmax(0, 1fr);
		gap: 24px 40px;
		align-items: stretch;
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.item {
		position: relative;
		width: 100%;
		min-height: 76px;
		display: flex;
		align-items: center;
		gap: 18px;
		padding: 16px 18px 16px 24px;
		background: transparent;
		border: 0;
		border-radius: 14px;
		text-align: left;
		color: var(--color-body);
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
	}
	.item.on {
		background: var(--color-mist);
		color: var(--color-ink);
	}
	.bar {
		position: absolute;
		left: 0;
		top: 18px;
		bottom: 18px;
		width: 3px;
		border-radius: 3px;
		background: var(--color-accent);
		opacity: 0;
		transition: opacity 0.25s ease;
	}
	.on .bar {
		opacity: 1;
	}
	.item .n {
		font-size: 12px;
		color: var(--color-accent-700);
	}
	.labels {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.label {
		font-size: 17px;
		font-weight: 600;
		line-height: 1.3;
		letter-spacing: -0.01em;
	}
	.from {
		font-size: 11px;
		line-height: 1.4;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-muted);
	}
	.arrow {
		display: flex;
		opacity: 0.2;
		transform: translateX(-6px);
		transition:
			opacity 0.25s ease,
			transform 0.25s ease;
	}
	.on .arrow {
		opacity: 1;
		transform: none;
	}

	.panel {
		position: relative;
		overflow: hidden;
		min-height: 380px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: clamp(28px, 4vw, 48px);
		background: var(--color-mist);
		border-radius: 24px;
	}
	.panel:focus-visible {
		outline-offset: 4px;
		border-radius: 24px;
	}
	/* Decorative numeral drawn from a pseudo-element so it isn't read or contrast-checked as text. */
	.big::before {
		content: attr(data-n);
	}
	.big {
		position: absolute;
		right: -8px;
		bottom: -0.26em;
		font-size: clamp(120px, 16vw, 190px);
		font-weight: 800;
		line-height: 1;
		letter-spacing: -0.06em;
		color: var(--color-numeral);
		pointer-events: none;
	}
	.top {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}
	.count {
		margin: 0;
		font-size: 12px;
		color: var(--color-muted);
	}
	.count .n {
		color: var(--color-accent-700);
	}
	.navs {
		display: flex;
		gap: 8px;
	}
	.ap-nav {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-surface);
		border: 1px solid var(--color-line);
		border-radius: 50%;
		color: var(--color-strong);
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease,
			color 0.15s ease;
	}
	/* hover: hover — a tap on a touch screen shouldn't leave the button stuck in its hover state. */
	@media (hover: hover) {
		.ap-nav:hover {
			background: var(--color-inverse);
			border-color: var(--color-inverse);
			color: var(--color-on-inverse);
		}
	}
	.ap-nav:focus-visible {
		border-radius: 50%;
	}
	.content {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	h3 {
		margin: 8px 0 0;
		max-width: 520px;
		font-size: clamp(26px, 3vw, 34px);
		font-weight: 700;
		line-height: 1.12;
		letter-spacing: -0.03em;
		color: var(--color-ink);
		text-wrap: balance;
	}
	.body {
		margin: 0;
		max-width: 400px;
		font-size: 17px;
		line-height: 1.7;
		color: var(--color-strong);
		text-wrap: pretty;
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 12px;
		color: var(--color-strong);
	}
	.tags li {
		padding: 4px 10px;
		background: var(--color-surface);
		border: 1px solid var(--color-line);
		border-radius: 6px;
	}
	.segs {
		position: relative;
		margin-top: auto;
		padding-top: 12px;
		display: flex;
		gap: 6px;
		max-width: 240px;
	}
	.segs span {
		flex: 1;
		height: 3px;
		border-radius: 3px;
		background: var(--color-line);
		transition: background-color 0.25s ease;
	}
	.segs span.done {
		background: var(--color-accent);
	}

	@media (max-width: 820px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
		/* Tabs wrap into a grid (2 columns on phones, 4 on tablets) instead of a sideways
		   scroller, so the whole section sits inside the viewport. */
		.list {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(min(100%, 148px), 1fr));
			gap: 8px;
		}
		.item {
			min-height: 52px;
			gap: 10px;
			padding: 10px 14px;
			border: 1px solid var(--color-line);
			border-radius: 14px;
		}
		.item.on {
			border-color: var(--color-ink);
		}
		.bar,
		.from,
		.arrow {
			display: none;
		}
		.label {
			font-size: 15px;
			line-height: 1.25;
		}
		.big {
			font-size: 120px;
		}
	}
</style>
