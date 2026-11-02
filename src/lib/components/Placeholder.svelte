<!--
  Visible stand-in for a detail Anthony hasn't supplied (email, Facebook URL, résumé…).
  Violet + dashed underline so it can't be mistaken for real content. Never replace with invented values.
-->
<script lang="ts">
	let { text, dark = false }: { text: string; dark?: boolean } = $props();
</script>

<span class="ph" class:dark>{text}</span>

<style>
	.ph {
		font-family: var(--font-mono);
		font-size: 0.92em;
		color: var(--color-placeholder);
		border-bottom: 1px dashed color-mix(in srgb, var(--color-placeholder) 45%, transparent);
	}
	/* On the inverse surfaces (contact panel), which are dark in light mode and light in dark. */
	.dark {
		color: var(--color-inverse-placeholder);
		border-bottom-color: color-mix(in srgb, var(--color-inverse-placeholder) 50%, transparent);
	}
</style>
