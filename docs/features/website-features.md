# Website Features — La Dolce Vita Beach Rental

This document covers every visual, interactive, and structural feature of the website — outside of the AI chatbot (see [ai-chatbot.md](ai-chatbot.md)).

---

## Architecture

### React Single-Page Application (SPA)

- Built with React 18 + React Router
- Bundled with Vite for fast dev and optimized production builds
- Six routes: Home (`/`), Gallery (`/gallery`), Amenities (`/amenities`), About (`/about`), Contact (`/contact`), Beaches (`/beaches`)
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
- **File:** `client/src/styles/tokens.scss`

> **Attracts employers:** Demonstrates design-system thinking — not just picking colors, but building a coherent, maintainable token system.

### Brushed Aluminum Metal Style

- Consistent `--metal-bg`, `--metal-border`, `--metal-shadow` tokens applied across interactive elements
- Used on: calendar navigation buttons, chat send button, gallery lightbox buttons, gallery expand button
- 135° gradient of cool grays + inset highlights + subtle shadows
- Creates a cohesive premium hardware feel across the entire UI

> **Attracts clients:** The metallic treatment gives interactive elements a tactile, physical quality that feels premium and intentional — not just "colored buttons."

### Premium Typography

- Display font: `benton-modern-display` (Adobe Fonts — elegant serif for headlines)
- Body font: `aktiv-grotesk` / `Helvetica Neue` (clean sans-serif for body text)
- Label font: monospace-adjacent for eyebrows and counters
- Intentional typographic contrast: serif display + sans-serif body for luxury/hospitality feel

> Standard for hospitality sites, but the specific pairing is well-chosen.

### Glassmorphism

- `rgba(255,255,255,0.6)` + `backdrop-filter: blur(20px)` applied to card surfaces
- Used on: chat widget panel, chat bubbles (bot), calendar card
- Creates a frosted-glass layering effect over the background photo

### Responsive Design

- Dedicated `_responsive.scss` with breakpoints (mobile ≤480px, tablet ≤768px, desktop ≥1024px, wide ≥1280px)
- Mobile-first with progressive enhancement
- Hamburger navigation on mobile, side rail on desktop
- **File:** `client/src/styles/_responsive.scss`

> Standard but complete. No breakpoint is ignored.

---

## Hero Section

### Full-Bleed Image Hero

- Full viewport height (100vh) hero with fixed background photo (`dolce-1.png`)
- Background photo fixed to `.app-shell` — underlies all sections as a parallax layer
- Gradient veil (warm ambers/blues, ~0.65 opacity) over the photo
- Hero `::after` fades to `#f5f7fa` over the bottom 35% — smooth transition into content

### SVG Tongue Transition

- Custom SVG wave shape at the bottom of the hero
- Creates a smooth visual transition from hero to the availability calendar section below
- Organic, flowing curve — not a hard edge or diagonal clip

> **Innovative:** Most hero sections end with a hard edge or a basic diagonal clip. The SVG tongue gives the page a premium, editorial feel that's rare outside of agency sites.

### Hero CTAs

- "Check Availability" — smooth scrolls to the calendar section
- "Explore the Property" — navigates to the Gallery page

---

## Availability Calendar

### Live iCal Sync

- Fetches Airbnb's iCal feed in real time via `GET /api/ical`
- Blocked dates shown visually on the calendar grid
- No manual updates needed — always current
- **File:** `server/routes/ical.js`

> **Innovative:** Direct iCal integration in a custom calendar component. Most vacation sites just link to Airbnb. This keeps the guest on the site while showing live data.

### Brushed-Metal Calendar Design

- Calendar styled with the brushed-metal token system
- Visual distinction between available, booked, today, and past dates
- Smooth month-to-month navigation with prev/next buttons
- Legend explaining color coding

> **Attracts clients:** The calendar feels like part of the site, not an embedded third-party widget.

---

## Gallery — Homepage Section

### Ken Burns Effect

- Slow pan-and-zoom animation on gallery images (4 named variants: kb-1 through kb-4)
- Creates cinematic, luxury feel
- Each image gets a different motion direction
- **File:** `client/src/components/Gallery/Gallery.jsx`

