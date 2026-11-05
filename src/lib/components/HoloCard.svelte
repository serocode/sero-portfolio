<script lang="ts">
	import { holoTilt } from '$lib/actions/holo-tilt';
	import { imageState } from '$lib/actions/image-state';
	import { about } from '$lib/content/about';
	import { site } from '$lib/content/site';
	import { imgFade, imgFrame } from '$lib/ui';
	import Icon from './Icon.svelte';
	import Placeholder from './Placeholder.svelte';

	const card = about.card;
	let flipped = $state(false);

	// Holographic card. use:holoTilt writes --bg-x / --bg-y / --holo-o and the tilt transform on
	// the outer element; the sheen and glare layers read them.
	const face = 'absolute inset-0 box-border overflow-hidden rounded-[22px] backface-hidden';
	const sheen =
		'pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(110deg,#ffb38a_0%,#ffe9a8_7%,#ffc2d1_14%,#d9ccff_21%,#ffb38a_28%)] [background-position:var(--bg-x)_var(--bg-y)] [background-size:240%_240%] transition-opacity duration-[350ms] ease-[ease] dark:opacity-[calc(0.07_+_0.3_*_var(--holo-o))]';
	const glare =
		'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--bg-x)_var(--bg-y),rgba(255,255,255,0.6),rgba(255,255,255,0)_48%)] opacity-(--holo-o) mix-blend-overlay transition-opacity duration-[350ms] ease-[ease]';
	const pill =
		'absolute z-2 inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[11px] leading-[1.4]'; // z-2: above the photo's loading skeleton
	/** Back-face label: sized from the card width (cqi) so nothing clips at 240–300px. */
	const k =
		'font-mono text-[clamp(10px,4.2cqi,11px)] leading-[1.3] tracking-[0.08em] text-inverse-muted uppercase';
</script>

<!-- data-cursor: the visitor cursor's tag names the person in the photo (CollabCursor.svelte). -->
<div
	data-cursor={site.name}
	class="holo-tilt [--bg-x:50%] [--bg-y:50%] [--holo-o:0] [transform:perspective(1000px)_rotateX(0deg)_rotateY(0deg)] will-change-transform"
	use:holoTilt={{ flipped }}
