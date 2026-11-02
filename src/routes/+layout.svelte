<script lang="ts">
	import '../app.css';
	import monoUrl from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url';
	import sansUrl from '@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2?url';
	import { onMount } from 'svelte';
	import IntroLoader from '$lib/components/IntroLoader.svelte';

	import { theme } from '$lib/theme.svelte';

	let { children } = $props();

	// Picks up the theme set by the inline script in app.html and follows OS changes.
	onMount(() => theme.init());
</script>

<svelte:head>
	<!-- Preload the Latin subsets used above the fold so text doesn't swap late. -->
	<link rel="preload" as="font" type="font/woff2" href={sansUrl} crossorigin="anonymous">
	<link rel="preload" as="font" type="font/woff2" href={monoUrl} crossorigin="anonymous">
</svelte:head>

<!-- First in the markup so it's prerendered and covers the page from the first frame. -->
<IntroLoader />
{@render children()}
