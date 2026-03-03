# Website Features — La Dolce Vita Beach Rental

This document covers every visual, interactive, and structural feature of the website — outside of the AI chatbot (see [ai-chatbot.md](ai-chatbot.md)).

---

## Architecture

### React Single-Page Application (SPA)

- Built with React 18 + React Router
- Bundled with Vite for fast dev and optimized production builds
- Two routes: Home (`/`) and Gallery (`/gallery`)
- **Why SPA?** Smooth page transitions, no full-page reloads, feels like a native app

> Standard approach — but well-suited for a property showcase where seamless transitions matter more than deep page SEO.

### Dual Backend Strategy

- **Primary:** Express server on Render (full features: chat, calendar, Google Sheets, MongoDB)
- **Fallback:** Vercel serverless functions (lightweight keyword chat + iCal proxy)
- **Why two?** Render's free tier spins down after inactivity. The Vercel functions ensure the site never feels broken.

> **Innovative:** Most portfolio projects have a single backend. This dual-backend approach shows production thinking — graceful degradation instead of downtime.

### PWA Configuration

- Registered service worker
- Web app manifest with icons
- Installable on mobile home screens
- Offline-capable shell

> Standard for modern web apps, but rare for vacation rental sites. Guests can "install" the site like an app.

---

## Visual Design — The "Numen-Src" Design System

### Design Tokens

- 50+ CSS custom properties in `tokens.scss`
- Covers colors, typography, spacing, shadows, borders, gradients
- Brushed-metal aesthetic with gold accents

> **Attracts employers:** Demonstrates design-system thinking — not just picking colors, but building a coherent, maintainable token system.

### Premium Typography

- Primary: Cormorant Garamond (elegant serif — headings)
- Secondary: Lato (clean sans-serif — body text)
- Intentional font pairing for luxury/hospitality feel

> Standard for hospitality sites, but the specific pairing is well-chosen.

### Responsive Design

- Dedicated `_responsive.scss` with breakpoints
- Mobile-first approach with progressive enhancement
- Hamburger navigation on mobile, side rail on desktop

> Standard but complete. No breakpoint is ignored.

---

## Hero Section

### Full-Bleed Video/Image Hero

- Full viewport height (100vh) hero with background image
- Overlaid text with gradient backdrop for legibility
- Smooth scroll indicator

### SVG Tongue Transition

- Custom SVG wave shape at the bottom of the hero
- Creates a smooth visual transition from hero to content
- Not a simple straight border — an organic, flowing curve

> **Innovative:** Most hero sections end with a hard edge or a basic diagonal clip. The SVG tongue gives the page a premium, editorial feel that's rare outside of agency sites.

---

## Availability Calendar

### Live iCal Sync

- Fetches Airbnb's iCal feed in real time
- Blocked dates shown visually on the calendar
- No manual updates needed — always current

> **Innovative:** Direct iCal integration in a custom calendar component. Most vacation sites just link to Airbnb. This keeps the guest on the site while showing live data.

### Brushed-Metal Calendar Design

- Calendar styled with the numen-src brushed-metal theme
- Visual distinction between available, booked, and past dates
- Smooth month-to-month navigation

> **Attracts clients:** The calendar feels like part of the site, not an embedded third-party widget.

---

## Gallery — Homepage Section

### Ken Burns Effect

- Slow pan-and-zoom animation on gallery images
- Creates cinematic, luxury feel
- Each image gets subtle, different motion

> **Attracts clients:** Ken Burns is a film/documentary technique. Using it on property photos makes the gallery feel like a luxury promo video, not a static image grid.

### Crossfade Transitions

- Smooth opacity transitions between images
- No jarring cuts or slides

> Standard animation technique, but well-implemented here for the hospitality context.

---

## Gallery — Dedicated Page

### Photo Scrubber Track

- Horizontal scrollable thumbnail strip at the bottom
- Click any thumbnail to jump to that photo
- Visual indicator of current position

