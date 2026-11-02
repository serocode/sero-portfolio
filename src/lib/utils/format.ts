const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

/** 1–9 spelled out ("six"), anything else as digits. */
export const spell = (n: number) => WORDS[n] ?? String(n);

/** Capitalised: "Six". */
export const spellCap = (n: number) => {
	const s = spell(n);
	return s.charAt(0).toUpperCase() + s.slice(1);
};

/** 1 → "01" */
export const pad2 = (n: number) => String(n).padStart(2, '0');

/** Splits "a **b** c" into text / strong parts (no {@html}). */
export const parseEmphasis = (text: string) =>
	text
		.split(/\*\*(.+?)\*\*/g)
		.map((value, i) => ({ value, strong: i % 2 === 1 }))
		.filter((part) => part.value.length > 0);

export const prefersReducedMotion = () =>
	typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
