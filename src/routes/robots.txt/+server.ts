import { site } from '$lib/content/site';

export const prerender = true;

export function GET() {
	const url = typeof site.url === 'string' ? site.url.replace(/\/$/, '') : null;
	const lines = ['User-agent: *', 'Allow: /'];
	// A Sitemap line must be an absolute URL, so it's added once site.url is set.
	if (url) lines.push('', `Sitemap: ${url}/sitemap.xml`);
	return new Response(`${lines.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain' } });
}
