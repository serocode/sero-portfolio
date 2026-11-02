<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { ActiveSection } from '$lib/actions/active-section.svelte';
	import Logo from '$lib/brand/Logo.svelte';
	import { nav, site } from '$lib/content/site';
	import { prefersReducedMotion } from '$lib/utils/format';
	import Icon from './Icon.svelte';
	import MaybeLink from './MaybeLink.svelte';
	import SocialLinks from './SocialLinks.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	const active = new ActiveSection(nav.map((item) => item.id));
	const resumeSoon = 'Résumé PDF coming soon';

	let open = $state(false);
	let menuButton = $state<HTMLButtonElement>();
	let panel = $state<HTMLElement>();

	onMount(() => {
		const stop = active.observe();
		// Close the menu if the viewport grows past the breakpoint while it's open.
		const wide = window.matchMedia('(min-width: 821px)');
		const onWide = () => {
			if (wide.matches) open = false;
		};
		wide.addEventListener('change', onWide);
		return () => {
			stop();
			wide.removeEventListener('change', onWide);
		};
	});

	// While open: lock page scroll and move focus into the panel.
	$effect(() => {
		if (!open) return;
		const root = document.documentElement;
		const previous = root.style.overflow;
		root.style.overflow = 'hidden';
		tick().then(() => panel?.querySelector<HTMLElement>('a, button')?.focus());
		return () => {
			root.style.overflow = previous;
		};
	});

	function closeMenu() {
		open = false;
		menuButton?.focus();
	}

	/** Mobile menu link: close first (so the scroll lock is released), then scroll to the section. */
	async function goTo(event: MouseEvent, id: string) {
		event.preventDefault();
		open = false;
		await tick();
		document
			.getElementById(id)
			?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
		history.pushState(null, '', `#${id}`);
		menuButton?.focus({ preventScroll: true });
	}

	function onKeydown(event: KeyboardEvent) {
		if (!open) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			closeMenu();
			return;
		}
		if (event.key !== 'Tab' || !panel || !menuButton) return;
		// Focus trap: the menu button + everything inside the panel.
		const focusables = [
			menuButton,
			...panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
		];
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

