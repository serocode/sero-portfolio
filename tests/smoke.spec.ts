import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const sections = ['about', 'approach', 'projects', 'skills', 'contact'];

/** Collects console errors + uncaught exceptions for the whole test. */
function trackErrors(page: Page) {
	const errors: string[] = [];
	page.on('console', (m) => {
		if (m.type() === 'error') errors.push(m.text());
	});
	page.on('pageerror', (e) => errors.push(String(e)));
	return errors;
}

test('page loads with one h1, every section, and no console errors', async ({ page }) => {
	const errors = trackErrors(page);
	await page.goto('/');
	await expect(page.locator('h1')).toHaveCount(1);
	await expect(page.locator('h1')).toHaveText('Anthony Serojales.');
	for (const id of sections) await expect(page.locator(`#${id}`)).toBeAttached();
	await expect(page.locator('a[href="#"]')).toHaveCount(0);
	await page.waitForTimeout(800);
	expect(errors).toEqual([]);
});

test('nav anchors scroll to each section', async ({ page, isMobile }) => {
	await page.goto('/');
	for (const id of sections) {
		if (isMobile) {
			await page.getByRole('button', { name: 'Open menu' }).click();
			await page
				.locator('#mobile-menu')
				.getByRole('link', { name: new RegExp(id, 'i') })
				.click();
		} else {
			await page
				.getByRole('navigation', { name: 'Primary', exact: true })
				.locator(`a[href="#${id}"]`)
				.click();
		}
		await expect(page.locator(`#${id}`)).toBeInViewport();
		const top = await page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top);
		expect(top).toBeGreaterThanOrEqual(60); // lands under the sticky bar
	}
});

test('mobile menu traps focus and closes on Escape', async ({ page, isMobile }) => {
	test.skip(!isMobile, 'menu is mobile-only');
	await page.goto('/');
	const button = page.getByRole('button', { name: 'Open menu' });
	await button.click();
	await expect(page.locator('#mobile-menu')).toBeVisible();
	await expect(page.locator('#mobile-menu a').first()).toBeFocused();
	for (let i = 0; i < 15; i++) await page.keyboard.press('Tab');
	const inside = await page.evaluate(
		() =>
			!!document.activeElement?.closest('#mobile-menu') ||
			document.activeElement?.getAttribute('aria-controls') === 'mobile-menu'
	);
	expect(inside).toBe(true);
	await page.keyboard.press('Escape');
	await expect(page.locator('#mobile-menu')).toBeHidden();
	await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
});

test('the About card flips by click and keyboard', async ({ page }) => {
	await page.goto('/');
	const card = page.getByRole('button', { name: 'Flip the photo card to see credentials' });
	await card.scrollIntoViewIfNeeded();
	await card.click();
	const back = page.getByRole('button', { name: 'Flip the card back to the photo' });
	await expect(back).toHaveAttribute('aria-pressed', 'true');
	await back.press('Enter');
	await expect(
		page.getByRole('button', { name: 'Flip the photo card to see credentials' })
	).toHaveAttribute('aria-pressed', 'false');
});

test('the card back fits at 240–300px card widths', async ({ page }) => {
	await page.goto('/');
	for (const width of [240, 260, 280, 300]) {
		const overflow = await page.evaluate((w) => {
			const btn = document.querySelector<HTMLElement>('.card-btn');
			if (!btn) return 'no card';
			btn.style.width = `${w}px`;
			const back = btn.querySelector<HTMLElement>('.holo-back');
			if (!back) return 'no back';
			return back.scrollHeight - back.clientHeight;
		}, width);
		expect(overflow, `card back at ${width}px`).toBeLessThanOrEqual(0);
	}
});

test('skills filter changes the readout', async ({ page }) => {
	await page.goto('/');
	const readout = page.locator('#skills [aria-live="polite"]');
	await expect(readout).toContainText('25 tools across 6 projects.');
	const medicore = page.locator('#skills').getByRole('button', { name: 'MediCore' });
	await medicore.focus();
	await page.keyboard.press('Enter');
	await expect(medicore).toHaveAttribute('aria-pressed', 'true');
	await expect(readout).toContainText('MediCore uses 16 of these 25 tools.');
	await page.keyboard.press('Enter'); // selecting it again returns to All
	await expect(readout).toContainText('25 tools across 6 projects.');
});

