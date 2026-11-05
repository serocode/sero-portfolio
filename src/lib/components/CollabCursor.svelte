<!--
  The visitor as a live collaborator: a small accent tag rides beside the pointer, like a
  participant's name in a shared design file, and changes with the section under the pointer
  (AS · AB · AP · PR · SK · ✉, from src/lib/content/cursor.ts). Over an element with
  `data-cursor="…"` it shows that label instead (the photo card: the name; social icons: the
  handle). The pointer itself stays a native
  CSS cursor (the accent dart, tokens in theme.css), so it never lags; the tag is placed straight
  from each pointer event, with no easing.

  Mouse/trackpad only (never touch or pen), hidden under the intro loader and when the pointer
  leaves the window, aria-hidden and pointer-events:none, so it never blocks a click. Reduced
  motion: the identity swaps instantly and nothing scales or resizes.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { type CursorSection, cursorIdentity } from '$lib/content/cursor';
	import { swap } from '$lib/motion';
	import Icon from './Icon.svelte';

	/** Elements that get hover feedback (the CSS cursor also turns deeper accent on the clickable ones). */
	const INTERACTIVE =
		'a[href], button:not(:disabled):not([aria-disabled="true"]), [role="button"], [role="tab"], summary, label, .deck-card';
	const order = Object.keys(cursorIdentity) as CursorSection[];

	let enabled = $state(false);
	let visible = $state(false);
	let hovering = $state(false);
	let pressed = $state(false);
	let section = $state<CursorSection>('hero');
	/** The hovered element's own label (`data-cursor`), which wins over the section's identity. */
	let label = $state<string | null>(null);
	/** +1 = moved down the page or onto a labelled element (the new tag rises in), -1 = back. */
	let dir = $state<1 | -1>(1);
	let el = $state<HTMLElement>();
	/** Width of the current tag content, so the pill resizes smoothly between labels. */
	let width = $state(0);
	const identity = $derived<{ text: string } | { icon: 'mail' }>(
		label ? { text: label } : cursorIdentity[section]
	);
	const key = $derived(label ? `label:${label}` : section);

	onMount(() => {
		const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
		let x = 0;
		let y = 0;
		let raf = 0;

		const read = (target: Element | null) => {
			hovering = !!target?.closest(INTERACTIVE);
			// Over the header or footer there's no section: keep the last identity.
			const id = target?.closest('main > section')?.id;
			if (id && id in cursorIdentity && id !== section) {
				const next = id as CursorSection;
				dir = order.indexOf(next) > order.indexOf(section) ? 1 : -1;
				section = next;
			}
			const own = target?.closest('[data-cursor]')?.getAttribute('data-cursor') || null;
			if (own !== label) {
				dir = own ? 1 : -1;
				label = own;
			}
		};
		const onMove = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse') {
				visible = false;
				return;
			}
			x = e.clientX;
			y = e.clientY;
			if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
			visible = true;
			read(e.target as Element);
		};
		// Scrolling moves the page under a still pointer: re-read what's beneath it, once a frame.
		const onScroll = () => {
			if (!visible || raf) return;
			raf = requestAnimationFrame(() => {
				raf = 0;
				read(document.elementFromPoint(x, y));
			});
		};
		const onOut = (e: PointerEvent) => {
			if (!e.relatedTarget) visible = false; // left the window
		};
		const hide = () => (visible = false);
		const onDown = (e: PointerEvent) => (pressed = e.pointerType === 'mouse');
		const onUp = () => (pressed = false);
		const sync = () => {
			enabled = fine.matches;
			if (!enabled) visible = false;
		};

		sync();
		fine.addEventListener('change', sync);
		window.addEventListener('pointermove', onMove, { passive: true });
		window.addEventListener('pointerdown', onDown, { passive: true });
		window.addEventListener('pointerup', onUp, { passive: true });
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('blur', hide);
		document.addEventListener('pointerout', onOut);
		return () => {
			cancelAnimationFrame(raf);
			fine.removeEventListener('change', sync);
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerdown', onDown);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('blur', hide);
			document.removeEventListener('pointerout', onOut);
		};
	});
</script>

{#if enabled}
	<div
		bind:this={el}
		class={[
			'pointer-events-none fixed top-0 left-0 z-40 transition-opacity duration-150 ease-[ease] select-none loader-on:opacity-0',
			visible ? 'opacity-100' : 'opacity-0'
		]}
		aria-hidden="true"
	>
		<!-- The tag sits below-right of the dart's tip. Hover: it tucks in closer and grows a touch;
		     press: it dips, like a click. Same look as the live-drafting cursors' name tags. -->
		<div
			class={[
				'relative grid h-[18px] min-w-[26px] origin-top-left place-items-center overflow-hidden rounded-[5px] bg-accent px-1.5 font-mono text-[10.5px] leading-none font-medium tracking-[0.02em] whitespace-nowrap text-on-accent shadow-[0_2px_6px_-2px_rgb(var(--shadow-rgb)/calc(0.35*var(--shadow-k)))] transition-[translate,scale,width] duration-200 ease-smooth motion-reduce:transition-none [&>*]:[grid-area:1/1]',
				hovering ? 'translate-x-2.5 translate-y-3.5' : 'translate-x-3 translate-y-[17px]',
				pressed ? 'scale-[0.92]' : hovering ? 'scale-[1.06]' : 'scale-100'
			]}
			style:width={width ? `${width + 12}px` : undefined}
		>
			<!-- Invisible copy of the current content: its width sizes the pill (+ 12px padding). -->
			<span class="invisible absolute flex items-center" bind:offsetWidth={width}>
				{@render content()}
			</span>
			{#key key}
				<span
					class="flex items-center"
					in:swap={{ dir, axis: 'y' }}
					out:swap={{ dir, axis: 'y', out: true }}
				>
					{@render content()}
				</span>
			{/key}
		</div>
	</div>
{/if}

{#snippet content()}
	{#if 'icon' in identity}
		<Icon name={identity.icon} size={11} strokeWidth={2.2} />
	{:else}
		{identity.text}
	{/if}
{/snippet}
