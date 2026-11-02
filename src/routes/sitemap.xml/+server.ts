import { site } from '$lib/content/site';

export const prerender = true;

export function GET() {
	const url = typeof site.url === 'string' ? site.url.replace(/\/$/, '') : null;
	// Sitemap <loc> values must be absolute; the entry for "/" appears once site.url is set.
	const entry = url
		? `\n\t<url>\n\t\t<loc>${url}/</loc>\n\t\t<changefreq>monthly</changefreq>\n\t</url>`
		: '\n\t<!-- Set site.url in src/lib/content/site.ts to list "/" here. -->';
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entry}\n</urlset>\n`;
	return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
