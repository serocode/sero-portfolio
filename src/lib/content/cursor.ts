export type CursorIdentity = { text: string } | { icon: 'mail' };

export const cursorIdentity = {
	hero: { text: 'AS' },
	about: { text: 'AB' },
	approach: { text: 'AP' },
	projects: { text: 'PR' },
	skills: { text: 'SK' },
	contact: { icon: 'mail' }
} satisfies Record<string, CursorIdentity>;

export type CursorSection = keyof typeof cursorIdentity;
