<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { ActiveSection } from '$lib/actions/active-section.svelte';
	import Logo from '$lib/brand/Logo.svelte';
	import { nav, site } from '$lib/content/site';
	import { btnGhostHover, btnPrimaryHover, wrap } from '$lib/ui';
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

<header
	class={[
		'site-header sticky top-0 z-20 border-b border-line-soft [backdrop-filter:saturate(1.4)_blur(12px)]',
		open ? 'bg-surface' : 'bg-[color-mix(in_srgb,var(--color-paper)_86%,transparent)]'
	]}
>
	<div class="{wrap} flex h-16 items-center justify-between gap-6 max-desk:px-5">
		<a
			href="#top"
			class="brand flex min-h-11 items-center gap-3 text-ink"
			aria-label="{site.name} — back to top"
			onclick={() => (open = false)}
		>
			<Logo size={34} decorative />
			<span class="text-[15px] font-semibold tracking-[-0.01em]">{site.name}</span>
		</a>

		<nav class="flex items-center gap-8 max-desk:hidden" aria-label="Primary">
			<ol class="flex items-center gap-7">
				{#each nav as item (item.id)}
					<li>
						<a
							href="#{item.id}"
							class={[
								'relative flex items-baseline gap-1.5 py-3 text-[14px] leading-[1.4] transition-colors duration-150 ease-[ease] hover:text-ink',
								active.current === item.id ? 'text-ink' : 'text-body'
							]}
							aria-current={active.current === item.id ? 'location' : undefined}
						>
							<span class="font-mono text-[11px] text-accent-700">{item.n}</span>
							<span>{item.label}</span>
							<span
								class={[
									'absolute inset-x-0 bottom-0.5 h-0.5 rounded-[2px] bg-accent transition-opacity duration-200 ease-[ease]',
									active.current === item.id ? 'opacity-100' : 'opacity-0'
								]}
								aria-hidden="true"
							></span>
						</a>
					</li>
				{/each}
			</ol>
			<div class="flex items-center gap-2.5">
				<ThemeToggle />
				<MaybeLink
					href={site.resume}
					class="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-[13px] font-medium text-strong {btnGhostHover}"
					external
					comingSoon={resumeSoon}
				>
					<Icon name="download" size={14} strokeWidth={2} />
					<span>Résumé</span>
				</MaybeLink>
			</div>
		</nav>

		<div class="hidden items-center gap-2.5 max-desk:flex">
			<ThemeToggle />
			<button
				bind:this={menuButton}
				type="button"
				class="inline-flex size-11 items-center justify-center rounded-xl border border-line bg-surface text-ink"
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
  It fills the viewport under the bar, scrolls on its own (short landscape screens) without
  chaining the scroll to the page behind, and clears the home indicator. `hidden` wins over the
  flex display (Tailwind's preflight makes [hidden] display:none !important).
-->
<nav
	id="mobile-menu"
	class="fixed inset-x-0 top-16 bottom-0 z-19 flex animate-menu-in flex-col overflow-y-auto overscroll-contain bg-surface px-[clamp(20px,5vw,48px)] pt-2 pb-[calc(28px_+_env(safe-area-inset-bottom,0px))] motion-reduce:animate-none"
	aria-label="Primary (menu)"
	bind:this={panel}
	hidden={!open}
>
	<ol class="flex flex-col">
		{#each nav as item (item.id)}
			<li
				class="animate-menu-item-in nth-2:[animation-delay:0.03s] nth-3:[animation-delay:0.06s] nth-4:[animation-delay:0.09s] nth-5:[animation-delay:0.12s] motion-reduce:animate-none"
			>
				<a
					href="#{item.id}"
					class={[
						'flex min-h-15 items-baseline gap-3.5 border-b border-line-soft py-4 text-[26px] leading-[1.2] font-semibold tracking-[-0.02em]',
						active.current === item.id ? 'text-ink' : 'text-body'
					]}
					aria-current={active.current === item.id ? 'location' : undefined}
					onclick={(e) => goTo(e, item.id)}
				>
					<span class="font-mono text-[12px] font-normal tracking-normal text-accent-700"
						>{item.n}</span
					>
					<span>{item.label}</span>
				</a>
			</li>
		{/each}
	</ol>
	<MaybeLink
		href={site.resume}
		class="mt-7 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-inverse text-[15px] font-medium text-on-inverse {btnPrimaryHover}"
		external
		comingSoon={resumeSoon}
	>
		<Icon name="download" size={15} strokeWidth={2} />
		<span>Download résumé</span>
	</MaybeLink>
	<div class="mt-auto flex items-center justify-between pt-7">
		<p class="font-mono text-[12px] text-muted">Philippines</p>
		<SocialLinks />
	</div>
</nav>
