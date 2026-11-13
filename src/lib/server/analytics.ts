import { env } from '$env/dynamic/private';

/** The Vercel project and team that hold the portfolio's Web Analytics. */
const PROJECT = 'sero-portfolio';
const TEAM_SLUG = 'anthonys-projects-225b3cae';

/**
 * Lifetime production visitors, from Vercel's Web Analytics API (`visits/count`).
 * Needs a Vercel access token in `VERCEL_ANALYTICS_TOKEN`; returns null without one or on any error.
 */
export async function totalVisitors(fetch: typeof globalThis.fetch): Promise<number | null> {
	const token = env.VERCEL_ANALYTICS_TOKEN;
	if (!token) return null;

	const url = new URL('https://api.vercel.com/v1/query/web-analytics/visits/count');
	url.searchParams.set('projectId', PROJECT);
	url.searchParams.set('slug', TEAM_SLUG);

	try {
		const res = await fetch(url, {
			headers: { Authorization: `Bearer ${token}` },
			signal: AbortSignal.timeout(5000)
		});
		if (!res.ok) {
			console.error(`[visitors] Vercel API responded ${res.status}`);
			return null;
		}
		const body: { data?: { visitors?: unknown } } = await res.json();
		const visitors = body.data?.visitors;
		return typeof visitors === 'number' && Number.isFinite(visitors) ? visitors : null;
	} catch (error) {
		console.error('[visitors] Vercel API request failed', error);
		return null;
	}
}
