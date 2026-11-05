import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('..', import.meta.url));
const font = (p) => readFileSync(`${root}node_modules/${p}`).toString('base64');
const sans = font(
	'@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2'
);
const mono = font(
	'@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2'
);

const logo = readFileSync(`${root}static/favicon.svg`).toString('base64');

const html = `<!doctype html><html><head><style>
@font-face { font-family: Sans; src: url(data:font/woff2;base64,${sans}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: Mono; src: url(data:font/woff2;base64,${mono}) format('woff2'); font-weight: 100 900; }
html, body { margin: 0; width: 1200px; height: 630px; background: #fff; }
body { position: relative; overflow: hidden; font-family: Sans; color: #0d1117; }
.dots { position: absolute; right: -40px; top: -40px; width: 520px; height: 520px;
  background-image: radial-gradient(#e3e6ea 2px, transparent 2.4px); background-size: 22px 22px; }
.inner { position: absolute; inset: 0; padding: 72px 88px; display: flex; flex-direction: column; }
.brand { display: flex; align-items: center; gap: 16px; }
.mark { width: 112px; height: 112px; display: block; }
h1 span { color: #f97316; }
h1 { margin: auto 0 0; font-size: 104px; font-weight: 700; line-height: .98; letter-spacing: -.045em; }
p { margin: 18px 0 0; font-size: 56px; font-weight: 600; line-height: 1.08; letter-spacing: -.035em; color: #7d8690; }
p span { color: #ea580c; }
.rule { position: absolute; left: 88px; right: 88px; bottom: 56px; height: 2px;
  background: linear-gradient(#f97316, #f97316) left / 56px 2px no-repeat, linear-gradient(#e3e6ea, #e3e6ea) left / 100% 1px no-repeat; }
</style></head><body>
<div class="dots"></div>
<div class="inner">
  <div class="brand"><img class="mark" alt="" src="data:image/svg+xml;base64,${logo}"></div>
  <h1>Anthony Serojales<span>.</span></h1>
  <p>Building thoughtful <span>digital experiences.</span></p>
</div>
<div class="rule"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
	viewport: { width: 1200, height: 630 },
	deviceScaleFactor: 1
});
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: `${root}static/og-image.png`, type: 'png' });
await browser.close();
console.log('wrote static/og-image.png');