>
	<button
		type="button"
		class="card-btn @container m-0 block w-full rounded-[22px] border-0 bg-transparent p-0 text-left text-inherit perspective-[1400px]"
		aria-pressed={flipped}
		onclick={() => (flipped = !flipped)}
	>
		<!-- The name says what a click does; the card's content is described by the About figcaption. -->
		<span class="sr-only">
			{flipped ? 'Flip the card back to the photo' : 'Flip the photo card to see credentials'}
		</span>
		<span
			class={[
				'relative block aspect-[3/4.2] transform-3d [transition:transform_0.8s_cubic-bezier(0.3,0.7,0.2,1)] motion-reduce:transition-none',
				flipped && '[transform:rotateY(180deg)]'
			]}
			aria-hidden="true"
		>
			<!-- Front -->
			<span
				class="{face} flex flex-col border border-line bg-surface p-2 shadow-[0_1px_2px_rgb(var(--shadow-rgb)/calc(0.06*var(--shadow-k))),0_32px_64px_-32px_rgb(var(--shadow-rgb)/calc(0.38*var(--shadow-k)))]"
			>
				<span
					class="relative block flex-1 overflow-hidden rounded-2xl bg-mist {imgFrame}"
					data-fallback="Photo unavailable"
				>
					{#if site.photo}
						<img
							use:imageState
							src={site.photo.src}
							alt={site.photo.alt}
							width={site.photo.width}
							height={site.photo.height}
							loading="lazy"
							decoding="async"
							class="block size-full object-cover {imgFade}"
						>
					{:else}
						<span
							class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[13px] text-muted"
						>
							<Icon name="user" size={48} strokeWidth={1.2} />
							<Placeholder text="[Your photo]" />
						</span>
					{/if}
					<span
						class="{pill} top-2.5 left-2.5 gap-[5px] bg-[color-mix(in_srgb,var(--color-surface)_92%,transparent)] tracking-[0.06em] text-ink"
						>{card.number}</span
					>
					<span
						class="{pill} top-2.5 right-2.5 gap-[5px] bg-accent font-medium tracking-[0.06em] text-on-accent"
					>
						<Icon name="map-pin" size={11} strokeWidth={2.4} />{card.location}
					</span>
					<!-- A dark scrim in both themes: it sits on the photo, not on the page. -->
					<span
						class="{pill} bottom-2.5 left-2.5 gap-1.5 bg-[rgba(13,17,23,0.78)] tracking-normal text-white"
					>
						<Icon name="rotate" size={12} strokeWidth={2} />{card.flipHint}
					</span>
				</span>
				<span class="flex min-w-0 flex-col gap-0.5 px-1.5 pt-3 pb-1">
					<span class="text-[17px] leading-[1.2] font-bold tracking-[-0.02em] text-ink"
						>{site.name}</span
					>
					<span class="font-mono text-[11px] leading-[1.4] text-muted">{card.strapline}</span>
				</span>
				<span
					class="{sheen} opacity-[calc(0.22_+_0.5_*_var(--holo-o))] mix-blend-color-dodge"
					aria-hidden="true"
				></span>
				<span class={glare} aria-hidden="true"></span>
			</span>

			<!-- Back: a flex column sized from the card width (cqi) so nothing clips at 240–300px. -->
			<span
				class="{face} holo-back flex [transform:rotateY(180deg)] flex-col gap-[clamp(8px,4.6cqi,16px)] border border-inverse bg-[linear-gradient(160deg,var(--color-inverse),color-mix(in_srgb,var(--color-inverse)_85%,var(--color-inverse-line)))] px-[clamp(16px,8cqi,22px)] pt-[clamp(16px,8.5cqi,24px)] pb-[clamp(14px,7cqi,20px)] text-inverse-body shadow-[0_32px_64px_-32px_rgb(var(--shadow-rgb)/calc(0.5*var(--shadow-k)))]"
			>
				<span class="flex flex-col">
					{#each [
						{ k: 'By role', v: card.back.byRole },
						{ k: 'By practice', v: card.back.byPractice }
					] as role (role.k)}
						<span
							class="flex flex-col gap-0.5 border-t border-inverse-line py-[clamp(7px,3.8cqi,12px)] last:border-b"
						>
							<span class={k}>{role.k}</span>
							<span
								class="text-[clamp(13px,5.8cqi,16px)] leading-[1.25] font-semibold text-on-inverse"
								>{role.v}</span
							>
						</span>
					{/each}
				</span>
				<span class="flex flex-col gap-[clamp(4px,2.6cqi,8px)]">
					<span class={k}>Credentials</span>
					{#each card.back.credentials as c (c.label)}
						<span
							class="flex items-start gap-2.5 text-[clamp(12px,5.2cqi,14px)] leading-[1.3] text-on-inverse"
						>
							<span
								class={[
									'mt-[0.45em] size-1.5 flex-none rounded-full',
									c.note
										? 'bg-accent'
										: 'bg-[color-mix(in_srgb,var(--color-on-inverse)_30%,var(--color-inverse))]'
								]}
								aria-hidden="true"
							></span>
							<span class="min-w-0 flex-1">{c.label}</span>
							{#if c.note}
								<span
									class="font-mono text-[clamp(10px,4.2cqi,11px)] leading-[1.6] text-inverse-accent"
									>{c.note}</span
								>
							{/if}
						</span>
					{/each}
				</span>
				<span
					class="mt-auto inline-flex items-center gap-[5px] font-mono text-[11px] leading-[1.4] text-inverse-accent"
				>
					<Icon name="rotate" size={13} strokeWidth={2} />Flip back
				</span>
				<span
					class="{sheen} opacity-[calc(0.06_+_0.16_*_var(--holo-o))] mix-blend-screen"
					aria-hidden="true"
				></span>
				<span class={glare} aria-hidden="true"></span>
			</span>
		</span>
	</button>
</div>
