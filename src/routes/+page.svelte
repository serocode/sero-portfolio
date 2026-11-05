<script lang="ts">
	import CollabCursor from '$lib/components/CollabCursor.svelte';
	import LiveDrafting from '$lib/components/LiveDrafting.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import StrangerScreen from '$lib/components/StrangerScreen.svelte';
	import About from '$lib/sections/About.svelte';
	import Approach from '$lib/sections/Approach.svelte';
	import Contact from '$lib/sections/Contact.svelte';
	import Hero from '$lib/sections/Hero.svelte';
	import Projects from '$lib/sections/Projects.svelte';
	import Skills from '$lib/sections/Skills.svelte';
</script>

<Seo />

<div id="top" class="min-h-screen overflow-x-clip stranger-veiled:invisible">
	<a
		class="absolute -top-[60px] left-3 z-50 rounded-full bg-inverse px-4 py-2.5 text-[14px] text-on-inverse focus:top-2.5"
		href="#main"
		>Skip to content</a
	>
	<SiteHeader />
	<main id="main" tabindex="-1" class="focus:outline-none">
		<Hero />
		<About />
		<Approach />
		<Projects />
		<Skills />
		<Contact />
	</main>
	<SiteFooter />
</div>
<LiveDrafting />
<CollabCursor />
<StrangerScreen />
