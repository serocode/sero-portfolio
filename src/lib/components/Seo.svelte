<!-- <head> metadata: title, description, Open Graph, Twitter, canonical (only with a real URL), JSON-LD Person. -->
<script lang="ts">
	import { site, socials } from '$lib/content/site';

	const url = typeof site.url === 'string' ? site.url.replace(/\/$/, '') : null;
	// Relative until site.url is set; social crawlers need these absolute, so set site.url before launch.
	const abs = (path: string) => (url ? `${url}${path}` : path);
	const ogImage = abs('/og-image.png');
	const logo = abs('/icon-512.png');

	const person = {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: site.name,
		jobTitle: 'Software Developer',
		address: { '@type': 'PostalAddress', addressCountry: 'PH' },
		...(url ? { url } : {}),
		// schema.org has no `logo` on Person; a personal brand's logo goes on its Brand.
		brand: { '@type': 'Brand', name: `${site.initials}.`, logo },
		sameAs: socials.map((s) => s.href).filter((href): href is string => typeof href === 'string')
	};
	// Escape "<" so the JSON can't close the script tag.
	const jsonLd = `<script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</${'script'}>`;
</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.description}>
	<meta property="og:title" content={site.title}>
	<meta property="og:description" content={site.ogDescription}>
	<meta property="og:type" content="website">
	<meta property="og:site_name" content={site.name}>
	<meta property="og:image" content={ogImage}>
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta property="og:image:alt" content="{site.name}. Building thoughtful digital experiences.">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content={site.title}>
	<meta name="twitter:description" content={site.ogDescription}>
	<meta name="twitter:image" content={ogImage}>
	{#if url}
		<link rel="canonical" href="{url}/">
		<meta property="og:url" content="{url}/">
	{/if}
	{@html jsonLd}
</svelte:head>
