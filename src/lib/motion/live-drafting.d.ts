import type { gsap as GSAP } from 'gsap';
import type { ScrollTrigger as ST } from 'gsap/ScrollTrigger';

export interface DraftTarget {
	/** Element, or a selector resolved inside the group's node. */
	el: string | Element;
	/** Shown on the size tag, e.g. "Photo card" → "Photo card 280 × 380". */
	label?: string;
	/** Measure the text's own box (headings, paragraphs) instead of the element's block box. */
	text?: boolean;
	/** Shrink-wrap a full-width row to the children it actually shows (eyebrow rows). */
	fit?: boolean;
	/** With a selector: take every match (up to `max`) instead of the first. */
	all?: boolean;
	max?: number;
}

export interface DraftGroup {
	/** The group's element — or pass `id` for a section. */
	node?: Element;
	id?: string;
	targets: DraftTarget[];
	/** Cursors working this group at once (1–6). Default 2. */
	cursors?: number;
	/** Where the first cursor bursts in from, in page coordinates (e.g. the hero comet). */
	origin?: () => { x: number; y: number } | null;
	/** Start on a timer instead of on scroll (content on screen at load: header, hero). */
	autoplay?: { delay?: number };
	/** ScrollTrigger start. Default 'top 85%'. */
	start?: string;
	/** Overlay lives inside `node` and moves with it (sticky header, stacked project cards). */
	local?: boolean;
	/** For `local` groups whose node never scrolls normally: scroll position (px) to start at. */
	range?: () => { start: number };
	/** Overrides the global `topInset` for this group (use 0 for the sticky header itself). */
	topInset?: number;
}

export interface LiveDraftingOptions {
	gsap: typeof GSAP;
	ScrollTrigger: typeof ST;
	groups: DraftGroup[];
	/** Name on the first cursor's tag. Default 'Anthony'. */
	name?: string;
	/** Colours — hex or `var(--token)`. CSS variables follow the theme live. */
	accent?: string;
	onAccent?: string;
	handleFill?: string;
	/** Height of a sticky header; targets hidden under it count as off screen. Default 0. */
	topInset?: number;
	/** > 1 speeds everything up. Default 1. */
	speed?: number;
	/** Seconds a finished box holds before it fades, as [min, max]. Default [1, 1.6]. */
	hold?: [number, number];
	/** Fixed seed for repeatable runs (tests, screenshots). Default: random per visit. */
	seed?: number;
}

export interface LiveDrafting {
	/** Re-measure after layout changes (fonts, images, theme, deck resize). */
	refresh(): void;
	destroy(): void;
}

export function createLiveDrafting(options: LiveDraftingOptions): LiveDrafting;
export default createLiveDrafting;
