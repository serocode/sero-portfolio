<script lang="ts">
	import { onMount } from 'svelte';
	import { type CursorSection, cursorIdentity } from '$lib/content/cursor';
	import { swap } from '$lib/motion';
	import Icon from './Icon.svelte';

	const INTERACTIVE =
		'a[href], button:not(:disabled):not([aria-disabled="true"]), [role="button"], [role="tab"], summary, label, .deck-card';
	const order = Object.keys(cursorIdentity) as CursorSection[];

	let enabled = $state(false);
	let visible = $state(false);
	let hovering = $state(false);
	let pressed = $state(false);
	let section = $state<CursorSection>('hero');
	let label = $state<string | null>(null);
	let dir = $state<1 | -1>(1);
	let el = $state<HTMLElement>();
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
		const onScroll = () => {
			if (!visible || raf) return;
			raf = requestAnimationFrame(() => {
				raf = 0;
				read(document.elementFromPoint(x, y));
			});
		};
		const onOut = (e: PointerEvent) => {
			if (!e.relatedTarget) visible = false;
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
		<div
			class={[
				'relative grid h-[18px] min-w-[26px] origin-top-left place-items-center overflow-hidden rounded-[5px] bg-accent px-1.5 font-mono text-[10.5px] leading-none font-medium tracking-[0.02em] whitespace-nowrap text-on-accent shadow-[0_2px_6px_-2px_rgb(var(--shadow-rgb)/calc(0.35*var(--shadow-k)))] transition-[translate,scale,width] duration-200 ease-smooth motion-reduce:transition-none [&>*]:[grid-area:1/1]',
				hovering ? 'translate-x-2.5 translate-y-3.5' : 'translate-x-3 translate-y-[17px]',
				pressed ? 'scale-[0.92]' : hovering ? 'scale-[1.06]' : 'scale-100'
			]}
			style:width={width ? `${width + 12}px` : undefined}
		>
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
