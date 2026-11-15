export const skillsIntro = {
	heading: 'Tools I reach for.',
	sub: 'No ratings or progress bars. Every dot is a project I built with that tool — pick a project to see its whole stack.'
};

export const projectColumns: Record<string, { short: string; code: string }> = {
	'subpoena-colada': { short: 'Subpoena', code: 'SC' },
	tockup: { short: 'TockUp', code: 'TU' },
	'kitchen-counter': { short: 'Kitchen', code: 'KC' },
	'stack-knockout': { short: 'Stack KO', code: 'SK' },
	lobbers: { short: 'Lobbers', code: 'LB' },
	elsora: { short: 'Elsora', code: 'EL' },
	medicore: { short: 'MediCore', code: 'MC' }
};

const SC = 'subpoena-colada',
	TU = 'tockup',
	KC = 'kitchen-counter',
	SK = 'stack-knockout',
	LB = 'lobbers',
	EL = 'elsora',
	MC = 'medicore';

export const skillGroups: { label: string; tools: { name: string; usedIn: string[] }[] }[] = [
	{
		label: 'Languages & UI',
		tools: [
			{ name: 'TypeScript · JavaScript', usedIn: [SC, KC, SK, LB, EL, MC] },
			{ name: 'React', usedIn: [KC, SK, LB, EL, MC] },
			{ name: 'Svelte · SvelteKit', usedIn: [SC] },
			{ name: 'Next.js', usedIn: [KC] },
			{ name: 'Phaser', usedIn: [LB] },
			{ name: 'Tailwind CSS', usedIn: [SC, KC, EL, MC] },
			{ name: 'HTML & CSS', usedIn: [SC, TU, KC, SK, LB, MC] }
		]
	},
	{ label: 'Mobile', tools: [{ name: 'Kotlin · Android', usedIn: [TU] }] },
	{
		label: 'Server & realtime',
		tools: [
			{ name: 'Node.js', usedIn: [EL, MC] },
			{ name: 'Hono', usedIn: [EL, MC] },
			{ name: 'Better Auth', usedIn: [EL, MC] },
			{ name: 'WebRTC · Trystero · PeerJS', usedIn: [SK, LB] }
		]
	},
	{
		label: 'Data',
		tools: [
			{ name: 'PostgreSQL', usedIn: [EL, MC] },
			{ name: 'Drizzle ORM', usedIn: [EL, MC] },
			{ name: 'Redis', usedIn: [EL] },
			{ name: 'Browser storage', usedIn: [SC, SK, LB] }
		]
	},
	{
		label: 'Build & ship',
		tools: [
			{ name: 'Vite', usedIn: [SC, SK, LB, EL, MC] },
			{ name: 'Vercel', usedIn: [SC, KC, SK, LB] },
			{ name: 'Docker', usedIn: [EL, MC] },
			{ name: 'Turborepo', usedIn: [EL, MC] },
			{ name: 'pnpm workspaces', usedIn: [SK, LB, EL, MC] }
		]
	},
	{
		label: 'Quality',
		tools: [
			{ name: 'Vitest', usedIn: [SK, EL, MC] },
			{ name: 'Playwright', usedIn: [LB, EL] },
			{ name: 'Biome', usedIn: [EL, MC] },
			{ name: 'ESLint', usedIn: [KC] },
			{ name: 'Git & GitHub', usedIn: [SC, TU, KC, SK, LB, EL, MC] }
		]
	}
];
