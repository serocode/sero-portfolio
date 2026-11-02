import type { Project } from './types';

/**
 * Every fact here comes from the project's README, its repo, the live app,
 * or something Anthony said. Don't add claims that aren't sourced.
 * Image width/height are the real pixel sizes — pass them to <img> to avoid layout shift.
 */
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
		id: 'kortex',
		title: 'Kortex',
		kind: 'Online assessment platform',
		badges: [
			{
				label: 'Private repo',
				tone: 'private'
			}
		],
		description:
			'An analytics-native online assessment platform for educators, training teams and certification bodies. Item analysis, Bloom’s Taxonomy analytics and evidence-backed AI insights run in the background, so a submission is never held up.',
		highlights: [
			'Assessment builder, question bank import, live sessions, timed and lockdown papers',
			'Paper Mode — printed answer sheets read by an offline phone scanner',
			'Two-factor sign-in for staff, roles and an audit trail'
		],
		stack: [
			'TypeScript',
			'Node.js',
			'PostgreSQL',
			'Redis',
			'Drizzle ORM',
			'Playwright',
			'pnpm monorepo'
		],
		links: [],
		views: [
			{
				label: 'Architecture',
				type: 'diagram',
				caption: 'Architecture — from the project README',
				ariaLabel:
					'Kortex architecture: dashboard, quiz and phone scanner apps call the API; a worker runs analytics; PostgreSQL and Redis underneath',
				rows: [
					[
						{
							label: 'Dashboard',
							kind: 'plain'
						},
						{
							label: 'Quiz',
							kind: 'plain'
						},
						{
							label: 'Phone scanner',
							kind: 'plain'
						}
					],
					[
						{
							label: 'API',
							kind: 'key'
						},
						{
							label: 'Worker · analytics',
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
	}
];
