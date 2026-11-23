import type { Link, Missing } from './types';

export const site = {
	name: 'Anthony Serojales',
	initials: 'AS',
	title: 'Anthony Serojales — Software Developer',
	description:
		'Anthony Serojales — software developer in the Philippines building full-stack web applications. HR by role, developer by practice.',
	ogDescription: 'Building thoughtful digital experiences. HR by role, developer by practice.',
	url: 'https://serocode.vercel.app' as string | Missing,
	email: 'gaserojales.dev@gmail.com' as string | Missing,
	kofi: {
		href: 'https://ko-fi.com/serocode' as string | Missing | null,
		label: 'Ko-fi',
		cta: 'Support me on Ko-fi',
		comingSoon: 'Ko-fi link coming soon'
	},
	photo: {
		src: '/images/anthony.webp',
		srcset:
			'/images/anthony-384.webp 384w, /images/anthony-512.webp 512w, /images/anthony.webp 768w',
		width: 768,
		height: 1024,
		alt: 'Anthony Serojales on a beach in sunglasses, smiling and giving a thumbs-up'
	} as { src: string; srcset?: string; width: number; height: number; alt: string } | null
};

export const hero = {
	eyebrow: 'Hi, my name is',
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
