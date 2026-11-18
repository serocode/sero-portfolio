import type { Project } from './types';

export const projects: Project[] = [
	{
		id: 'subpoena-colada',
		title: 'Subpoena Colada',
		kind: 'Personal project · Web app',
		badges: [
			{
				label: 'Live',
				tone: 'live'
			}
		],
		description:
			'A study app I’m building for my own law school journey: situational MCQs and scenario questions I answer myself, then check against a model answer.',
		highlights: [
			'Practice MCQs with the codal basis and an explanation, plus a timed exam mode',
			'Scenario questions answered in ALAC form, with a model answer to compare',
			'Colour-coded study guides with highlights and notes',
			'Progress saved in localStorage — no account, no server'
		],
		stack: ['SvelteKit · Svelte 5', 'TypeScript', 'Tailwind CSS', 'localStorage', 'Vercel'],
		links: [
			{
				label: 'Live demo',
				href: 'https://subpoena-colada.vercel.app/',
				variant: 'primary'
			},
			{
				label: 'Source',
				href: 'https://github.com/serocode/subpoena_colada',
				variant: 'ghost'
			}
		],
		views: [
			{
				label: 'Web app',
				type: 'browser',
				addressBar: 'Subpoena Colada',
				background: '#0e1116',
				shots: [
					{
						src: '/images/projects/subpoena-colada/home.webp',
						width: 1451,
						height: 840,
						label: 'Home',
						caption: 'Home — continue reading, continue practice, every subject'
					},
					{
						src: '/images/projects/subpoena-colada/mcq-practice.webp',
						width: 1451,
						height: 840,
						label: 'MCQ practice',
						caption: 'Situational MCQ with the codal basis and explanation'
					},
					{
						src: '/images/projects/subpoena-colada/alac-essay.webp',
						width: 1451,
						height: 840,
						label: 'ALAC essay',
						caption: 'Scenario question with the model ALAC answer revealed'
					},
					{
						src: '/images/projects/subpoena-colada/study-guide.webp',
						width: 1451,
						height: 840,
						label: 'Study guide',
						caption: 'Colour-coded study guide with its legend'
					}
				]
			}
		]
	},
	{
		id: 'tockup',
		title: 'TockUp',
		kind: 'Personal project · Android app',
		badges: [
			{
				label: 'In development',
				tone: 'neutral'
			},
			{
				label: 'Private repo',
				tone: 'private'
			}
		],
		description:
			'An alarm that won’t stop until your brain is awake. I made it so I actually get up when it rings — instead of switching it off half-asleep.',
		highlights: [
			'Six brain games to stop an alarm — Quick Math, Memory Flip, Sequence Recall, Tap in Order, Odd One Out and Chess',
			'Reminders where Toki pops up with a nudge',
			'Pomodoro focus timer with breaks, rain sounds and a task list',
			'No ads, no tracking, no account'
		],
		stack: ['Android', 'Kotlin', 'Promo site · HTML & CSS'],
		links: [
			{
				label: 'View the designs',
				href: 'https://claude.ai/artifact/1jaFjF8MUp3ZqgWUkoWLza',
				variant: 'primary'
			}
		],
		views: [
			{
				label: 'App',
				type: 'phones',
				shots: [
					{
						src: '/images/projects/tockup/app-brain-game-alarm.webp',
						width: 308,
						height: 674,
						label: 'Brain-game alarm',
						caption: 'Brain-game alarm — checkmate in 3 to stop it'
					},
					{
						src: '/images/projects/tockup/app-reminders.webp',
						width: 308,
						height: 674,
						label: 'Reminders',
						caption: 'Reminders — Toki pops up with a nudge'
					},
					{
						src: '/images/projects/tockup/app-focus-timer.webp',
						width: 308,
						height: 674,
						label: 'Focus timer',
						caption: 'Focus — a Pomodoro session running'
					}
				]
			},
			{
				label: 'Website',
				type: 'browser',
				addressBar: 'TockUp — Wake up. Level up.',
				background: '#f7f4ee',
				shots: [
					{
						src: '/images/projects/tockup/site-hero.webp',
						width: 1600,
						height: 1000,
						label: 'Hero',
						caption: 'Promo site — “Wake up. Level up.” with Toki'
					},
					{
						src: '/images/projects/tockup/site-games.webp',
						width: 1600,
						height: 1000,
						label: 'Games',
						caption: 'The six wake-up games, animated'
					},
					{
						src: '/images/projects/tockup/site-focus.webp',
						width: 1600,
						height: 1000,
						label: 'Focus',
						caption: 'Focus mode and reminders'
					}
				],
				phoneOverlay: {
					src: '/images/projects/tockup/site-mobile-hero.webp',
					width: 780,
					height: 1688,
					alt: 'TockUp website on a phone'
				}
			}
		]
	},
	{
		id: 'kitchen-counter',
		title: 'Kitchen Counter',
		kind: 'Personal project · Web app',
		badges: [
			{
				label: 'Live',
				tone: 'live'
			}
		],
		description:
			'A courtside app for pickleball doubles. Open play builds fair matches across several courts — whoever has waited longest plays next — while every court keeps its own score.',
		highlights: [
			'Skill-matched, balanced or random matchmaking with a fair queue',
			'Live standings ranked by wins, win rate and point differential, with hot streaks',
			'Point-by-point scoring with server number, court positions and match stats',
			'Responsive from phone to laptop; works offline'
		],
		stack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS', 'Service worker', 'Vercel'],
		links: [
			{
				label: 'Live demo',
				href: 'https://pickleball-kitchen-counter.vercel.app/',
				variant: 'primary'
			},
			{
				label: 'Source',
				href: 'https://github.com/serocode/kitchen_counter',
				variant: 'ghost'
			}
		],
		views: [
			{
				label: 'Desktop',
				type: 'browser',
				addressBar: 'Kitchen Counter',
				background: '#0b0f17',
				shots: [
					{
						src: '/images/projects/kitchen-counter/open-play.webp',
						width: 1451,
						height: 840,
						label: 'Open play',
						caption: 'Open play — two courts live, the queue waiting its turn'
					},
					{
						src: '/images/projects/kitchen-counter/standings.webp',
						width: 1451,
						height: 840,
						label: 'Standings',
						caption: 'Standings — podium, hot streak and win rates'
					},
					{
						src: '/images/projects/kitchen-counter/scoreboard.webp',
						width: 1451,
						height: 840,
						label: 'Scoreboard',
						caption: 'Scoreboard following Court 1, point by point'
					},
					{
						src: '/images/projects/kitchen-counter/match-stats.webp',
						width: 1451,
						height: 840,
						label: 'Match stats',
						caption: 'Live match stats — win probability and momentum'
					},
					{
						src: '/images/projects/kitchen-counter/players.webp',
						width: 1451,
						height: 840,
						label: 'Players',
						caption: 'Check-in with skill ratings and records'
					}
				]
			},
			{
				label: 'Phone',
				type: 'phones',
				shots: [
					{
						src: '/images/projects/kitchen-counter/phone-courts.webp',
						width: 381,
						height: 800,
						label: 'Courts',
						caption: 'On a phone — open play courts'
					},
					{
						src: '/images/projects/kitchen-counter/phone-standings.webp',
						width: 381,
						height: 800,
						label: 'Standings',
						caption: 'On a phone — standings'
					},
					{
						src: '/images/projects/kitchen-counter/phone-scoreboard.webp',
						width: 381,
						height: 800,
						label: 'Scoreboard',
						caption: 'On a phone — the scoreboard'
					}
				]
			}
		]
	},
	{
		id: 'stack-knockout',
		title: 'Stack Knockout',
		kind: 'Personal project · Multiplayer game',
		badges: [
			{
				label: 'Live',
				tone: 'live'
			}
		],
		description:
			'A six-player falling-block knockout played peer to peer in the browser — no game server, no database. If the host drops, another player takes over and the match carries on.',
		highlights: [
			'WebRTC full mesh through Trystero, with automatic host migration — and a lab to break it on purpose',
			'Customise what others see: 18 block skins, frames, clear effects and avatars, plus five interface themes',
			'Career score unlocks tier rewards from Bronze to Diamond, with 16 achievements to earn',
			'Deterministic engine tested with seeded chaos runs; touch controls on phones'
		],
		stack: [
			'React',
			'TypeScript',
			'Canvas',
			'WebRTC · Trystero',
			'Vite',
			'Vitest',
			'pnpm monorepo'
		],
		links: [
			{
				label: 'Play it',
				href: 'https://stack-knockout.vercel.app/',
				variant: 'primary'
			},
			{
				label: 'Source',
				href: 'https://github.com/serocode/stack-knockout',
				variant: 'ghost'
			}
		],
		views: [
			{
				label: 'Game',
				type: 'browser',
				addressBar: 'Stack Knockout',
				background: '#0b0d18',
				shots: [
					{
						src: '/images/projects/stack-knockout/customize.webp',
						width: 1451,
						height: 840,
						label: 'Customize',
						caption: 'Customize — 18 block skins with a live preview'
					},
					{
						src: '/images/projects/stack-knockout/themes-synthwave.webp',
						width: 1451,
						height: 840,
						label: 'Themes',
						caption: 'The whole interface in the Synthwave theme'
					},
					{
						src: '/images/projects/stack-knockout/gameplay-neon.webp',
						width: 1451,
						height: 840,
						label: 'Gameplay',
						caption: 'Practice with the Neon skin — hold, next queue, ghost piece'
					},
					{
						src: '/images/projects/stack-knockout/trophies.webp',
						width: 1451,
						height: 840,
						label: 'Trophies',
						caption: 'Trophies — tier rewards from Bronze to Diamond, and achievements'
					},
					{
						src: '/images/projects/stack-knockout/migration-lab.webp',
						width: 1451,
						height: 840,
						label: 'Migration lab',
						caption: 'Migration lab — the host drops, Ben takes over (epoch 2)'
					}
				]
			}
		]
	},
	{
		id: 'lobbers',
		title: 'Lobbers',
		kind: 'Personal project · Multiplayer game',
		badges: [
			{
				label: 'Live',
				tone: 'live'
			}
		],
		description:
			'A turn-based 4v4 artillery game for the browser, inspired by Gunbound and Worms. Aim, power and wind decide every shot, and every explosion carves the terrain for good. No backend: one player’s browser hosts the match and friends join with a room code.',
		highlights: [
			'Destructible terrain — one pixel mask is both the collision geometry and what’s drawn, so every crater is real',
			'Six battlefields, eight machines with their own abilities, and ten weapons — cluster, drill, lightning, gravity, airstrike and more',
			'Peer to peer over WebRTC: the host’s browser runs and checks every move; dropped players rejoin their seat, and the host can refresh mid-match',
			'One deterministic rules package drives online and local play, tested by full 1v1–4v4 matches and a real 4-player WebRTC browser test'
		],
		stack: [
			'TypeScript',
			'React',
			'Phaser 3',
			'WebRTC · PeerJS',
			'Vite',
			'localStorage',
			'Playwright',
			'Vercel',
			'pnpm monorepo'
		],
		links: [
			{
				label: 'Play it',
				href: 'https://sero-lobbers.vercel.app/',
				variant: 'primary'
			},
			{
				label: 'Source',
				href: 'https://github.com/serocode/lobbers',
				variant: 'ghost'
			}
		],
		views: [
			{
				label: 'Game',
				type: 'browser',
				addressBar: 'Lobbers',
				background: '#101522',
				shots: [
					{
						src: '/images/projects/lobbers/home.webp',
						width: 1451,
						height: 840,
						label: 'Home',
						caption: 'Home — host a room, join one with a code, or pass and play'
					},
					{
						src: '/images/projects/lobbers/shell-in-flight.webp',
						width: 1451,
						height: 840,
						label: 'Shot',
						caption: 'A heavy bomb in flight on Cobalt Crags — the camera follows the shell'
					},
					{
						src: '/images/projects/lobbers/crater.webp',
						width: 1451,
						height: 840,
						label: 'Crater',
						caption: 'The impact carves a crater into the terrain for good'
					},
					{
						src: '/images/projects/lobbers/skyreach-overview.webp',
						width: 1451,
						height: 840,
						label: 'Skyreach',
						caption: 'Overview of Skyreach Isles — 4v4 across islands over the void'
					},
					{
						src: '/images/projects/lobbers/machines.webp',
						width: 1451,
						height: 840,
						label: 'Machines',
						caption: 'Eight machines, each with its own stats, special and ultimate'
					},
					{
						src: '/images/projects/lobbers/armory.webp',
						width: 1451,
						height: 840,
						label: 'Armory',
						caption: 'The armory — ten weapons with damage, radius, ammo and cooldown'
					}
				]
			}
		]
	},
	{
		id: 'elsora',
		title: 'Elsora',
		kind: 'Assessment platform · SaaS',
		badges: [
			{
				label: 'In development',
				tone: 'neutral'
			},
			{
				label: 'Private repo',
				tone: 'private'
			}
		],
		description:
			'An assessment platform for schools and training teams, being built as a SaaS. Authors publish in the Workspace, participants sit in the Room, and item analysis and Bloom’s Taxonomy coverage run in the background so a hand-in is never slowed down.',
		highlights: [
			'Question bank with CSV and XLSX import, an assessment builder, a marking queue and live sessions',
			'The Room saves answers on the device first and sends them when there’s a connection',
			'Paper mode — printed bubble sheets read by a phone Scanner with no signal',
			'Two-factor sign-in for staff, per-workspace isolation and an audit trail'
		],
		stack: [
			'TypeScript',
			'React',
			'Hono',
			'Better Auth',
			'PostgreSQL',
			'Drizzle ORM',
			'Redis · BullMQ',
			'Tailwind CSS',
			'Playwright',
			'Turborepo'
		],
		links: [],
		views: [
			{
				label: 'Workspace',
				type: 'browser',
				addressBar: 'Elsora Workspace',
				background: '#ffffff',
				shots: [
					{
						src: '/images/projects/elsora/workspace-home.webp',
						width: 1451,
						height: 840,
						label: 'Home',
						caption: 'Workspace home — open assessments, submissions and who is sitting now'
					},
					{
						src: '/images/projects/elsora/assessments.webp',
						width: 1451,
						height: 840,
						label: 'Assessments',
						caption: 'Every assessment with its contents, availability and submissions'
					},
					{
						src: '/images/projects/elsora/question-bank.webp',
						width: 1451,
						height: 840,
						label: 'Question bank',
						caption:
							'Question bank — Bloom’s level, discrimination and how often each option was chosen'
					},
					{
						src: '/images/projects/elsora/analytics.webp',
						width: 1451,
						height: 840,
						label: 'Analytics',
						caption: 'Item analysis — score summary and what stands out, worst first'
					},
					{
						src: '/images/projects/elsora/paper-mode.webp',
						width: 1451,
						height: 840,
						label: 'Paper mode',
						caption: 'Paper mode — print the booklet and a personalised answer sheet per student'
					},
					{
						src: '/images/projects/elsora/marking.webp',
						width: 1451,
						height: 840,
						label: 'Marking',
						caption: 'Marking queue — written answers waiting longest come first'
					}
				]
			},
			{
				label: 'Room & Scanner',
				type: 'phones',
				shots: [
					{
						src: '/images/projects/elsora/room-home.webp',
						width: 390,
						height: 823,
						label: 'Room',
						caption: 'The Room — what a participant can sit'
					},
					{
						src: '/images/projects/elsora/room-question.webp',
						width: 390,
						height: 823,
						label: 'Sitting',
						caption: 'Sitting a timed check — each answer saved as it’s chosen'
					},
					{
						src: '/images/projects/elsora/scanner.webp',
						width: 390,
						height: 823,
						label: 'Scanner',
						caption: 'The Scanner — a paper downloaded to the phone, ready to photograph sheets'
					}
				]
			},
			{
				label: 'Architecture',
				type: 'diagram',
				caption: 'Architecture — from the project README',
				ariaLabel:
					'Elsora architecture: the Workspace, Room and phone Scanner apps call the API; a worker runs analytics and reports; PostgreSQL and Redis underneath',
				rows: [
					[
						{
							label: 'Workspace',
							kind: 'plain'
						},
						{
							label: 'Room',
							kind: 'plain'
						},
						{
							label: 'Scanner',
							kind: 'plain'
						}
					],
					[
						{
							label: 'API',
							kind: 'key'
						},
						{
							label: 'Worker · analytics, reports',
							kind: 'soft'
						}
					],
					[
						{
							label: 'PostgreSQL 16',
							kind: 'data'
						},
						{
							label: 'Redis 7',
							kind: 'data'
						}
					]
				]
			}
		]
	},
	{
		id: 'medicore',
		title: 'MediCore',
		kind: 'Clinic records app',
		badges: [
			{
				label: 'Live',
				tone: 'live'
			}
		],
		description:
			'A clinic app for appointments, consultations with SOAP notes, vital-sign trends and lab results — with separate views for admins, doctors, nurses and patients.',
		highlights: [
			'Appointments from request to confirmed, or cancelled with a reason',
			'Encounters with SOAP notes, vital-sign trends and lab results reviewed by a doctor',
			'Passwordless sign-in with one-time email codes'
		],
		stack: [
			'TypeScript',
			'React',
			'Vite',
			'Hono',
			'Better Auth',
			'PostgreSQL',
			'Drizzle ORM',
			'Turborepo'
		],
		links: [
			{
				label: 'Open the app',
				href: 'https://medicore.depedcdo.online/sign-in',
				variant: 'primary'
			},
			{
				label: 'Source',
				href: 'https://github.com/serocode/medicore',
				variant: 'ghost'
			}
		],
		views: [
			{
				label: 'Architecture',
				type: 'diagram',
				caption: 'Architecture — from the repo’s packages',
				ariaLabel:
					'MediCore architecture: React web app, Hono API with Better Auth, domain, application and data layers, PostgreSQL with Drizzle',
				rows: [
					[
						{
							label: 'Web · React + Vite',
							kind: 'plain'
						}
					],
					[
						{
							label: 'API · Hono + Better Auth',
							kind: 'key'
						}
					],
					[
						{
							label: 'domain',
							kind: 'soft'
						},
						{
							label: 'application',
							kind: 'soft'
						},
						{
							label: 'dal',
							kind: 'soft'
						}
					],
					[
						{
							label: 'PostgreSQL · Drizzle',
							kind: 'data'
						}
					]
				]
			}
		]
	},
	{
		id: 'enlock',
		title: 'Enlock',
		kind: 'Secrets manager · Web app, CLI & SDK',
		badges: [
			{
				label: 'SDK & CLI on npm',
				tone: 'live'
			},
			{
				label: 'Deploying soon',
				tone: 'neutral'
			},
			{
				label: 'Private repo',
				tone: 'private'
			}
		],
		description:
			'A place for a team’s environment variables and API keys that never leaves them in plain text. One store behind a web dashboard, an HTTP API, a CLI and a TypeScript SDK — and the CLI hands secrets straight to your process instead of writing a .env file.',
		highlights: [
			'Envelope encryption — every secret gets its own AES-256 key, sealed by a master key in OpenBao or a local key file',
			'Organizations, projects and roles, with every read and change written to an activity log',
			'Version history for each secret, with one-click restore',
			'The CLI’s run command injects secrets into a child process; push and pull sync a .env file'
		],
		stack: [
			'TypeScript',
			'Hono',
			'React · Vite',
			'Better Auth',
			'PostgreSQL',
			'Drizzle ORM',
			'OpenBao',
			'Redis',
			'Tailwind CSS',
			'Vitest',
			'Turborepo'
		],
		links: [
			{
				label: 'CLI on npm',
				href: 'https://www.npmjs.com/package/@enlock/cli',
				variant: 'primary'
			},
			{
				label: 'SDK on npm',
				href: 'https://www.npmjs.com/package/@enlock/sdk',
				variant: 'ghost'
			}
		],
		views: [
			{
				label: 'Dashboard',
				type: 'browser',
				addressBar: 'Enlock',
				background: '#fcfcfc',
				shots: [
					{
						src: '/images/projects/enlock/landing.webp',
						width: 1451,
						height: 840,
						label: 'Home',
						caption: 'Home — secrets your team can share without spreading them'
					},
					{
						src: '/images/projects/enlock/secrets.webp',
						width: 1451,
						height: 840,
						label: 'Secrets',
						caption: 'A project’s secrets — masked until you reveal one'
					},
					{
						src: '/images/projects/enlock/secret-history.webp',
						width: 1451,
						height: 840,
						label: 'History',
						caption: 'Version history for a secret, with restore'
					},
					{
						src: '/images/projects/enlock/use-in-code.webp',
						width: 1451,
						height: 840,
						label: 'Use in code',
						caption: 'Use in code — install the CLI, sign in, run your app with the secrets'
					},
					{
						src: '/images/projects/enlock/activity.webp',
						width: 1451,
						height: 840,
						label: 'Activity',
						caption:
							'Activity — every read and change in the organization, filterable and exportable'
					},
					{
						src: '/images/projects/enlock/docs.webp',
						width: 1451,
						height: 840,
						label: 'Docs',
						caption: 'Docs for the CLI, the SDK and the dashboard'
					}
				]
			}
		]
	}
];

/** Copy for the Projects section chrome (helix controls, detail dialog). */
export const projectsSection = {
	heading: "Things I've built.",
	sub: (count: string) =>
		`${count} projects, one at a time — keep scrolling to bring the next one forward.`,
	hint: 'Scroll or drag to turn',
	listLabel: 'Projects',
	goTo: (title: string) => `Show ${title}`,
	prev: 'Previous project',
	next: 'Next project',
	explore: 'Explore project',
	exploreFor: (title: string) => `Explore ${title}`,
	close: 'Close project details',
	github: { label: 'Everything else on GitHub', href: 'https://github.com/serocode' }
};
