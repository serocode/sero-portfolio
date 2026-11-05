/**
 * The visitor's live-cursor identity (CollabCursor.svelte): a small collaborator tag beside the
 * pointer that changes with the section under it, like a participant in a shared design file.
 * Keys are the `id`s of the `main > section` elements, in page order.
 */
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