> **Attracts clients:** Ken Burns is a film/documentary technique. Using it on property photos makes the gallery feel like a luxury promo video, not a static image grid.

### Crossfade Transitions

- Smooth opacity transitions between images (1.2s ease)
- Outgoing slide fades as the incoming one rises
- Auto-advances every 6 seconds

### Edge Blur Effect

- `backdrop-filter: blur(10px)` applied with a radial mask
- Sharpens the center of each photo, softens the perimeter
- Creates editorial depth — the photo feels like it has a focal plane

> **Innovative:** This is a photography technique (selective focus simulation) applied via CSS. Rare on the web, distinctive on a rental site.

### Scene Transition (Scroll-Driven)

- As the user scrolls down to the gallery, a veil fades out revealing the dark gallery beneath
- Gallery scales subtly from 0.97 → 1.0 as it enters the viewport
- RAF-throttled (requestAnimationFrame) for smooth 60fps performance
- Veil positioned precisely using ResizeObserver on the availability section
- **File:** `client/src/pages/HomePage/HomePage.jsx`

> **Innovative:** The RAF throttling is the key differentiator. Many parallax implementations cause jank/lag. This one is performance-optimized to feel buttery smooth, even on mid-range phones.

---

## Gallery — Dedicated Page (`/gallery`)

### Dual Slideshow Layout

- Two independent slideshow sections: **The Villa · Apt 2** (property photos) and **The Coast** (scenery)
- Property photos appear first, scenery second
- Each slideshow auto-advances every 7 seconds independently
- **File:** `client/src/pages/GalleryPage/GalleryPage.jsx`

### Directional Slide Transitions

- Forward navigation: slide enters from the right (`translateX(40px)` → 0)
- Backward navigation: slide enters from the left (`translateX(-40px)` → 0)
- Direction-aware — the animation matches the user's intent

> Standard directional animation pattern, but adds clear spatial orientation to the gallery.

### Progress Track Navigation

- Horizontal scrubber track between the arrow buttons
- Click anywhere on the track to jump to that proportional position in the gallery
- Animated fill shows current position
- More precise than dot navigation for large photo sets

> **Innovative:** This interaction pattern comes from professional photo editing software (Lightroom, Capture One). It's very rare on vacation rental sites.

### Lightbox Modal

- Full-screen image view on click via expand button (brushed aluminum style)
- Keyboard navigation: left/right arrow keys, Escape to close
- Brushed aluminum buttons for close (✕), previous (←), and next (→)
- Click outside image to close
- Smooth fade-in animation on open
- **File:** `client/src/pages/GalleryPage/GalleryPage.jsx`

### Gallery Manifest

- `galleryManifest.js` defines captions, alt text, labels per image filename
- Single source of truth for gallery content
- Easy to update without touching component code
- **File:** `client/src/pages/GalleryPage/galleryManifest.js`

### Dynamic SEO Metadata

- Gallery page updates `<title>` and meta description on mount
- Restores original values on unmount
- **File:** `client/src/pages/GalleryPage/GalleryPage.jsx`

---

## Chat Widget

### Collapsible Floating Panel

- Fixed bottom-right position
- Teaser bubble: "Hi, I'm Vita — ask me anything!" — dismissible
- Glass-morphism panel with frosted blur
- Smooth open/close transitions (opacity + scale)
- **File:** `client/src/components/ChatWidget/ChatWidget.jsx`

### Resizable Panel (Desktop)

- Drag handle in the top-left corner of the open panel
- Drag to freely resize: 280–800px wide, 360–860px tall
- Panel stays anchored at bottom-right — resizes up and left
- Handle hidden on mobile
- Subtle L-shaped corner indicator, visible on hover

> **Innovative:** User-resizable chat panels are rare even in enterprise chat widgets. Most snap to fixed sizes.

### Chat UI Polish

- Typing indicator: three-dot bounce animation while waiting for response
- URL linkification: bot reply URLs become clickable `<a>` links automatically
- Platinum/brushed metal send button
- Message weight: `font-weight: 450` for legibility on glass backgrounds
- Auto-scroll to latest message
- Session tracking via `crypto.randomUUID()`

