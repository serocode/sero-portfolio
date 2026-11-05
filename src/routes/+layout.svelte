<script lang="ts">
	import '../app.css';
	import monoUrl from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url';
	import sansUrl from '@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2?url';
	import { onMount } from 'svelte';
	import IntroLoader from '$lib/components/IntroLoader.svelte';

	import { theme } from '$lib/theme.svelte';

	let { children } = $props();

	onMount(() => theme.init());
</script>

<svelte:head>
	<link rel="preload" as="font" type="font/woff2" href={sansUrl} crossorigin="anonymous">
	<link rel="preload" as="font" type="font/woff2" href={monoUrl} crossorigin="anonymous">
</svelte:head>

<IntroLoader />
{@render children()}
