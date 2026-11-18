export const skillsIntro = {
	heading: 'Tools I reach for.',
	sub: 'No ratings or skill bars. Every mark is a project I built with that tool — pick a project to see its whole stack, or a tool to see where I used it.'
};

export const skillsCopy = {
	projectsLabel: 'Show the stack of one project',
	all: 'All projects',
	toolsLabel: 'Tools — pick one to see the projects that use it',
	clear: 'Clear',
	overview: (tools: number, projects: number) => `${tools} tools across ${projects} projects.`,
	overviewDetail: 'Pick a project to see its stack, or a tool to see where it’s used',
	project: (title: string, used: number, tools: number) =>
		`${title} uses ${used} of these ${tools} tools.`,
	tool: (name: string, used: number, projects: number) =>
		`${name} — in ${used} of ${projects} projects.`,
	toolCount: (n: number) => `${n} ${n === 1 ? 'tool' : 'tools'}`,
	usedIn: (titles: string[]) => `Used in ${titles.join(', ')}.`
};

export const projectColumns: Record<string, { short: string; code: string }> = {
	'subpoena-colada': { short: 'Subpoena', code: 'SC' },
	tockup: { short: 'TockUp', code: 'TU' },
	'kitchen-counter': { short: 'Kitchen', code: 'KC' },
	'stack-knockout': { short: 'Stack KO', code: 'SK' },
	lobbers: { short: 'Lobbers', code: 'LB' },
	elsora: { short: 'Elsora', code: 'EL' },
	medicore: { short: 'MediCore', code: 'MC' },
	enlock: { short: 'Enlock', code: 'EN' }
};

const EN = 'enlock',
	SC = 'subpoena-colada',
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
			{ name: 'TypeScript · JavaScript', usedIn: [EN, SC, KC, SK, LB, EL, MC] },
			{ name: 'React', usedIn: [EN, KC, SK, LB, EL, MC] },
			{ name: 'Svelte · SvelteKit', usedIn: [SC] },
			{ name: 'Next.js', usedIn: [KC] },
			{ name: 'Phaser', usedIn: [LB] },
			{ name: 'Tailwind CSS', usedIn: [EN, SC, KC, EL, MC] },
			{ name: 'HTML & CSS', usedIn: [EN, SC, TU, KC, SK, LB, MC] }
		]
	},
	{ label: 'Mobile', tools: [{ name: 'Kotlin · Android', usedIn: [TU] }] },
	{
		label: 'Server & realtime',
		tools: [
			{ name: 'Node.js', usedIn: [EN, EL, MC] },
			{ name: 'Hono', usedIn: [EN, EL, MC] },
			{ name: 'Better Auth', usedIn: [EN, EL, MC] },
			{ name: 'WebRTC · Trystero · PeerJS', usedIn: [SK, LB] }
		]
	},
	{
		label: 'Data',
		tools: [
			{ name: 'PostgreSQL', usedIn: [EN, EL, MC] },
			{ name: 'Drizzle ORM', usedIn: [EN, EL, MC] },
			{ name: 'Redis', usedIn: [EN, EL] },
			{ name: 'Browser storage', usedIn: [SC, SK, LB] }
		]
	},
	{
		label: 'Build & ship',
		tools: [
			{ name: 'Vite', usedIn: [EN, SC, SK, LB, EL, MC] },
			{ name: 'Vercel', usedIn: [SC, KC, SK, LB] },
			{ name: 'Docker', usedIn: [EN, EL, MC] },
			{ name: 'Turborepo', usedIn: [EN, EL, MC] },
			{ name: 'pnpm workspaces', usedIn: [EN, SK, LB, EL, MC] }
		]
	},
	{
		label: 'Quality',
		tools: [
			{ name: 'Vitest', usedIn: [EN, SK, EL, MC] },
			{ name: 'Playwright', usedIn: [EN, LB, EL] },
			{ name: 'Biome', usedIn: [EN, EL, MC] },
			{ name: 'ESLint', usedIn: [KC] },
			{ name: 'Git & GitHub', usedIn: [EN, SC, TU, KC, SK, LB, EL, MC] }
		]
	}
];
