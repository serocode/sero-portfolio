<script lang="ts">
	import { onMount } from 'svelte';
	import { LOGO_SPLIT as L } from '$lib/brand/logo-split-paths';

	let { minMs = 1200, maxMs = 3000 }: { minMs?: number; maxMs?: number } = $props();

	let leaving = $state(false);
	let gone = $state(false);

	const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

	onMount(() => {
		const root = document.documentElement;
		if (root.dataset.loader === 'out') {
			markSeen();
			const t = setTimeout(() => {
				gone = true;
				delete root.dataset.loader;
			}, 1000);
			return () => clearTimeout(t);
		}
		if (root.dataset.loader !== 'on') {
			gone = true;
			return;
		}
		const critical = document.fonts?.ready ?? Promise.resolve();
		let cancelled = false;

		Promise.race([critical, wait(Math.max(0, maxMs - performance.now()))])
			.then(() => wait(Math.max(0, minMs - performance.now())))
			.then(() => {
				if (cancelled) return;
				leaving = true;
				markSeen();
				setTimeout(() => delete root.dataset.loader, 380);
			});

		return () => {
			cancelled = true;
			delete root.dataset.loader;
		};
	});

	function markSeen() {
		try {
			sessionStorage.setItem('intro-seen', '1');
		} catch {}
	}

	function onEnd(e: AnimationEvent) {
		if (leaving && e.target === e.currentTarget) gone = true;
	}
</script>

{#if !gone}
	<div
		class={[
			'ld items-center justify-center bg-paper will-change-transform motion-reduce:hidden!',
			'loader-on:fixed loader-on:inset-0 loader-on:z-1000 loader-on:flex',
			'loader-out:fixed loader-out:inset-0 loader-out:z-1000 loader-out:flex loader-out:animate-ld-lift',
			leaving ? 'fixed inset-0 z-1000 flex animate-ld-lift' : 'hidden'
		]}
		role="status"
		aria-live="polite"
		onanimationend={onEnd}
	>
		<span class="sr-only">Loading Anthony Serojales’ portfolio…</span>
		<div
			class={[
				'flex flex-col items-center gap-[22px] loader-out:animate-ld-inner-out',
				leaving && 'animate-ld-inner-out'
			]}
			aria-hidden="true"
		>
			<svg
				class="block h-auto w-[clamp(150px,22vw,202px)] overflow-visible"
				aria-hidden="true"
				viewBox={L.viewBox}
				width={(96 * L.width) / L.height}
				height="96"
			>
				<defs>
					<clipPath id="ld-clip">
						<rect x="-2" y="-3" width={L.width + 4} height={L.height + 3} />
					</clipPath>
				</defs>
				<g clip-path="url(#ld-clip)">
					<path class="animate-ld-rise-a fill-ink [transform:translateY(26px)]" d={L.a} />
					<path class="animate-ld-rise-s fill-ink [transform:translateY(26px)]" d={L.s} />
				</g>
				<circle
					class="origin-bottom animate-ld-drop fill-accent opacity-0 [transform-box:fill-box]"
					cx={L.dot.cx}
					cy={L.dot.cy}
					r={L.dot.r}
				/>
			</svg>
			<p
				class="animate-ld-name font-mono text-[12px] tracking-[0.18em] text-muted uppercase opacity-0"
			>
				Anthony Serojales
			</p>
			<div class="h-0.5 w-[140px] overflow-hidden rounded-[2px] bg-line">
				<span
					class={[
						'block h-full origin-left bg-accent [transform:scaleX(0)]',
						leaving ? 'animate-ld-fill-end' : 'animate-ld-fill'
					]}
				></span>
			</div>
		</div>
	</div>
{/if}
