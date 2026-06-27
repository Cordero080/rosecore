# Debugging Session — June 26, 2026

**Project:** La Dolce Vita / Rosecore  
**Topics:** Mobile UI fixes, CSS cascade bugs, production/dev parity, code duplication audit

---

## 1. Hamburger button and hero text too small on mobile

### Problem
The mobile hamburger button (44×44px) and hero headline/tagline were too small to be comfortable on phones.

### Files changed
- `client/src/styles/_responsive.scss`

### Solution
Increased the button circle from `44px` to `56px`, scaled the inner icon and rings proportionally, and bumped the `×` close glyph from `18px` to `24px`. Increased hero headline from `clamp(2.4rem, 11vw, 3.5rem)` to `clamp(3rem, 13vw, 4.2rem)` and tagline from `1.1rem` to `1.35rem` inside `@include mobile`.

### What to know for interviews
`clamp(min, preferred, max)` is the idiomatic way to make type fluid across viewport widths — the `vw`-based middle value scales with screen width while the min/max clamp it to readable bounds.

---

## 2. Hero title still too small — CSS cascade override bug

### Problem
After increasing font sizes in `_responsive.scss`, the mobile hero title remained unchanged. The `@include mobile` fix appeared to have no effect.

### Root cause
Two separate files both declared `@media (max-width: 768px)` overrides for `.hero-headline`:

- `_responsive.scss` (`@include mobile` = `max-width: 480px`) set the size to `clamp(3rem, 13vw, 4.2rem)`
- `Hero.css` had its own `@media (max-width: 768px)` block setting `clamp(2.8rem, 10vw, 4rem)`

Because Vite processes global SCSS before component CSS files, `Hero.css` loaded **after** `_responsive.scss`. Since both rules targeted `.hero-headline` with equal specificity and 480px falls inside the 768px media query, `Hero.css` always won — silently overriding the global fix.

### Files changed
- `client/src/components/Hero/Hero.css`

### Solution
Updated the sizes directly in `Hero.css`'s `@media (max-width: 768px)` block:
- Headline: `clamp(3.5rem, 12vw, 5rem)` (was `clamp(2.8rem, 10vw, 4rem)`)
- Tagline: `clamp(1.3rem, 4vw, 1.6rem)` (was missing entirely)

### What to know for interviews
**CSS cascade + load order:** when two rules have the same specificity, the one that appears later in the stylesheet wins. In a Vite/React project, global SCSS files (imported in `main.jsx` or `App.jsx`) are bundled before component CSS files (imported inside the component). This means component styles always beat global overrides at equal specificity — even if the global file contains a narrower media query. The fix is to put component-specific overrides in the component's own CSS file, not in global responsive stylesheets.

**Lesson:** If a CSS change has no visible effect, check whether another file at the same specificity is overriding it downstream in the load order. Browser DevTools → Computed tab will show which rule is actually winning.

---

## 3. Mobile nav links not clickable — overflow:hidden clipping

### Problem
On mobile, "About" (item 2) and "Amenities" (item 3) worked fine when tapping in the nav, but "Beaches" (item 7), "Gallery" (item 8), and "Contact" (item 9) required multiple taps or didn't register at all.

### Root cause
The `.sidenav` has `overflow: hidden` set in `SideNav.css`. The nav list (`.sidenav-list`) also had `padding-bottom: 120px` — a spacer designed for the desktop curved bottom border radius. On phones where the sidenav is `100vh` tall and contains 9 items, the total list height exceeded the sidenav's visible area. Items beyond that boundary were clipped by `overflow: hidden` — rendered outside the box, invisible, and receiving no pointer events.

Items near the top of the list (Home, About, Amenities) were visible and tappable. Items further down (Beaches = position 7, Gallery = 8, Contact = 9) were partially or fully in the clipped region.

Additionally, the staggered entrance animation loop only ran `@for $i from 1 through 8`, leaving the 9th item (Contact) without a delay — it started with `opacity: 0` and no guarantee of animating in correctly.

### Files changed
- `client/src/styles/_responsive.scss`

### Solution
In the `.sidenav.is-open` mobile state:
- Added `overflow-y: auto` to make the nav list scrollable instead of clipped
- Added `overflow-x: hidden` to prevent horizontal bleed
- Changed `border-radius` to a simpler `0 0 20px 0` on mobile (the large elliptical desktop curve was designed for a wider nav)
- Reduced `.sidenav-list` `padding-bottom` from `120px` to `80px` on mobile
- Increased `.sidenav-item` vertical padding from `10px` to `14px` for larger tap targets
- Increased `.sidenav-label` font-size from `0.7rem` to `0.85rem`
- Extended the staggered animation `@for` loop from `1 through 8` to `1 through 9`

### What to know for interviews
`overflow: hidden` clips not just visual rendering but also **pointer events** — elements outside the clipping box cannot receive clicks or taps. This is a common source of "button doesn't work" bugs. The fix is usually either `overflow: auto/scroll` (to make the content scrollable) or adjusting the containing element's size. Always check `overflow` on ancestors when an interactive element appears unresponsive.

---

## 4. Production chat (api/chat.js) diverged from dev in 5 critical ways

