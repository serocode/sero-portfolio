/**
 * The hero comet's live page position, written by hero-scene.ts every frame and read by the
 * live-drafting effect (LiveDrafting.svelte) as the launch point of the hero's and About's first
 * cursor.
 */
export const comet: { x: number; y: number; ready: boolean } = { x: 0, y: 0, ready: false };