test('Approach tabs move with arrow keys', async ({ page }) => {
	await page.goto('/');
	const first = page.getByRole('tab').first();
	await first.focus();
	await page.keyboard.press(test.info().project.name === 'mobile' ? 'ArrowRight' : 'ArrowDown');
	await expect(page.getByRole('tab').nth(1)).toBeFocused();
	await expect(page.getByRole('tabpanel')).toContainText('I know the work behind the system.');
});

test('project thumbnails switch shots with arrow keys', async ({ page }) => {
	await page.goto('/');
	const thumbs = page
		.getByRole('list', { name: 'Subpoena Colada screenshots' })
		.getByRole('button');
	await thumbs.first().focus();
	await page.keyboard.press('ArrowRight');
	await expect(thumbs.nth(1)).toBeFocused();
	await expect(thumbs.nth(1)).toHaveAttribute('aria-pressed', 'true');
});

test('no horizontal scroll at common widths', async ({ page }) => {
	for (const width of [1440, 1024, 820, 768, 430, 390, 375, 360]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/');
		const sw = await page.evaluate(() => document.documentElement.scrollWidth);
		expect(sw, `width ${width}`).toBeLessThanOrEqual(width);
	}
});

test('hero: intro sits on two lines on a large desktop; surname carries the accent period', async ({
	page,
	isMobile
}) => {
	test.skip(isMobile, 'desktop layout');
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/');
	const lines = await page
		.locator('main > section')
		.first()
		.locator('p.d3')
		.evaluate((el) =>
			Math.round(
				el.getBoundingClientRect().height / Number.parseFloat(getComputedStyle(el).lineHeight)
			)
		);
	expect(lines).toBe(2);
	const [first, last] = await page
		.locator('#hero-name > span')
		.evaluateAll((els) => els.map((el) => Number.parseFloat(getComputedStyle(el).fontSize)));
	expect(first).toBeLessThan(last * 0.6);
});

test('Approach tabs fit inside the viewport on phones (no sideways scroller)', async ({ page }) => {
	for (const width of [375, 390, 430, 768]) {
		await page.setViewportSize({ width, height: 800 });
		await page.goto('/');
		const list = page.getByRole('tablist', { name: 'Approach topics' });
		expect(await list.evaluate((el) => el.scrollWidth - el.clientWidth), `width ${width}`).toBe(0);
		for (const box of await page
			.getByRole('tab')
			.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()))) {
			expect(box.left, `width ${width}`).toBeGreaterThanOrEqual(0);
			expect(box.right, `width ${width}`).toBeLessThanOrEqual(width);
		}
	}
});

