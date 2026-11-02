/**
 * Skill × project matrix. Each tool lists the project ids (see projects.ts) that use it,
 * taken from the repos' package.json files, READMEs and the project cards.
 * Kortex is a private repo — its column comes from the README only; confirm with Anthony.
 */
export const skillsIntro = {
	heading: 'Tools I reach for.',
	sub: 'No ratings or progress bars. Every dot is a project I built with that tool — pick a project to see its whole stack.'
};

/** Short column labels (desktop) and two-letter codes (≤820px). */
export const projectColumns: Record<string, { short: string; code: string }> = {
	'subpoena-colada': { short: 'Subpoena', code: 'SC' },
	tockup: { short: 'TockUp', code: 'TU' },
	'kitchen-counter': { short: 'Kitchen', code: 'KC' },
	'stack-knockout': { short: 'Stack KO', code: 'SK' },
	kortex: { short: 'Kortex', code: 'KX' },
	medicore: { short: 'MediCore', code: 'MC' }
};

const SC = 'subpoena-colada',
	TU = 'tockup',
	KC = 'kitchen-counter',
	SK = 'stack-knockout',
	KX = 'kortex',
	MC = 'medicore';

export const skillGroups: { label: string; tools: { name: string; usedIn: string[] }[] }[] = [
	{
		label: 'Languages & UI',
		tools: [
			{ name: 'TypeScript · JavaScript', usedIn: [SC, KC, SK, KX, MC] },
			{ name: 'React', usedIn: [KC, SK, MC] },
			{ name: 'Svelte · SvelteKit', usedIn: [SC] },
			{ name: 'Next.js', usedIn: [KC] },
			{ name: 'Tailwind CSS', usedIn: [SC, KC, MC] },
			{ name: 'HTML & CSS', usedIn: [SC, TU, KC, SK, MC] }
		]
	},
	{ label: 'Mobile', tools: [{ name: 'Kotlin · Android', usedIn: [TU] }] },
	{
		label: 'Server & realtime',
		tools: [
			{ name: 'Node.js', usedIn: [KX, MC] },
			{ name: 'Hono', usedIn: [MC] },
			{ name: 'Better Auth', usedIn: [MC] },
			{ name: 'WebRTC · Trystero', usedIn: [SK] }
		]
	},
	{
		label: 'Data',
		tools: [
			{ name: 'PostgreSQL', usedIn: [KX, MC] },
			{ name: 'Drizzle ORM', usedIn: [KX, MC] },
			{ name: 'Redis', usedIn: [KX] },
			{ name: 'Browser storage', usedIn: [SC, SK] }
		]
	},
	{
		label: 'Build & ship',
		tools: [
			{ name: 'Vite', usedIn: [SC, SK, MC] },
			{ name: 'Vercel', usedIn: [SC, KC, SK] },
			{ name: 'Docker', usedIn: [MC] },
			{ name: 'Turborepo', usedIn: [MC] },
			{ name: 'pnpm workspaces', usedIn: [SK, KX, MC] }
		]
	},
	{
		label: 'Quality',
		tools: [
			{ name: 'Vitest', usedIn: [SK, MC] },
			{ name: 'Playwright', usedIn: [KX] },
			{ name: 'Biome', usedIn: [MC] },
			{ name: 'ESLint', usedIn: [KC] },
			{ name: 'Git & GitHub', usedIn: [SC, TU, KC, SK, KX, MC] }
		]
	}
];
