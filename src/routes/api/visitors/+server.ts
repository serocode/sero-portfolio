import { json } from '@sveltejs/kit';
import { totalVisitors } from '$lib/server/analytics';
import type { RequestHandler } from './$types';

// The rest of the site is prerendered; this one runs as a function so the count stays current.
export const prerender = false;

export const GET: RequestHandler = async ({ fetch, setHeaders }) => {
	const visitors = await totalVisitors(fetch);

	// Vercel's CDN serves the cached answer, so the analytics API is called at most every few minutes.
	setHeaders({
		'cache-control':
			visitors === null
				? 'public, max-age=0, s-maxage=60'
				: 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400'
	});

	return visitors === null ? json({ visitors: null }, { status: 503 }) : json({ visitors });
};