### Problem
The Vercel serverless function `api/chat.js` had been maintained separately from `server/routes/chat.js` (the Express dev server). Over time they drifted apart:

| Capability | Dev (`server/routes/chat.js`) | Prod (`api/chat.js` before fix) |
|---|---|---|
| Language detection | 47 ES / 23 FR markers | 14 ES / 15 FR markers |
| Keyword routing | 8 categories, short-circuit before OpenAI | None — every message hit OpenAI |
| Date parsing | Full `parseDates()` with week/range/single | None |
| Available windows | Computed inline, listed for guest | None |
| Chat history | Saved to MongoDB | Not saved |
| Beach knowledge | 11 beaches | 7 beaches |

### Root cause
The dual-backend architecture (Express for dev, serverless for prod) requires manually keeping two files in sync. There was no shared code layer — `fetchText`, `toRanges`, `computeWindows`, and the system prompt were all copy-pasted separately and had drifted.

### Files changed
- `api/chat.js` — full rewrite
- `api/_fetchText.js` — new shared helper
- `api/ical.js` — updated to import shared helper
- `package.json` (root) — added `mongodb` dependency
- `server/lib/chatHistory.js` — removed dead `getChatHistory` export
- `client/src/components/ChatWidget/ChatWidget.jsx` — removed unused `lang` field from POST body
- `vercel.json` — removed no-op `/api/(.*)` rewrite rule
- `server/lib/getBlockedDates.js` — updated stale mock dates

### Solution
Rewrote `api/chat.js` to implement the full three-tier pipeline that dev has:
1. **Availability path** — if message contains dates or availability keywords, parse dates and check against live iCal, return structured response
2. **Keyword match** — scan 8 categories (greeting, pricing, amenities, check-in/out, pets, location, rooms, contact) for keyword hits, return pre-written multilingual reply without hitting OpenAI
3. **OpenAI fallback** — only if neither tier matched, call GPT-4o-mini with the full system prompt

Extracted `fetchText` into `api/_fetchText.js` (underscore prefix tells Vercel not to expose it as a route) so both `api/chat.js` and `api/ical.js` share a single implementation.

### What to know for interviews
**Dual-backend / split deployment pattern:** This project runs Express locally for fast iteration but deploys serverless functions to Vercel for production. The tradeoff is zero-config scaling vs. the cost of maintaining two implementations. The mitigation is a shared utility layer — put everything that can be shared into files that both environments import.

**Dead code as a source of confusion:** `getChatHistory` was exported but never imported anywhere — a developer reading the file might spend time trying to understand when it gets called. Dead exports should be removed when found.

**No-op routing rules:** `{ "source": "/api/(.*)", "destination": "/api/$1" }` in `vercel.json` rewrites a path to itself. Vercel auto-routes `api/*.js` files — this rule was a leftover from early setup that did nothing but add confusion.

---

## 5. Stale mock data in iCal fallback

### Problem
When `ICAL_URL` is not set (local dev without the env var), both `api/ical.js` and `server/lib/getBlockedDates.js` returned hardcoded blocked dates in March 2026 — months in the past. The calendar would show no blocked dates (since past dates are filtered out) and the chat would behave as if the property were fully available, defeating the purpose of the mock.

### Files changed
- `api/ical.js`
- `server/lib/getBlockedDates.js`

### Solution
Updated mock dates to December 2026 so they remain in the future and the calendar renders something useful during local development.

### What to know for interviews
Mock/seed data with hardcoded dates should always use relative dates (e.g., `new Date(Date.now() + 30 * 86400000)`) or be updated when dates pass. Absolute hardcoded dates are a maintenance trap — they silently become wrong as time passes.

---

## Summary of all files changed

| File | Change |
|---|---|
| `client/src/styles/_responsive.scss` | Hamburger size, hero text, nav overflow fix, larger tap targets, animation loop |
| `client/src/components/Hero/Hero.css` | Hero headline and tagline sizes at mobile breakpoint |
| `api/chat.js` | Full rewrite — dev parity (keyword routing, date parsing, language detection, MongoDB, richer prompt) |
| `api/_fetchText.js` | New shared iCal HTTP fetcher |
| `api/ical.js` | Import shared fetchText, updated mock dates |
| `server/lib/getBlockedDates.js` | Updated mock dates |
| `server/lib/chatHistory.js` | Removed dead `getChatHistory` export |
| `client/src/components/ChatWidget/ChatWidget.jsx` | Removed unused `lang` POST field |
| `vercel.json` | Removed no-op `/api/(.*)` rewrite |
| `package.json` (root) | Added `mongodb` dependency for Vercel functions |

---

## Key concepts for interviews

- **CSS specificity + load order:** Same-specificity rules resolve by source order. In Vite, component CSS files load after global SCSS. Component styles win ties — put overrides where they'll win.
- **`overflow: hidden` blocks pointer events** on clipped children — not just visibility, but interactivity.
- **`clamp(min, preferred, max)`** for fluid typography that scales with viewport while staying readable.
- **Dual-backend pattern:** keep a shared utility layer between environments to prevent silent divergence.
- **Dead code signals:** unused exports, ignored POST fields, no-op config rules — each one is a maintenance burden and a source of confusion. Remove them when found during audits.
