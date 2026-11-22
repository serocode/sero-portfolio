// Re-captures docs/screenshots/ (the images in README.md) from a running build.
// Usage: pnpm build && pnpm preview --port 4173, then `pnpm shots` (BASE_URL overrides the address).
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from '@playwright/test';

const base = process.env.BASE_URL ?? 'http://localhost:4173';
const out = fileURLToPath(new URL('../docs/screenshots/', import.meta.url));
mkdirSync(out, { recursive: true });

// Same as tests/smoke.spec.ts: headless Chrome draws WebGL with SwiftShader, which
// `hardwareWebGL()` treats as no GPU — report a hardware renderer so the 3D paths run.
const fakeGpu = () => {
	for (const C of [WebGLRenderingContext, WebGL2RenderingContext]) {
		const get = C.prototype.getParameter;
		C.prototype.getParameter = function (p) {
			return p === 0x9246 ? 'Test GPU' : get.call(this, p);
		};
	}
};
const skipIntro = () => sessionStorage.setItem('intro-seen', '1');
// Live drafting's overlay (boxes + labels drawn over each section) would otherwise be in every shot.
const hideDrafting = () =>
	document.addEventListener('DOMContentLoaded', () => {
		const style = document.createElement('style');
		style.textContent = '.hx-layer, svg.hx { display: none !important; }';
		document.head.append(style);
	});
const setTheme = (theme) => localStorage.setItem('theme', theme);

const desktop = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const phone = {
	...devices['Pixel 7'],
	viewport: { width: 390, height: 844 },
	deviceScaleFactor: 2
};

const browser = await chromium.launch();

async function open(ctxOptions, { theme = 'light', intro = false, viewport } = {}) {
	const context = await browser.newContext({ ...ctxOptions, ...(viewport ? { viewport } : {}) });
	await context.addInitScript(fakeGpu);
	await context.addInitScript(hideDrafting);
	await context.addInitScript(setTheme, theme);
	if (!intro) await context.addInitScript(skipIntro);
	const page = await context.newPage();
	return { context, page };
}

const settle = (page, ms = 3500) => page.waitForTimeout(ms);

async function goTo(page, id) {
	await page.evaluate(
		(id) => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }),
		id
	);
	await settle(page);
}

async function shot(page, name) {
	await page.screenshot({ path: `${out}${name}.jpg`, type: 'jpeg', quality: 82 });
	console.log(`✔ ${name}.jpg`);
}

// Desktop, light: hero + each section.
{
	const { context, page } = await open(desktop);
	await page.goto(`${base}/?nostranger`, { waitUntil: 'networkidle' });
	await settle(page, 4500);
	await shot(page, 'hero-light');
	for (const id of ['about', 'approach', 'skills', 'contact']) {
		await goTo(page, id);
		await shot(page, id);
	}
	await context.close();
}

// Projects at 1440×1000, turned to the second card like the original shot.
{
	const { context, page } = await open(desktop, { viewport: { width: 1440, height: 1000 } });
	await page.goto(`${base}/?nostranger`, { waitUntil: 'networkidle' });
	await goTo(page, 'projects');
	const next = page.locator('#projects').getByRole('button', { name: /next/i }).first();
	if (await next.isVisible().catch(() => false)) {
		await next.click();
		await settle(page, 2500);
	}
	await shot(page, 'projects');
	await context.close();
}

// Desktop, dark hero.
{
	const { context, page } = await open(desktop, { theme: 'dark' });
	await page.goto(`${base}/?nostranger`, { waitUntil: 'networkidle' });
	await settle(page, 4500);
	await shot(page, 'hero-dark');
	await context.close();
}

// Intro loader, caught mid-play.
{
	const { context, page } = await open(desktop, { intro: true });
	await page.goto(`${base}/?nostranger`);
	await page.waitForTimeout(700);
	await shot(page, 'loader');
	await context.close();
}

// Theme switch, caught mid-transition.
{
	const { context, page } = await open(desktop);
	await page.goto(`${base}/?nostranger`, { waitUntil: 'networkidle' });
	await settle(page, 4500);
	await page
		.getByRole('button', { name: /theme|dark/i })
		.first()
		.click();
	await page.waitForTimeout(520);
	await shot(page, 'theme-switch');
	await context.close();
}

// Phones.
{
	const { context, page } = await open(phone);
	await page.goto(`${base}/?nostranger`, { waitUntil: 'networkidle' });
	await settle(page, 4500);
	await shot(page, 'mobile-hero');
	await goTo(page, 'approach');
	await shot(page, 'mobile-approach');
	await context.close();
}
{
	const { context, page } = await open(phone, { theme: 'dark' });
	await page.goto(`${base}/?nostranger`, { waitUntil: 'networkidle' });
	await settle(page, 2500);
	await page.getByRole('button', { name: 'Open menu' }).click();
	await settle(page, 1200);
	await shot(page, 'mobile-menu-dark');
	await context.close();
}

await browser.close();
