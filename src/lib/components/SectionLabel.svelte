<!-- "01 · ABOUT ——" row above each h2. `dark` is the variant used inside the Contact panel. -->
<script lang="ts">
	let {
		n,
		label,
		dark = false,
		rule = 'var(--color-line)'
	}: { n: string; label: string; dark?: boolean; rule?: string } = $props();
</script>

<div
	class={['flex items-center gap-3.5', dark ? 'mb-6' : 'mb-[18px]']}
	style:--rule={dark ? 'var(--color-inverse-line)' : rule}
>
	<span
		class={[
			'font-mono text-[13px] leading-[1.4]',
			dark ? 'text-inverse-accent' : 'text-accent-700'
		]}
		>{n}</span
	>
	<span
		class={[
			'font-mono text-[12px] leading-[1.4] tracking-[0.14em] uppercase',
			dark ? 'text-inverse-muted' : 'text-muted'
		]}
		>{label}</span
	>
	<!-- 28px accent segment on a 1px rule -->
	<span
		class={[
			'h-0.5 flex-1 [background:linear-gradient(var(--color-accent),var(--color-accent))_left_center/28px_2px_no-repeat,linear-gradient(var(--rule),var(--rule))_left_center/100%_1px_no-repeat]',
			dark ? 'max-w-[200px]' : 'max-w-[240px]'
		]}
		aria-hidden="true"
	></span>
</div>