test('project deck stays sticky on phones and the stuck card recedes under the next', async ({
	page,
	isMobile
}) => {
	test.skip(!isMobile, 'phone layout');
	await page.goto('/');
	const cards = page.locator('.deck-card');
	expect(await cards.first().evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
	// Scroll until card 2 overlaps card 1, then card 1 must be scaled down and painted beneath.
	const second = await cards.nth(1).evaluate((el) => el.getBoundingClientRect().top + scrollY);
	await page.evaluate((y) => window.scrollTo(0, y - 300), second);
	await page.waitForTimeout(150);
	expect(await cards.first().evaluate((el) => el.style.transform)).toMatch(/^scale\(0\.9/);
	const nextOnTop = await page.evaluate(() => {
		const [, next] = document.querySelectorAll('.deck-card');
		const y = next.getBoundingClientRect().top + 12;
		return document.elementFromPoint(innerWidth / 2, y)?.closest('.deck-card') === next;
	});
	expect(nextOnTop).toBe(true);
});

test('reduced motion: no spin, flat deck, no smooth scroll', async ({ browser }) => {
	const context = await browser.newContext({
		reducedMotion: 'reduce',
		viewport: { width: 1440, height: 900 }
	});
	const page = await context.newPage();
	await page.goto('/');
	expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
		'auto'
	);
	expect(await page.locator('.spin').evaluate((el) => getComputedStyle(el).animationName)).toBe(
		'none'
	);
	expect(
		await page
			.locator('.deck-card')
			.first()
			.evaluate((el) => getComputedStyle(el).position)
	).toBe('relative');
	await context.close();
});

test('axe: no accessibility violations (default + filtered + flipped)', async ({ page }) => {
	await page.goto('/');
	await page.waitForTimeout(1200); // let entrance animations finish
	const run = async () => (await new AxeBuilder({ page }).analyze()).violations;
	expect(await run()).toEqual([]);
	await page.locator('#skills').getByRole('button', { name: 'Kortex' }).click();
	await page.getByRole('button', { name: 'Flip the photo card to see credentials' }).click();
	await page.waitForTimeout(1000);
	const v = await run();
	expect(v.map((x) => `${x.id}: ${x.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
});

test('footer: centred on phones; back to top scrolls up and returns focus to the header', async ({
	page,
	isMobile
}) => {
	await page.goto('/');
	await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
	const top = page.locator('footer').getByRole('link', { name: 'Back to top' });
	if (isMobile) {
		const offsets = await page.evaluate(() => {
			const f = document.querySelector('footer')?.getBoundingClientRect();
			if (!f) return [];
			return ['.copy', '.socials', '.top'].map((sel) => {
				const r = document.querySelector(`footer ${sel}`)?.getBoundingClientRect();
				return r ? Math.abs(r.left + r.width / 2 - (f.left + f.width / 2)) : 999;
			});
		});
		for (const off of offsets) expect(off).toBeLessThanOrEqual(1);
	}
	await top.click();
	await expect.poll(() => page.evaluate(() => scrollY), { timeout: 3000 }).toBe(0);
	await expect(page.locator('.site-header a').first()).toBeFocused();
});

test('mobile menu fills the screen and every link is tappable', async ({ page, isMobile }) => {
	test.skip(!isMobile, 'menu is mobile-only');
	await page.goto('/');
	await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
	await page.getByRole('button', { name: 'Open menu' }).click();
	const geo = await page.evaluate(() => {
		const panel = document.getElementById('mobile-menu');
		if (!panel) return null;
		const r = panel.getBoundingClientRect();
		const hittable = [...panel.querySelectorAll('ol a')].filter((a) => {
			const b = a.getBoundingClientRect();
			const hit = document.elementFromPoint(b.left + 20, b.top + b.height / 2);
			return !!hit && a.contains(hit);
		}).length;
		return { bottom: r.bottom, vh: innerHeight, hittable };
	});
	expect(geo?.bottom).toBeCloseTo(geo?.vh ?? 0, 0);
	expect(geo?.hittable).toBe(5);
	// The brand link closes the menu and releases the scroll lock.
	await page.locator('.site-header .brand').click();
	await expect(page.locator('#mobile-menu')).toBeHidden();
	expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
});

test('holo card tilts on touch: drag tilts without flipping, device motion tilts', async ({
	page,
	context,
	isMobile
}) => {
	test.skip(!isMobile, 'touch + device motion');
	await page.goto('/');
	const tilt = page.locator('.holo-tilt');
	await tilt.scrollIntoViewIfNeeded();
	const box = await tilt.boundingBox();
	if (!box) throw new Error('no card');
	const y = Math.round(box.y + box.height / 2);
	const x0 = Math.round(box.x + box.width * 0.2);
	const x1 = Math.round(box.x + box.width * 0.85);
	const cdp = await context.newCDPSession(page);
	const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', x?: number) =>
		cdp.send('Input.dispatchTouchEvent', {
			type,
			touchPoints: x === undefined ? [] : [{ x, y }]
		});
	await touch('touchStart', x0);
	for (let k = 1; k <= 8; k++) await touch('touchMove', x0 + ((x1 - x0) * k) / 8);
	expect(await tilt.evaluate((el) => el.style.transform)).toMatch(/rotateY\([1-9]/);
	await touch('touchEnd');
	await expect(page.locator('.card-btn')).toHaveAttribute('aria-pressed', 'false');

	const yaw = await tilt.evaluate(async (el) => {
		const fire = (gamma: number) =>
			window.dispatchEvent(
				new DeviceOrientationEvent('deviceorientation', { alpha: 0, beta: 45, gamma })
			);
		fire(0);
		await new Promise((r) => setTimeout(r, 50));
		fire(15);
		await new Promise((r) => setTimeout(r, 50));
		return Number(/rotateY\((-?[\d.]+)deg\)/.exec(el.style.transform)?.[1] ?? 0);
	});
	expect(yaw).toBeGreaterThan(4);
});

test('dark theme: follows the OS before first paint, toggles, and remembers the choice', async ({
	browser
}) => {
	const context = await browser.newContext({ colorScheme: 'dark' });
	const page = await context.newPage();
	await page.goto('/');
	const root = page.locator('html');
	await expect(root).toHaveAttribute('data-theme', 'dark');
	expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(
		'rgb(11, 15, 20)'
	);
	const toggle = page.getByRole('button', { name: 'Switch to light theme' }).first();
	await toggle.click();
	await expect(root).toHaveAttribute('data-theme', 'light');
	await page.reload();
	await expect(root).toHaveAttribute('data-theme', 'light'); // stored choice beats the OS
	await page.evaluate(() => localStorage.removeItem('theme'));
	await page.reload();
	await expect(root).toHaveAttribute('data-theme', 'dark'); // back to the OS setting
	await context.close();
});

test('axe: no accessibility violations in dark theme (default + filtered + flipped)', async ({
	browser
}) => {
	const context = await browser.newContext({
		colorScheme: 'dark',
		viewport: { width: 1440, height: 900 }
	});
	const page = await context.newPage();
	await page.goto('/');
	await page.waitForTimeout(1200);
	const run = async () =>
		(await new AxeBuilder({ page }).analyze()).violations.map(
			(x) => `${x.id}: ${x.nodes.map((n) => n.target.join(' ')).join(', ')}`
		);
	expect(await run()).toEqual([]);
	await page.locator('#skills').getByRole('button', { name: 'Kortex' }).click();
	await page.getByRole('button', { name: 'Flip the photo card to see credentials' }).click();
	await page.waitForTimeout(1000);
	expect(await run()).toEqual([]);
	await context.close();
});

test('full-screen sections snap under the header; tall sections scroll freely; footer reachable', async ({
	page,
	isMobile
}) => {
	await page.goto('/');
	expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType)).toBe(
		'y mandatory'
	);
	const { min, heights } = await page.evaluate(() => ({
		min: innerHeight - 65,
		heights: [...document.querySelectorAll('main > section')].map(
			(s) => s.getBoundingClientRect().height
		)
	}));
	for (const h of heights) expect(h).toBeGreaterThanOrEqual(min - 1);

	const settle = async () => {
		let last = -1;
		for (let i = 0; i < 30; i++) {
			const y = await page.evaluate(() => scrollY);
			if (Math.abs(y - last) < 0.5) break;
			last = y;
			await page.waitForTimeout(100);
		}
		return page.evaluate(() => scrollY);
	};
	if (!isMobile) {
		// Keyboard paging lands exactly on the next section, under the 65px header.
		await page.keyboard.press('PageDown');
		await settle();
		expect(
			Math.round(await page.locator('#about').evaluate((el) => el.getBoundingClientRect().top))
		).toBe(65);
	}
	// Inside the (taller than the screen) Projects deck, the page can rest mid-section.
	const mid = await page
		.locator('#projects')
		.evaluate(
			(el) => el.getBoundingClientRect().top + scrollY + el.getBoundingClientRect().height * 0.4
		);
	await page.evaluate((y) => {
		document.documentElement.style.scrollBehavior = 'auto';
		window.scrollTo(0, y);
	}, mid);
	expect(Math.abs((await settle()) - mid)).toBeLessThan(2);
	// The bottom of the page (footer) is a snap point too.
	await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
	await settle();
	expect(
		await page.evaluate(() => document.querySelector('footer')?.getBoundingClientRect().bottom ?? 0)
	).toBeLessThanOrEqual(await page.evaluate(() => innerHeight + 1));
});
