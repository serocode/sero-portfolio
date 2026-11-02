<script lang="ts">
	import Logo from '$lib/brand/Logo.svelte';
	import { site } from '$lib/content/site';
	import { prefersReducedMotion } from '$lib/utils/format';
	import Icon from './Icon.svelte';
	import SocialLinks from './SocialLinks.svelte';

	const year = new Date().getFullYear();

	/** True for one "launch" animation after a click/tap (the arrow shoots up and comes back). */
	let launching = $state(false);
	let launchTimer = 0;

	/**
	 * Without JS this is a plain `#top` link. With JS: play the launch, smooth-scroll to the top
	 * (instant with reduced motion), and hand keyboard focus to the first control in the header,
	 * so a keyboard user carries on from the top instead of from the footer.
	 */
	function backToTop(event: MouseEvent) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		const reduce = prefersReducedMotion();
		if (!reduce) {
			launching = false;
			clearTimeout(launchTimer);
			// Restart the animation on repeated clicks.
			requestAnimationFrame(() => {
				launching = true;
				launchTimer = window.setTimeout(() => (launching = false), 700);
			});
		}
		window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
		history.replaceState(null, '', location.pathname + location.search);
		document.querySelector<HTMLElement>('.site-header a')?.focus({ preventScroll: true });
	}
</script>

<footer>
	<div class="wrap row">
		<p class="copy"><Logo size={24} decorative /><span>{site.name} · © {year}</span></p>
		<div class="right">
			<SocialLinks size={18} tone="muted" />
			<span class="divider" aria-hidden="true"></span>
			<a href="#top" class="top" class:launching onclick={backToTop}>
				<span>Back to top</span>
				<span class="badge" aria-hidden="true">
					<span class="arrow"><Icon name="arrow-up" size={14} strokeWidth={2.2} /></span>
				</span>
			</a>
		</div>
	</div>
</footer>

<style>
	footer {
		border-top: 1px solid var(--color-line);
		/* Last snap point: the page's bottom edge, so the footer is reachable under mandatory snapping. */
		scroll-snap-align: end;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px 32px;
		padding-block: 24px;
		font-size: 13px;
		color: var(--color-muted);
	}
	p {
		margin: 0;
	}
	.copy {
		display: inline-flex;
		align-items: center;
		gap: 10px;
	}
	.right {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
	}
	.divider {
		width: 1px;
		height: 18px;
		margin: 0 10px;
		background: var(--color-line);
	}

	/* ── Back to top: pill + round arrow badge ── */
	.top {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		min-height: 44px;
		padding: 4px 4px 4px 16px;
		border: 1px solid var(--color-line);
		border-radius: 999px;
		background: var(--color-surface);
		font-weight: 500;
		color: var(--color-strong);
		transition:
			border-color 0.2s ease,
			color 0.2s ease,
			transform 0.2s ease,
			box-shadow 0.2s ease;
		-webkit-tap-highlight-color: transparent;
	}
	.top:focus-visible {
		border-radius: 999px;
	}
	.badge {
		position: relative;
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		overflow: hidden;
		border-radius: 50%;
		background: var(--color-inverse);
		color: var(--color-on-inverse);
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
	}
	.arrow {
		display: flex;
	}

	/* Hover (mouse) and keyboard focus: lift, accent badge, arrow loops upward. */
	@media (hover: hover) {
		.top:hover {
			border-color: var(--color-ink);
			color: var(--color-ink);
			transform: translateY(-2px);
			box-shadow: 0 10px 24px -14px rgb(var(--shadow-rgb) / calc(0.35 * var(--shadow-k)));
		}
		.top:hover .badge {
			background: var(--color-accent);
			color: var(--color-on-accent);
		}
		.top:hover .arrow {
			animation: loop 0.9s cubic-bezier(0.5, 0, 0.2, 1) infinite;
		}
	}
	.top:focus-visible {
		border-color: var(--color-ink);
		color: var(--color-ink);
	}
	.top:focus-visible .badge {
		background: var(--color-accent);
		color: var(--color-on-accent);
	}
	.top:focus-visible .arrow {
		animation: loop 0.9s cubic-bezier(0.5, 0, 0.2, 1) infinite;
	}

	/* Press + launch (works for touch too, where there's no hover). */
	.top:active {
		transform: scale(0.97);
	}
	.top.launching .badge {
		background: var(--color-accent);
		color: var(--color-on-accent);
	}
	.top.launching .arrow {
		animation: launch 0.7s cubic-bezier(0.4, 0, 0.2, 1) both;
	}

	@keyframes loop {
		0% {
			transform: translateY(0);
		}
		45% {
			transform: translateY(-180%);
		}
		46% {
			transform: translateY(180%);
		}
		100% {
			transform: translateY(0);
		}
	}
	@keyframes launch {
		0% {
			transform: translateY(0);
		}
		15% {
			transform: translateY(3px);
		}
		50% {
			transform: translateY(-220%);
			opacity: 1;
		}
		51% {
			transform: translateY(220%);
			opacity: 0;
		}
		100% {
			transform: translateY(0);
			opacity: 1;
		}
	}

	/* Phones/tablets: one centred column — socials, back to top, then the copyright line. */
	@media (max-width: 820px) {
		.row {
			flex-direction: column;
			justify-content: center;
			gap: 14px;
			padding-block: 28px calc(28px + env(safe-area-inset-bottom, 0px));
			text-align: center;
		}
		.right {
			flex-direction: column;
			justify-content: center;
			gap: 12px;
		}
		.divider {
			display: none;
		}
		.copy {
			order: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.top,
		.top:hover {
			transform: none;
		}
		.top .arrow,
		.top:hover .arrow,
		.top:focus-visible .arrow,
		.top.launching .arrow {
			animation: none;
		}
	}
</style>