<header class="site-header" class:menu-open={open}>
	<div class="bar wrap">
		<a
			href="#top"
			class="brand"
			aria-label="{site.name} — back to top"
			onclick={() => (open = false)}
		>
			<Logo size={34} decorative />
			<span class="name">{site.name}</span>
		</a>

		<nav class="desktop" aria-label="Primary">
			<ol>
				{#each nav as item (item.id)}
					<li>
						<a
							href="#{item.id}"
							class="navlink"
							class:on={active.current === item.id}
							aria-current={active.current === item.id ? 'location' : undefined}
						>
							<span class="n mono">{item.n}</span>
							<span>{item.label}</span>
							<span class="underline" aria-hidden="true"></span>
						</a>
					</li>
				{/each}
			</ol>
			<div class="actions">
				<ThemeToggle />
				<MaybeLink href={site.resume} class="btn-ghost resume" external comingSoon={resumeSoon}>
					<Icon name="download" size={14} strokeWidth={2} />
					<span>Résumé</span>
				</MaybeLink>
			</div>
		</nav>

		<div class="mobile-actions">
			<ThemeToggle />
			<button
				bind:this={menuButton}
				type="button"
				class="menu-btn"
				aria-label={open ? 'Close menu' : 'Open menu'}
				aria-expanded={open}
				aria-controls="mobile-menu"
				onclick={() => (open = !open)}
			>
				<Icon name={open ? 'close' : 'menu'} size={20} strokeWidth={2} />
			</button>
		</div>
	</div>
</header>

<!--
  The panel is a sibling of <header>, not a child: the header's backdrop-filter makes it the
  containing block for position:fixed descendants, which squeezed the panel into the 64px bar.
-->
<nav id="mobile-menu" class="panel" aria-label="Primary (menu)" bind:this={panel} hidden={!open}>
	<ol>
		{#each nav as item (item.id)}
			<li>
				<a
					href="#{item.id}"
					class:on={active.current === item.id}
					aria-current={active.current === item.id ? 'location' : undefined}
					onclick={(e) => goTo(e, item.id)}
				>
					<span class="n mono">{item.n}</span>
					<span>{item.label}</span>
				</a>
			</li>
		{/each}
	</ol>
	<MaybeLink href={site.resume} class="btn-primary resume-full" external comingSoon={resumeSoon}>
		<Icon name="download" size={15} strokeWidth={2} />
		<span>Download résumé</span>
	</MaybeLink>
	<div class="panel-foot">
		<p class="mono">Philippines</p>
		<SocialLinks />
	</div>
</nav>

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 20;
		background: color-mix(in srgb, var(--color-paper) 86%, transparent);
		backdrop-filter: saturate(1.4) blur(12px);
		-webkit-backdrop-filter: saturate(1.4) blur(12px);
		border-bottom: 1px solid var(--color-line-soft);
	}
	.bar {
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 44px;
		color: var(--color-ink);
	}
	.name {
		font-size: 15px;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	/* Desktop nav */
	.desktop {
		display: flex;
		align-items: center;
		gap: 32px;
	}
	.desktop ol {
		display: flex;
		align-items: center;
		gap: 28px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.navlink {
		position: relative;
		display: flex;
		align-items: baseline;
		gap: 6px;
		padding: 12px 0;
		font-size: 14px;
		line-height: 1.4;
		color: var(--color-body);
		transition: color 0.15s ease;
	}
	.navlink:hover,
	.navlink.on {
		color: var(--color-ink);
	}
	.navlink .n {
		font-size: 11px;
		color: var(--color-accent-700);
	}
	.underline {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 2px;
		height: 2px;
		border-radius: 2px;
		background: var(--color-accent);
		opacity: 0;
		transition: opacity 0.2s ease;
	}
	.navlink.on .underline {
		opacity: 1;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.desktop :global(.resume) {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 0 16px;
		background: var(--color-surface);
		border: 1px solid var(--color-line-strong);
		border-radius: 999px;
		font-size: 13px;
		font-weight: 500;
		color: var(--color-strong);
	}

	/* Theme toggle + menu button + panel (≤820px) */
	.mobile-actions {
		display: none;
		align-items: center;
		gap: 10px;
	}
	.menu-btn {
		display: inline-flex;
		width: 44px;
		height: 44px;
		align-items: center;
		justify-content: center;
		background: var(--color-surface);
		border: 1px solid var(--color-line);
		border-radius: 12px;
		color: var(--color-ink);
	}
	.site-header.menu-open {
		background: var(--color-surface);
	}
	/* Fills the viewport under the 64px bar; scrolls on its own (short landscape screens) without
	   chaining the scroll to the page behind, and clears the home indicator. */
	.panel {
		position: fixed;
		z-index: 19;
		top: 64px;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		padding: 8px clamp(20px, 5vw, 48px) calc(28px + env(safe-area-inset-bottom, 0px));
		overflow-y: auto;
		overscroll-behavior: contain;
		background: var(--color-surface);
		animation: menu-in 0.22s cubic-bezier(0.2, 0.7, 0.2, 1) both;
	}
	.panel li {
		animation: menu-item-in 0.32s cubic-bezier(0.2, 0.7, 0.2, 1) both;
	}
	.panel li:nth-child(2) {
		animation-delay: 0.03s;
	}
	.panel li:nth-child(3) {
		animation-delay: 0.06s;
	}
	.panel li:nth-child(4) {
		animation-delay: 0.09s;
	}
	.panel li:nth-child(5) {
		animation-delay: 0.12s;
	}
	@keyframes menu-in {
		from {
			opacity: 0;
		}
	}
	@keyframes menu-item-in {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
	}
	.panel[hidden] {
		display: none;
	}
	.panel ol {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.panel ol a {
		display: flex;
		align-items: baseline;
		gap: 14px;
		min-height: 60px;
		padding: 16px 0;
		border-bottom: 1px solid var(--color-line-soft);
		font-size: 26px;
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: -0.02em;
		color: var(--color-body);
	}
	.panel ol a.on {
		color: var(--color-ink);
	}
	.panel .n {
		font-size: 12px;
		font-weight: 400;
		letter-spacing: 0;
		color: var(--color-accent-700);
	}
	.panel :global(.resume-full) {
		margin-top: 28px;
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-height: 52px;
		background: var(--color-inverse);
		border: 0;
		border-radius: 999px;
		font-size: 15px;
		font-weight: 500;
		color: var(--color-on-inverse);
	}
	.panel-foot {
		margin-top: auto;
		padding-top: 28px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.panel-foot p {
		margin: 0;
		font-size: 12px;
		color: var(--color-muted);
	}

	@media (prefers-reduced-motion: reduce) {
		.panel,
		.panel li {
			animation: none;
		}
	}

	@media (max-width: 820px) {
		.desktop {
			display: none;
		}
		.mobile-actions {
			display: flex;
		}
		.bar {
			padding-inline: 20px;
		}
	}
</style>
