/** A value Anthony hasn't supplied yet. Render it with <Placeholder> — never invent one. */
export type Missing = { placeholder: string };
export const missing = (placeholder: string): Missing => ({ placeholder });
export const isMissing = (v: unknown): v is Missing =>
	typeof v === 'object' && v !== null && 'placeholder' in v;

export type Link = { label: string; href: string | Missing; handle?: string | Missing };

export type Shot = { src: string; width: number; height: number; label: string; caption: string };

export type BrowserView = {
	type: 'browser';
	label: string;
	addressBar: string;
	/** Fill colour behind the screenshot while it loads (matches the app's own background). */
	background: string;
	shots: Shot[];
	/** Optional phone frame laid over the bottom-right corner of the browser. */
	phoneOverlay?: { src: string; width: number; height: number; alt: string };
};
export type PhonesView = { type: 'phones'; label: string; shots: Shot[] };
export type DiagramBox = { label: string; kind: 'plain' | 'key' | 'soft' | 'data' };
export type DiagramView = {
	type: 'diagram';
	label: string;
	caption: string;
	ariaLabel: string;
	/** Top row calls down into the next; render rows with a connector between them. */
	rows: DiagramBox[][];
};
export type ProjectView = BrowserView | PhonesView | DiagramView;

export type Project = {
	id: string;
	title: string;
	kind: string;
	badges: { label: string; tone: 'live' | 'private' | 'neutral' }[];
	description: string;
	highlights: string[];
	stack: string[];
	links: { label: string; href: string; variant: 'primary' | 'ghost' }[];
	views: ProjectView[];
};
