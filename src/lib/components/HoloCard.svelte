<script lang="ts">
	import '$lib/styles/holo-card.css';
	import { holoTilt } from '$lib/actions/holo-tilt';
	import { about } from '$lib/content/about';
	import { site } from '$lib/content/site';
	import Icon from './Icon.svelte';
	import Placeholder from './Placeholder.svelte';

	const card = about.card;
	let flipped = $state(false);
</script>

<div class="holo-tilt" use:holoTilt={{ flipped }}>
	<button
		type="button"
		class="card-btn"
		aria-pressed={flipped}
		onclick={() => (flipped = !flipped)}
	>
		<!-- The name says what a click does; the card's content is described by the About figcaption. -->
		<span class="sr-only">
			{flipped ? 'Flip the card back to the photo' : 'Flip the photo card to see credentials'}
		</span>
		<span class="holo-inner" class:is-flipped={flipped} aria-hidden="true">
			<!-- Front -->
			<span class="holo-face front">
				<span class="well">
					{#if site.photo}
						<img src={site.photo} alt="Portrait of {site.name}" class="photo">
					{:else}
						<span class="no-photo">
							<Icon name="user" size={48} strokeWidth={1.2} />
							<Placeholder text="[Your photo]" />
						</span>
					{/if}
					<span class="pill number mono">{card.number}</span>
					<span class="pill where mono">
						<Icon name="map-pin" size={11} strokeWidth={2.4} />{card.location}
					</span>
					<span class="pill hint mono">
						<Icon name="rotate" size={12} strokeWidth={2} />{card.flipHint}
					</span>
				</span>
				<span class="strip">
					<span class="strip-name">{site.name}</span>
					<span class="strip-line mono">{card.strapline}</span>
				</span>
				<span class="holo-sheen" aria-hidden="true"></span>
				<span class="holo-glare" aria-hidden="true"></span>
			</span>

			<!-- Back -->
			<span class="holo-face holo-back back">
				<span class="roles">
					<span class="role">
						<span class="k mono">By role</span>
						<span class="v">{card.back.byRole}</span>
					</span>
					<span class="role">
						<span class="k mono">By practice</span>
						<span class="v">{card.back.byPractice}</span>
					</span>
				</span>
				<span class="creds">
					<span class="k mono">Credentials</span>
					{#each card.back.credentials as c (c.label)}
						<span class="cred" class:current={!!c.note}>
							<span class="dot" aria-hidden="true"></span>
							<span class="cred-label">{c.label}</span>
							{#if c.note}
								<span class="note mono">{c.note}</span>
							{/if}
						</span>
					{/each}
				</span>
				<span class="flip-back mono">
					<Icon name="rotate" size={13} strokeWidth={2} />Flip back
				</span>
				<span class="holo-sheen holo-sheen-dark" aria-hidden="true"></span>
				<span class="holo-glare" aria-hidden="true"></span>
			</span>
		</span>
	</button>
</div>

<style>
	.card-btn {
		display: block;
		width: 100%;
		padding: 0;
		margin: 0;
		border: 0;
		border-radius: 22px;
		background: transparent;
		color: inherit;
		text-align: left;
		perspective: 1400px;
		container-type: inline-size;
	}
	.holo-inner {
		aspect-ratio: 3 / 4.2;
	}

	/* ── Front ── */
	.front {
		display: flex;
		flex-direction: column;
		padding: 8px;
		background: var(--color-surface);
		border: 1px solid var(--color-line);
		box-shadow:
			0 1px 2px rgb(var(--shadow-rgb) / calc(0.06 * var(--shadow-k))),
			0 32px 64px -32px rgb(var(--shadow-rgb) / calc(0.38 * var(--shadow-k)));
	}
	.well {
		position: relative;
		flex: 1;
		display: block;
		overflow: hidden;
		border-radius: 16px;
		background: var(--color-mist);
	}
	.photo {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.no-photo {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		font-size: 13px;
		color: var(--color-muted);
	}
	.pill {
		position: absolute;
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 4px 10px;
		border-radius: 999px;
		font-size: 11px;
		line-height: 1.4;
		letter-spacing: 0.06em;
	}
	.number {
		top: 10px;
		left: 10px;
		background: color-mix(in srgb, var(--color-surface) 92%, transparent);
		color: var(--color-ink);
	}
	.where {
		top: 10px;
		right: 10px;
		background: var(--color-accent);
		font-weight: 500;
		color: var(--color-on-accent);
	}
	.hint {
		bottom: 10px;
		left: 10px;
		gap: 6px;
		letter-spacing: 0;
		background: rgba(13, 17, 23, 0.78);
		color: #fff;
	}
	.strip {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		padding: 12px 6px 4px;
	}
	.strip-name {
		font-size: 17px;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -0.02em;
		color: var(--color-ink);
	}
	.strip-line {
		font-size: 11px;
		line-height: 1.4;
		color: var(--color-muted);
	}

	/* "Flip for more" stays a dark scrim in both themes: it sits on the photo, not on the page. */

	/* ── Back: flex column sized from the card width (cqi) so nothing clips at 240–300px ── */
	.back {
		display: flex;
		flex-direction: column;
		gap: clamp(8px, 4.6cqi, 16px);
		padding: clamp(16px, 8.5cqi, 24px) clamp(16px, 8cqi, 22px) clamp(14px, 7cqi, 20px);
		background: linear-gradient(
			160deg,
			var(--color-inverse),
			color-mix(in srgb, var(--color-inverse) 85%, var(--color-inverse-line))
		);
		border: 1px solid var(--color-inverse);
		color: var(--color-inverse-body);
		box-shadow: 0 32px 64px -32px rgb(var(--shadow-rgb) / calc(0.5 * var(--shadow-k)));
	}
	.k {
		font-size: clamp(10px, 4.2cqi, 11px);
		line-height: 1.3;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-inverse-muted);
	}
	.roles {
		display: flex;
		flex-direction: column;
	}
	.role {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: clamp(7px, 3.8cqi, 12px) 0;
		border-top: 1px solid var(--color-inverse-line);
	}
	.role:last-child {
		border-bottom: 1px solid var(--color-inverse-line);
	}
	.v {
		font-size: clamp(13px, 5.8cqi, 16px);
		font-weight: 600;
		line-height: 1.25;
		color: var(--color-on-inverse);
	}
	.creds {
		display: flex;
		flex-direction: column;
		gap: clamp(4px, 2.6cqi, 8px);
	}
	.cred {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		font-size: clamp(12px, 5.2cqi, 14px);
		line-height: 1.3;
		color: var(--color-on-inverse);
	}
	.dot {
		flex: 0 0 auto;
		width: 6px;
		height: 6px;
		margin-top: 0.45em;
		border-radius: 50%;
		background: color-mix(in srgb, var(--color-on-inverse) 30%, var(--color-inverse));
	}
	.current .dot {
		background: var(--color-accent);
	}
	.cred-label {
		flex: 1;
		min-width: 0;
	}
	.note {
		font-size: clamp(10px, 4.2cqi, 11px);
		line-height: 1.6;
		color: var(--color-inverse-accent);
	}
	.flip-back {
		margin-top: auto;
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 11px;
		line-height: 1.4;
		color: var(--color-inverse-accent);
	}
</style>