### Mobile Behavior

- Panel centered on screen as a modal overlay
- Resize handle hidden
- Full usable height on small screens

---

## SideNav

### Desktop — Hover-to-Expand

- Fixed left rail: 60px collapsed, 180px on hover
- `border-radius: 0 0 100% 0 / 0 0 60% 0` — curved bottom-right corner on both states
- RC → Rosecore brand crossfade on expand
- Side glow hides on expand
- Active page highlighting
- **File:** `client/src/components/SideNav/SideNav.jsx`

### Mobile — Hamburger Menu

- Hamburger button top-left, slides nav in from left
- Staggered item entrance animation (50ms delay per item)
- Overlay dismissal (click outside to close)
- Animated icon transition to ✕ on open

### Navigation Items

- Active: Home, About, Amenities, Beaches, Gallery, Contact
- Disabled (placeholder): Services, Entertainment, Excursions

---

## Pages

### Beaches Page (`/beaches`)

- 7 beaches with sequential IDs (01–07)
- Per-beach: distance from property, travel method, atmospheric description, photo, tag pills
- Tags: Swimming, Sunsets, Cafés, Surfing, etc.
- Distance labels: walking distance → short drive → drive required
- SEO metadata per page
- **File:** `client/src/pages/BeachesPage/`

### Amenities Page (`/amenities`)

- Quick stats grid: 2 Bedrooms, 2 Bathrooms, 4 Max Guests, $130/Night
- Amenities grid (8 items): Private Pool, Beachfront, AC, Kitchen, WiFi, Washer/Dryer, Pets, Parking
- House rules: Check-in 3 PM, Check-out 11 AM, Up to 4 guests, Pets allowed
- **File:** `client/src/pages/AmenitiesPage/`

### About Page (`/about`)

- Property introduction
- Address with Google Maps link
- Recognition: Booking.com 9.7/10, Airbnb 5.0/5
- Nearby beaches quick reference
- Area facts (expat community, languages, food trucks, airports, best seasons)
- **File:** `client/src/pages/AboutPage/`

### Contact Page (`/contact`)

- WhatsApp/phone direct link (+1 704-802-2216)
- Airbnb booking link
- Address + Google Maps link
- Chat widget callout
- **File:** `client/src/pages/ContactPage/`

---

## SEO & Structured Data

### Complete Meta Tag Suite

- Open Graph tags (Facebook, WhatsApp, iMessage previews)
- Twitter Card tags
- Canonical URL
- Hreflang tags (English + Spanish)
- Meta keywords and robots directives
- **File:** `client/index.html`

### JSON-LD Structured Data (Dual Schema)

- **VacationRental** schema — tells Google exactly what this property is
- **LodgingBusiness** schema — enables rich results (star ratings, pricing, location)
- **FAQPage** schema — FAQ section can appear directly in Google search results

> **Attracts employers:** Three overlapping schemas show deep understanding of structured data. The FAQPage schema is particularly clever — it can give the site expanded real estate in search results.

### Sitemap & Robots.txt

- `sitemap.xml` with all routes and lastmod dates
- `robots.txt` allowing full crawling with sitemap reference
- **Files:** `client/public/sitemap.xml`, `client/public/robots.txt`

---

## Production Infrastructure

### Vercel Deployment

- Automatic builds from GitHub pushes
- Custom domain (ladolcevitabeach.com) with SSL
- SPA rewrites in `vercel.json` for client-side routing
- API routes proxied to serverless functions

### Image Optimization

- All images compressed with `sips` (77MB → 31MB)
- Max dimension 1920px, quality 80
- OG image converted from PNG to JPG (3MB → 604KB)
- Organized into `images/` (scenery) and `images/property/` (villa photos)

### CORS Configuration

- Allowed origins: `localhost:5173`, `localhost:5174`, `rose-core.vercel.app`, `ladolcevitabeach.com`, `www.ladolcevitabeach.com`

### Environment-Based Configuration

- API URLs differ between development and production
- Credentials managed via environment variables
- Google Sheets credentials in `server/credentials.json` (gitignored)
