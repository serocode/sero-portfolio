<script lang="ts">
	import Logo from '$lib/brand/Logo.svelte';
	import { site } from '$lib/content/site';
	import { wrap } from '$lib/ui';
	import { prefersReducedMotion } from '$lib/utils/format';
	import Icon from './Icon.svelte';
	import SocialLinks from './SocialLinks.svelte';

	const year = new Date().getFullYear();

	let launching = $state(false);
	let launchTimer = 0;

	function backToTop(event: MouseEvent) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		const reduce = prefersReducedMotion();
		if (!reduce) {
			launching = false;
			clearTimeout(launchTimer);
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

<footer
	class="snap-end border-t border-line"
	data-draft-group
	data-draft-start="top bottom"
	data-draft-cursors="2"
>
	<div
		class="{wrap} flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-6 text-[13px] text-muted max-desk:flex-col max-desk:justify-center max-desk:gap-3.5 max-desk:pt-7 max-desk:pb-[calc(28px_+_env(safe-area-inset-bottom,0px))] max-desk:text-center"
	>
		<p
			class="copy inline-flex items-center gap-2.5 max-desk:order-1"
			data-draft="Credit"
			data-draft-text
		>
			<Logo size={24} decorative /><span>{site.name} · © {year}</span>
		</p>
		<div
			class="flex flex-wrap items-center gap-1 max-desk:flex-col max-desk:justify-center max-desk:gap-3"
		>
			<SocialLinks size={18} tone="muted" itemDraft="Icon" />
			<span class="mx-2.5 h-[18px] w-px bg-line max-desk:hidden" aria-hidden="true"></span>
			<a
				href="#top"
				data-draft="Back to top"
				class={[
					'top group inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line bg-surface py-1 pr-1 pl-4 font-medium text-strong [-webkit-tap-highlight-color:transparent] [transition:border-color_0.2s_ease,color_0.2s_ease,transform_0.2s_ease,box-shadow_0.2s_ease]',
					'hover:border-ink hover:text-ink hover:shadow-[0_10px_24px_-14px_rgb(var(--shadow-rgb)/calc(0.35*var(--shadow-k)))] hover:[transform:translateY(-2px)] focus-visible:rounded-full focus-visible:border-ink focus-visible:text-ink active:[transform:scale(0.97)] motion-reduce:transform-none motion-reduce:hover:transform-none',
					launching && 'launching'
				]}
				onclick={backToTop}
			>
				<span>Back to top</span>
				<span
					class="relative grid size-[34px] place-items-center overflow-hidden rounded-full bg-inverse text-on-inverse [transition:background-color_0.2s_ease,color_0.2s_ease] group-hover:bg-accent group-hover:text-on-accent group-focus-visible:bg-accent group-focus-visible:text-on-accent group-[.launching]:bg-accent group-[.launching]:text-on-accent"
					aria-hidden="true"
				>
					<span
						class="flex group-hover:animate-arrow-loop group-focus-visible:animate-arrow-loop group-[.launching]:animate-arrow-launch motion-reduce:animate-none!"
						><Icon name="arrow-up" size={14} strokeWidth={2.2} /></span
					>
				</span>
			</a>
		</div>
	</div>
</footer>