> **Innovative:** This interaction pattern comes from professional photo editing software (Lightroom, Capture One). It's very rare on vacation rental sites and gives the gallery a professional photography feel.

### Lightbox with Keyboard Navigation

- Full-screen image view on click
- Arrow key navigation (left/right)
- Escape to close
- Swipe support on mobile

> Standard lightbox behavior, implemented cleanly.

### Dynamic SEO Metadata

- Gallery page updates `<title>` and meta description dynamically
- Each photo category can have its own SEO context
- `galleryManifest.js` provides structured alt text for every image

> **Attracts employers:** Shows attention to SEO beyond the homepage — gallery images are often the most-shared content for rental properties.

### Centralized Gallery Manifest

- `galleryManifest.js` defines every image: path, alt text, category, order
- Single source of truth for gallery content
- Easy to update without touching component code
- **File:** `client/src/pages/GalleryPage/galleryManifest.js`

> Standard data-driven pattern, but well-organized and maintainable.

---

## Scene Transitions & Scroll Effects

### Scroll-Driven Parallax

- Background images move at different speeds on scroll
- Creates depth and immersion
- RAF-throttled (requestAnimationFrame) for smooth 60fps performance

> **Innovative:** The RAF throttling is the key differentiator. Many parallax implementations cause jank/lag. This one is performance-optimized to feel buttery smooth, even on mid-range phones.

### Section Dividers

- Custom visual separators between content sections
- Consistent with the numen-src brushed-metal design system
- **File:** `client/src/components/SectionDivider/`

> Standard component, but consistent with the overall design language.

---

## Navigation

### Side Rail Navigation (Desktop)

- Persistent vertical navigation on the left edge
- Compact, non-intrusive
- Scrolls with the page
- **File:** `client/src/components/SideNav/`

> Standard side-rail pattern, clean implementation.

### Hamburger Menu (Mobile)

- Standard hamburger icon → full-screen menu
- Smooth open/close animations
- Same navigation items as desktop

> Standard mobile navigation.

---

## SEO & Structured Data

### Complete Meta Tag Suite

- Open Graph tags (Facebook, WhatsApp, iMessage previews)
- Twitter Card tags
- Canonical URL
- Hreflang tags (English + Spanish)
- Meta keywords and robots directives
- **File:** `client/index.html`

> Standard SEO — but notably complete. Many rental sites skip hreflang, canonical, or Twitter Cards.

### JSON-LD Structured Data (Dual Schema)

- **VacationRental** schema — tells Google exactly what this property is
- **LodgingBusiness** schema — enables rich results (star ratings, pricing, location)
- **FAQPage** schema — FAQ section can appear directly in Google search results

> **Attracts employers:** Three overlapping schemas show deep understanding of structured data. The FAQPage schema is particularly clever — it can give the site expanded real estate in search results.

### Sitemap & Robots.txt

- `sitemap.xml` with both routes and lastmod dates
- `robots.txt` allowing full crawling with sitemap reference
- **Files:** `client/public/sitemap.xml`, `client/public/robots.txt`

> Standard SEO hygiene, but often skipped on SPA sites.

### Google Search Console Integration

- TXT DNS record for domain verification
- Sitemap submitted to Google
- **Documentation:** `docs/seo-and-domain-setup.md`

> Standard, but documented with reasoning.

---

## Production Infrastructure

### Vercel Deployment

- Automatic builds from GitHub pushes
- Custom domain (ladolcevitabeach.com) with SSL
- SPA rewrites in `vercel.json` for client-side routing
- API routes proxied to serverless functions

> Standard Vercel deployment, well-configured.

### Image Optimization

- All images compressed with `sips` (77MB → 31MB)
- Max dimension 1920px, quality 80
- OG image converted from PNG to JPG (3MB → 604KB)

> Standard optimization, but notably thorough (every single image, not just a few).

### Environment-Based Configuration

- API URLs differ between development and production
- Credentials managed via environment variables
- Google Sheets credentials in `server/credentials.json` (gitignored in production)

> Standard practice, properly implemented.
