<!--
  Visible stand-in for a detail Anthony hasn't supplied (email, Facebook URL, résumé…).
  Violet + dashed underline so it can't be mistaken for real content. Never replace with invented values.
-->
<script lang="ts">
	let {
		text,
		dark = false,
		small = false
	}: {
		text: string;
		/** On the inverse surfaces (contact panel): dark in light mode, light in dark mode. */
		dark?: boolean;
		/** 12px instead of 0.92em (contact list). */
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
