<script lang="ts">
	import { fitSticky } from '$lib/actions/fit-sticky';
	import { swipe } from '$lib/actions/swipe';
	import type { Project } from '$lib/content/types';
	import { pad2 } from '$lib/utils/format';
	import Icon from './Icon.svelte';

	let { project, index, total }: { project: Project; index: number; total: number } = $props();

	// Each card switches its views and shots independently.
	let viewIdx = $state(0);
	let shotIdx = $state<Record<number, number>>({});

	const view = $derived(project.views[viewIdx]);
	const shots = $derived(view.type === 'diagram' ? [] : view.shots);
	const shotI = $derived(shotIdx[viewIdx] ?? 0);
	const shot = $derived(shots[shotI]);

	function pickShot(i: number) {
		shotIdx[viewIdx] = (i + shots.length) % shots.length;
	}

	/** ←/→ on a focused thumbnail (or phone) moves to the previous/next shot and keeps focus with it. */
	function onShotKeys(event: KeyboardEvent) {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		const list = (event.currentTarget as HTMLElement).closest('ul');
		event.preventDefault();
		pickShot(shotI + (event.key === 'ArrowRight' ? 1 : -1));
		list?.querySelectorAll<HTMLButtonElement>('button')[shotI]?.focus();
	}

	/** Touch swipe on the screenshot (browser or phones) steps through the shots. */
	const swipeShots = $derived({
		onSwipe: (dir: 1 | -1) => pickShot(shotI + dir),
		enabled: shots.length > 1
	});

	const alt = (caption: string) => `${project.title} — ${caption}`;
	const isGithub = (href: string) => /^https?:\/\/(www\.)?github\.com\//.test(href);
</script>

