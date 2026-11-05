import type { Action } from 'svelte/action';

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
