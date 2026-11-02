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