<article class="deck-card" aria-labelledby="{project.id}-title" style:--i={index} use:fitSticky>
	<div class="head">
		<p class="meta mono">
			<span><span class="idx">{pad2(index + 1)}</span> / {pad2(total)}</span>
			<span class="kind">{project.kind}</span>
		</p>
		<ul class="badges" aria-label="Status">
			{#each project.badges as b (b.label)}
				<li class="badge mono {b.tone}">
					{#if b.tone === 'private'}
						<Icon name="lock" size={11} strokeWidth={2} />
					{:else}
						<span class="dot" aria-hidden="true"></span>
					{/if}
					{b.label}
				</li>
			{/each}
		</ul>
	</div>

	<div class="body">
		<figure class="media">
			{#if project.views.length > 1}
				<div class="seg" role="group" aria-label="{project.title} views">
					{#each project.views as v, i (v.label)}
						<button type="button" aria-pressed={viewIdx === i} onclick={() => (viewIdx = i)}>
							{v.label}
						</button>
					{/each}
				</div>
			{/if}

			{#if view.type === 'browser'}
				{@const first = view.shots[0]}
				<div class="browser-wrap" use:swipe={swipeShots}>
					<div
						class="browser"
						style:aspect-ratio="{first.width} / {first.height + 36}"
						style:background={view.background}
					>
						<div class="chrome" aria-hidden="true">
							<span class="light"></span><span class="light"></span><span class="light"></span>
							<span class="address mono"
								><span class="adot"></span>{view.addressBar}
								· {shot.label}</span
							>
						</div>
						<div class="screen">
							<img
								src={shot.src}
								alt={alt(shot.caption)}
								width={shot.width}
								height={shot.height}
								loading="lazy"
								decoding="async"
							>
						</div>
					</div>
					{#if view.phoneOverlay}
						<span class="overlay">
							<img
								src={view.phoneOverlay.src}
								alt={view.phoneOverlay.alt}
								width={view.phoneOverlay.width}
								height={view.phoneOverlay.height}
								loading="lazy"
								decoding="async"
							>
						</span>
					{/if}
				</div>
				<p class="caption mono">
					<span>{shot.caption}</span
					><span class="count">{pad2(shotI + 1)} / {pad2(shots.length)}</span>
				</p>
				{#if shots.length > 1}
					<ul
						class="thumbs"
						style:--cols={Math.max(3, shots.length)}
						aria-label="{project.title} screenshots"
					>
						{#each shots as s, i (s.src)}
							<li>
								<button
									type="button"
									class="thumb"
									class:on={shotI === i}
									aria-pressed={shotI === i}
									aria-label="Show the {s.label} screenshot"
									style:background={view.background}
									onclick={() => pickShot(i)}
									onkeydown={onShotKeys}
								>
									<img
										src={s.src}
										alt=""
										width={s.width}
										height={s.height}
										loading="lazy"
										decoding="async"
									>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			{:else if view.type === 'phones'}
				<ul class="phones" aria-label="{project.title} screens" use:swipe={swipeShots}>
					{#each shots as s, i (s.src)}
						<li>
							<button
								type="button"
								class="phone"
								class:on={shotI === i}
								aria-pressed={shotI === i}
								aria-label="Show the {s.label} screen"
								onclick={() => pickShot(i)}
								onkeydown={onShotKeys}
							>
								<img
									src={s.src}
									alt={alt(s.caption)}
									width={s.width}
									height={s.height}
									loading="lazy"
									decoding="async"
								>
							</button>
						</li>
					{/each}
				</ul>
				<p class="caption mono">
					<span>{shot.caption}</span
					><span class="count">{pad2(shotI + 1)} / {pad2(shots.length)}</span>
				</p>
			{:else}
				<div class="diagram mono" role="img" aria-label={view.ariaLabel}>
					{#each view.rows as row, r (r)}
						{#if r > 0}
							<span class="link" aria-hidden="true"></span>
						{/if}
						<div class="row" style:--cols={row.length}>
							{#each row as box (box.label)}
								<span class="box {box.kind}">{box.label}</span>
							{/each}
						</div>
					{/each}
				</div>
				<p class="caption mono"><span>{view.caption}</span></p>
			{/if}
		</figure>

		<div class="text">
			<h3 id="{project.id}-title">{project.title}</h3>
			<p class="desc">{project.description}</p>
			<ul class="highlights">
				{#each project.highlights as h (h)}
					<li><span class="dash" aria-hidden="true">–</span><span>{h}</span></li>
				{/each}
			</ul>
			<ul class="stack mono" aria-label="Tech stack">
				{#each project.stack as t (t)}
					<li>{t}</li>
				{/each}
			</ul>
			{#if project.links.length}
				<div class="links">
					{#each project.links as l (l.href)}
						<a
							href={l.href}
							target="_blank"
							rel="noopener noreferrer"
							class={l.variant === 'primary' ? 'btn-primary primary' : 'btn-ghost ghost'}
						>
							{#if l.variant === 'ghost' && isGithub(l.href)}
								<Icon name="github" size={16} />
							{/if}
							<span>{l.label}</span>
							{#if l.variant === 'primary'}
								<Icon name="arrow-up-right" size={14} strokeWidth={2} />
							{/if}
							<span class="sr-only"> — {project.title} (opens in a new tab)</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</article>

<style>
	/* Sticky offset: a stair-step under the header (--deck-top), or — for a card taller than the
	   viewport — bottom edge 24px above the fold (see fit-sticky.ts). svh = small viewport, so the
	   offset holds still while mobile toolbars collapse. */
	.deck-card {
		--deck-top: calc(88px + var(--i, 0) * 16px);
		position: sticky;
		top: min(
			var(--deck-top),
			calc(100svh - var(--card-h, 0px) - 24px - env(safe-area-inset-bottom, 0px))
		);
		transform-origin: 50% 0;
		will-change: transform;
		display: flex;
		flex-direction: column;
		gap: 22px;
		padding: clamp(20px, 2.6vw, 32px);
		background: var(--color-surface);
		border: 1px solid var(--color-line);
		border-radius: 28px;
		box-shadow:
			0 1px 2px rgb(var(--shadow-rgb) / calc(0.04 * var(--shadow-k))),
			0 -18px 48px -32px rgb(var(--shadow-rgb) / calc(0.28 * var(--shadow-k))),
			0 30px 60px -40px rgb(var(--shadow-rgb) / calc(0.35 * var(--shadow-k)));
	}

	/* Header row */
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 10px 20px;
	}
	.meta {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 6px 14px;
		font-size: 12px;
		letter-spacing: 0.06em;
		color: var(--color-muted);
	}
	.idx {
		font-size: 15px;
		font-weight: 500;
		color: var(--color-accent-700);
	}
	.kind {
		color: var(--color-accent-700);
	}
	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 3px 10px;
		border: 1px solid var(--color-line);
		border-radius: 999px;
		background: var(--color-surface);
		font-size: 11px;
		line-height: 1.5;
		color: var(--color-body);
	}
	.badge .dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-line-strong);
	}
	.badge.live {
		background: rgba(249, 115, 22, 0.12);
		border-color: rgba(249, 115, 22, 0.25);
		color: var(--color-accent-800);
	}
	.badge.live .dot {
		background: var(--color-accent);
	}
	.badge.neutral .dot {
		background: var(--color-faint);
	}

	/* Body: media ~55% + text */
	.body {
		display: flex;
		flex-wrap: wrap;
		gap: 28px 48px;
		align-items: flex-start;
	}
	.media {
		flex: 1.35 1 440px;
		min-width: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.text {
		flex: 1 1 340px;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	/* Segmented control */
	.seg {
		display: flex;
		gap: 6px;
		padding: 4px;
		align-self: flex-start;
		background: var(--color-chip);
		border-radius: 999px;
	}
	.seg button {
		min-height: 36px;
		padding: 0 16px;
		border: 0;
		border-radius: 999px;
		background: transparent;
		font-size: 13px;
		font-weight: 500;
		color: var(--color-body);
		transition:
			background-color 0.2s ease,
			box-shadow 0.2s ease,
			color 0.2s ease;
	}
	.seg button[aria-pressed="true"] {
		background: var(--color-surface);
		color: var(--color-ink);
		box-shadow:
			0 1px 2px rgb(var(--shadow-rgb) / calc(0.08 * var(--shadow-k))),
			0 2px 8px -4px rgb(var(--shadow-rgb) / calc(0.15 * var(--shadow-k)));
	}

	/* Browser view */
	.browser-wrap {
		position: relative;
	}
	.browser {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border: 1px solid var(--color-line);
		border-radius: 16px;
		box-shadow: 0 24px 48px -30px rgb(var(--shadow-rgb) / calc(0.3 * var(--shadow-k)));
	}
	.chrome {
		flex: 0 0 auto;
		height: 36px;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0 14px;
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-line-soft);
	}
	.light {
		flex: 0 0 auto;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--color-line);
	}
	.address {
		margin-left: 12px;
		flex: 1;
		min-width: 0;
		max-width: 300px;
		height: 22px;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 10px;
		overflow: hidden;
		border-radius: 6px;
		/* mist, not chip: muted 10px text on chip would be 4.44:1 (under 4.5). */
		background: var(--color-mist);
		font-size: 10px;
		white-space: nowrap;
		color: var(--color-muted);
	}
	.adot {
		flex: 0 0 auto;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-accent);
	}
	.screen {
		position: relative;
		flex: 1;
		min-height: 0;
	}
	.screen img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
	}
	.overlay {
		position: absolute;
		right: 14px;
		bottom: 12px;
		width: 22%;
		aspect-ratio: 780 / 1688;
		padding: 4px;
		background: var(--color-inverse);
		border-radius: 20px;
		box-shadow: 0 18px 32px -14px rgb(var(--shadow-rgb) / calc(0.5 * var(--shadow-k)));
	}
	.overlay img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
		border-radius: 16px;
	}
	.caption {
		margin: 0;
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font-size: 12px;
		line-height: 1.5;
		color: var(--color-muted);
	}
	.count {
		flex: 0 0 auto;
	}
	.thumbs {
		display: grid;
		grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.thumb {
		position: relative;
		display: block;
		width: 100%;
		aspect-ratio: 16 / 10;
		padding: 0;
		overflow: hidden;
		border: 2px solid transparent;
		border-radius: 8px;
		opacity: 0.6;
		transition:
			opacity 0.2s ease,
			border-color 0.2s ease;
	}
	.thumb.on {
		opacity: 1;
	}
	@media (hover: hover) {
		.thumb:hover {
			opacity: 1;
		}
	}
	.thumb.on {
		border-color: var(--color-accent);
	}
	.thumb img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
	}

	/* Phones view */
	.phones {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4%;
		margin: 0;
		padding: 28px 16px;
		aspect-ratio: 16 / 11;
		overflow: hidden;
		list-style: none;
		border: 1px solid var(--color-line);
		border-radius: 16px;
		background-color: var(--color-surface);
		background-image: radial-gradient(var(--color-line) 1px, transparent 1.3px);
		background-size: 18px 18px;
	}
	.phones li {
		flex: 0 0 auto;
		width: 25%;
	}
	.phone {
		display: block;
		width: 100%;
		aspect-ratio: 9 / 19;
		padding: 5px;
		border: 0;
		border-radius: 22px;
		background: var(--color-inverse);
		opacity: 0.7;
		transform: scale(0.94);
		box-shadow: 0 10px 20px -14px rgb(var(--shadow-rgb) / calc(0.3 * var(--shadow-k)));
		transition:
			transform 0.45s cubic-bezier(0.2, 0.7, 0.2, 1),
			opacity 0.3s ease,
			box-shadow 0.3s ease;
	}
	@media (hover: hover) {
		.phone:hover {
			opacity: 1;
		}
	}
	.phone.on {
		opacity: 1;
		transform: translateY(-6px) scale(1.06);
		box-shadow: 0 26px 40px -18px rgb(var(--shadow-rgb) / calc(0.45 * var(--shadow-k)));
	}
	.phone img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
		border-radius: 17px;
	}
	.phone:focus-visible {
		border-radius: 22px;
	}

	/* Diagram view */
	.diagram {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: 300px;
		padding: clamp(20px, 3vw, 36px);
		background-color: var(--color-mist);
		background-image: radial-gradient(var(--color-line) 1px, transparent 1.3px);
		background-size: 18px 18px;
		border-radius: 16px;
		font-size: 13px;
		color: var(--color-strong);
	}
	.link {
		display: block;
		width: 1px;
		height: 18px;
		margin: 0 auto;
		background: var(--color-line-strong);
	}
	.row {
		display: grid;
		grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
		gap: 10px;
	}
	.box {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 6px 10px;
		background: var(--color-surface);
		border: 1px solid var(--color-line);
		border-radius: 10px;
		line-height: 1.35;
		text-align: center;
	}
	.box.key {
		border: 1.5px solid var(--color-accent);
		font-weight: 600;
		color: var(--color-ink);
	}
	.box.soft {
		border: 1px dashed var(--color-line-strong);
	}
	.box.data {
		background: var(--color-inverse);
		border-color: var(--color-inverse);
		font-weight: 500;
		color: var(--color-on-inverse);
	}

	/* Text column */
	h3 {
		margin: 0;
		font-size: clamp(28px, 3vw, 36px);
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: -0.03em;
		color: var(--color-ink);
	}
	.desc {
		margin: 0;
		font-size: 16px;
		line-height: 1.65;
		color: var(--color-strong);
		text-wrap: pretty;
	}
	.highlights {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 15px;
		line-height: 1.55;
	}
	.highlights li {
		display: flex;
		gap: 12px;
	}
	.dash {
		color: var(--color-accent-700);
	}
	.stack {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 12px;
		color: var(--color-strong);
	}
	.stack li {
		padding: 4px 10px;
		background: var(--color-chip);
		border-radius: 6px;
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
		margin-top: 4px;
	}
	.links a {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 0 18px;
		border-radius: 999px;
		font-size: 14px;
		font-weight: 500;
	}
	.primary {
		background: var(--color-inverse);
		color: var(--color-on-inverse);
	}
	.ghost {
		background: var(--color-surface);
		border: 1px solid var(--color-line-strong);
		color: var(--color-strong);
	}

	@media (max-width: 820px) {
		/* Still a sticky deck on phones/tablets — just a tighter stair-step under the 64px bar. */
		.deck-card {
			--deck-top: calc(76px + var(--i, 0) * 10px);
			border-radius: 22px;
		}
		.media,
		.text {
			flex-basis: 100%;
		}
		.thumbs {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
		.phones {
			padding: 20px 10px;
		}
		.phone {
			border-radius: 16px;
			padding: 3px;
		}
		.phone img {
			border-radius: 13px;
		}
		.overlay {
			border-radius: 14px;
			padding: 3px;
		}
		.overlay img {
			border-radius: 11px;
		}
		.row {
			gap: 6px;
		}
		.box {
			padding: 6px;
			font-size: 11px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.deck-card {
			position: relative !important;
			top: auto !important;
		}
	}
</style>
