import type { Action } from 'svelte/action';

/**
 * Tracks an <img>'s loading state in `data-img`: "loading" → "loaded" | "error".
 * Styles in src/lib/styles/loading.css turn that into a shimmer while loading, a fade-in when
 * loaded, and a quiet fallback tile on error, on the nearest `.img-frame` (which reserves the
 * image's box, so nothing shifts).
 *
 *   <span class="img-frame"><img use:imageState src=… width=… height=… alt=… loading="lazy"></span>
 *
 * Without JS the attribute is never set and the image just shows normally. Also handles images
 * that finished (or failed) before hydration, and `src` swaps on the same element (shot switches).
 */
export const imageState: Action<HTMLImageElement> = (img) => {
	const settle = () => {
		img.dataset.img = img.naturalWidth > 0 ? 'loaded' : 'error';
	};
	const sync = () => {
		if (img.complete) settle();
		else img.dataset.img = 'loading';
	};
	const onLoad = () => {
		img.dataset.img = 'loaded';
	};
	const onError = () => {
		img.dataset.img = 'error';
	};

	sync();
	img.addEventListener('load', onLoad);
	img.addEventListener('error', onError);
	const mo = new MutationObserver(sync);
	mo.observe(img, { attributes: true, attributeFilter: ['src'] });

	return {
		destroy() {
			mo.disconnect();
			img.removeEventListener('load', onLoad);
			img.removeEventListener('error', onError);
		}
	};
};
