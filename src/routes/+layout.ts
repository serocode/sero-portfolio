import { injectAnalytics } from '@vercel/analytics/sveltekit';
import { dev } from '$app/environment';

export const prerender = true;

injectAnalytics({ mode: dev ? 'development' : 'production' });
