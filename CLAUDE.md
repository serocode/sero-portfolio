# Anthony Serojales — portfolio (SvelteKit)

Personal developer portfolio. The design is already approved; the job is to build it faithfully in
SvelteKit, not to redesign it.

## Sources of truth (read before changing UI)

- `reference/screens/*.jpg|png` — what each section must look like (desktop, 1440px wide).
- `reference/design-source/Main.dc.html` — the approved desktop page. Inline styles are the spec:
  copy spacing, sizes, radii, colours and copy from it. (`Mobile.dc.html` = phone hero + menu,
  `System.dc.html` = design-system sheet.) Ignore its `{{…}}`, `<sc-for>`, `<sc-if>`, `<x-dc>` and
  `class Component` plumbing — that's the prototype runtime, not something to port.
- `src/lib/content/*.ts` — all copy and data. Components read from here; no copy hard-coded in markup.

## Stack

- SvelteKit 2 + Svelte 5 (runes: `$state`, `$derived`, `$props`, `$effect`), TypeScript strict.
- Tailwind CSS v4 via `@tailwindcss/vite`; tokens live in `src/app.css` (`@theme`), dark overrides in `src/lib/styles/theme.css`. The 820px breakpoint is the
  `desk:` variant (min-width 821px, mobile-first). Element defaults (`a`, `button`, `body`) sit in
  `@layer base` so utilities override them — keep new global element rules there. Use token
  utilities (`text-ink`, `bg-mist`, `border-line`, `text-accent-700`…). Component-specific effects
  (holo card, deck, skills grid) go in scoped `<style>` or `src/lib/styles/*.css`.
- three.js for the hero only, loaded with a dynamic `import()` inside `onMount`.
- Fonts: `@fontsource-variable/schibsted-grotesk`, `@fontsource-variable/jetbrains-mono`.
- `@sveltejs/adapter-vercel`; the whole site is prerendered (`export const prerender = true`).
- pnpm. Biome (`biome.json`) for linting and formatting.

## Non-negotiables

1. **No fabricated content.** Never invent dates, employers, metrics, testimonials, links, emails or
   project claims. Anything missing is a `missing('[…]')` value rendered with `<Placeholder>`
   (violet, dashed underline). Don't "fill in" placeholders with plausible values.
2. **Palette:** white dominant; one accent `#f97316`. Text in accent uses `accent-700` (#c2410c) for
   contrast (large display text may use `accent-600`). No blue/cobalt anywhere.
   **Dark mode:** every colour is a token; dark values live in `src/lib/styles/theme.css` under
   `:root[data-theme='dark']`. Never hard-code a hex in a component — use `surface`, `chip`,
   `strong`, `subtle`, `line-strong`, the `inverse*` set (contact panel, card back, primary buttons,
   logo tile — light in dark mode), `on-accent` for text on orange, and `--shadow-rgb`/`--shadow-k`
   for shadows. Theme state: `src/lib/theme.svelte.ts` (no-flash script in `src/app.html`).
   Logo: `src/lib/brand/Logo.svelte` (outlined paths — never set "AS." in live text).
3. **Accessibility:** semantic landmarks, one `h1`, ordered headings, visible focus ring, 44px
   minimum touch targets, `aria-pressed` on toggles, `aria-live="polite"` on the Skills readout,
   real `alt` text from the data (`caption`). Body text contrast ≥ 4.5:1.
4. **Motion:** everything animated has a `prefers-reduced-motion` path (hero renders one still
   frame; deck becomes a normal stack; no spin; no tilt).
5. **Performance:** images use the `width`/`height` from the data + `loading="lazy"` below the fold;
   three.js not in the initial bundle; pause the WebGL loop when the hero is off-screen (already
   done in `hero-scene.ts`). Lighthouse ≥ 95 on Performance, Accessibility, Best Practices, SEO.
6. **Responsive:** 1440 → 390px with no horizontal scroll. The one breakpoint that changes layout is
   820px (nav → menu button, deck keeps its sticky stack with a tighter stair-step, Approach tabs
   become a wrapping grid, skills columns become 2-letter codes). About alone adds a 700px step
   (card beside text on tablets, stacked on phones).

## Layout

- Content column: `max-width: 1320px; margin: 0 auto; padding-inline: clamp(20px, 5vw, 48px)` (widened from the design's 1120px at Anthony's request).
- Section padding: `clamp(40px, 5vw, 68px)` top/bottom (halved from the design's `clamp(80px, 10vw, 136px)` at Anthony's request).
- Full-screen sections: every `main > section` is at least `100svh` minus the 65px sticky header
  (`--header-h`), content centred vertically, growing when it needs more. The document snaps
  (`scroll-snap-type: y mandatory` on `html`, `proximity` with reduced motion); each section snaps
  `start`, the footer snaps `end`, and `scroll-padding-top: var(--header-h)` keeps snaps and anchor
  jumps exactly under the header. Don't add nested scroll containers or fixed section heights.
- Section label row: mono number in `accent-700` (13px) · uppercase mono label in `muted`
  (12px, 0.14em tracking) · a 240px rule with a 28px accent segment on a 1px `line`.
- h2: `clamp(30px, 4.2vw, 48px)`, weight 600, line-height 1.08, letter-spacing −0.035em, `ink`.

## Commands

- `pnpm dev` · `pnpm check` (svelte-check) · `pnpm build && pnpm preview`
- `pnpm lint` (Biome: lint + format check) · `pnpm format` (Biome, writes fixes) — no Prettier/ESLint
- `pnpm test` (Playwright smoke + axe; builds and serves on :4173) · `pnpm og` (re-render `static/og-image.png`)
