import { type Link, type Missing, missing } from './types';

export const site = {
	name: 'Anthony Serojales',
	initials: 'AS',
	title: 'Anthony Serojales — Software Developer',
	description:
		'Anthony Serojales — software developer in the Philippines building full-stack web applications. HR by role, developer by practice.',
	ogDescription: 'Building thoughtful digital experiences. HR by role, developer by practice.',
	/** Set this once the domain is known; used for canonical + og:url. */
	url: 'serocode.vercel.app' as string | Missing,
	email: 'gaserojales.dev@gmail.com' as string | Missing,
	resume: missing('[résumé PDF]') as string | Missing,
	/** About card photo (static/images/). `null` shows the placeholder. */
	photo: {
		src: '/images/anthony.webp',
		width: 768,
		height: 1024,
		alt: 'Anthony Serojales on a beach in sunglasses, smiling and giving a thumbs-up'
	} as { src: string; width: number; height: number; alt: string } | null
};

export const hero = {
	eyebrow: 'Hi, my name is',
	/** h1: the first name sits small above the surname, which carries the accent period. */
	firstName: 'Anthony',
	lastName: 'Serojales',
	taglineLead: 'Building thoughtful',
	taglineAccent: 'digital experiences.',
	intro:
		"I'm a software developer with experience building full-stack applications, designing scalable systems, and developing practical solutions to real-world problems."
};

export const socials: (Link & { icon: 'github' | 'facebook' | 'discord' | 'linkedin' })[] = [
	{ label: 'GitHub', icon: 'github', href: 'https://github.com/serocode', handle: '/serocode' },
	{
		label: 'Facebook',
		icon: 'facebook',
		href: 'https://www.facebook.com/skiny.2013',
		handle: '/skiny.2013'
	},
	{
		label: 'Discord',
		icon: 'discord',
		href: 'https://discord.com/users/200654637492076544',
		handle: '_lazytutor'
	}
];

/** Hero + footer show only these three icons; Contact lists all socials plus Résumé. */
export const heroSocials = ['github', 'facebook', 'discord'] as const;

export const nav = [
	{ id: 'about', n: '01', label: 'About' },
	{ id: 'approach', n: '02', label: 'Approach' },
	{ id: 'projects', n: '03', label: 'Projects' },
	{ id: 'skills', n: '04', label: 'Skills' },
	{ id: 'contact', n: '05', label: 'Contact' }
] as const;

export const contact = {
	heading: "Let's build something meaningful.",
	body: "I'm always interested in discussing software, technology, and opportunities to build useful products.",
	cta: 'Say hello'
};
