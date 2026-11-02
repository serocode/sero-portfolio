<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import About from '$lib/sections/About.svelte';
	import Approach from '$lib/sections/Approach.svelte';
	import Contact from '$lib/sections/Contact.svelte';
	import Hero from '$lib/sections/Hero.svelte';
	import Projects from '$lib/sections/Projects.svelte';
	import Skills from '$lib/sections/Skills.svelte';
</script>

<Seo />

<div id="top">
	<a class="skip" href="#main">Skip to content</a>
	<SiteHeader />
	<main id="main" tabindex="-1">
		<Hero />
		<About />
		<Approach />
		<Projects />
		<Skills />
		<Contact />
	</main>
	<SiteFooter />
</div>

<style>
	#top {
		min-height: 100vh;
		overflow-x: clip;
	}
	main:focus {
		outline: none;
	}
	.skip {
		position: absolute;
		left: 12px;
		top: -60px;
		z-index: 50;
		padding: 10px 16px;
		background: var(--color-inverse);
		border-radius: 999px;
		font-size: 14px;
		color: var(--color-on-inverse);
	}
	.skip:focus {
		top: 10px;
	}
</style>
