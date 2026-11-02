/**
 * Tracks which section is in the middle of the viewport, for the nav's active underline.
 *
 *   const active = new ActiveSection(['about', 'approach', 'projects', 'skills', 'contact']);
 *   onMount(() => active.observe());   // returns a cleanup function
 *   …  class:active={active.current === 'about'}
 */
export class ActiveSection {
	current = $state('');
	#ids: readonly string[];

	constructor(ids: readonly string[]) {
		this.#ids = ids;
	}

	observe() {
		const io = new IntersectionObserver(
			(entries) => {
				// Leaving first, then entering, so a hand-off between neighbours lands on the new one;
				// scrolling back up into the hero (not a nav item) clears the highlight.
				for (const e of entries)
					if (!e.isIntersecting && this.current === e.target.id) this.current = '';
				for (const e of entries) if (e.isIntersecting) this.current = e.target.id;
			},
			{ rootMargin: '-45% 0px -50% 0px' }
		);
		for (const id of this.#ids) {
			const el = document.getElementById(id);
			if (el) io.observe(el);
		}
		return () => io.disconnect();
	}
}
