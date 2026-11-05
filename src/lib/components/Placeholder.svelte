<script lang="ts">
	let {
		text,
		dark = false,
		small = false
	}: {
		text: string;
		dark?: boolean;
		small?: boolean;
	} = $props();
</script>

<span
	class={[
		'border-b border-dashed font-mono',
		small ? 'text-[12px]' : 'text-[0.92em]',
		dark
			? 'border-[color-mix(in_srgb,var(--color-inverse-placeholder)_50%,transparent)] text-inverse-placeholder'
			: 'border-[color-mix(in_srgb,var(--color-placeholder)_45%,transparent)] text-placeholder'
	]}
	>{text}</span
>
