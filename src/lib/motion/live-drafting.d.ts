import type { gsap as GSAP } from 'gsap';
import type { ScrollTrigger as ST } from 'gsap/ScrollTrigger';

export interface DraftTarget {
	el: string | Element;
	label?: string;
	text?: boolean;
	fit?: boolean;
	all?: boolean;
	max?: number;
}

export interface DraftGroup {
	node?: Element;
	id?: string;
	targets: DraftTarget[];
	cursors?: number;
	origin?: () => { x: number; y: number } | null;
	autoplay?: { delay?: number };
	start?: string;
	local?: boolean;
	range?: () => { start: number };
	topInset?: number;
}

export interface LiveDraftingOptions {
	gsap: typeof GSAP;
	ScrollTrigger: typeof ST;
	groups: DraftGroup[];
	name?: string;
	accent?: string;
	onAccent?: string;
	handleFill?: string;
	topInset?: number;
	speed?: number;
	hold?: [number, number];
	seed?: number;
}

export interface LiveDrafting {
	refresh(): void;
	destroy(): void;
}

export function createLiveDrafting(options: LiveDraftingOptions): LiveDrafting;
export default createLiveDrafting;
