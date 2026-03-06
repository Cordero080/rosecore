# Rosecore — Stretch Goals

Ordered by priority.

---

## 1. "Reserve Your Stay" Button

**Status:** Placeholder (`href="#"` scrolls to top)
**Location:** `client/src/pages/HomePage/HomePage.jsx:79`

**Options:**

- Link to Airbnb listing (new tab) — simplest, just needs the URL
- Open the chat widget — triggers bot so user can ask about dates
- Smooth-scroll to the availability calendar

**Decision:** pending

---

## 2. Property Details in Chatbot

**Status:** Not started
**Location:** `server/routes/chat.js` — `responses` object

Expand keyword responses with real property info:

- Bedrooms / capacity / layout
- House rules (quiet hours, no smoking, etc.)
- Nearby beaches, restaurants, activities
- Parking, airport transfer, etc.

Low effort — just add entries to the `responses` object.

---

## 3. Conversational Context

**Status:** Not started

Currently every chat message is stateless. To support follow-ups like
_"what about the 16th?"_ after _"is March 15 available?"_:

- `ChatWidget` sends full message history with each request
- `/api/chat` resolves date/topic references from prior turns
- Backend change: accept `{ message, history }` instead of `{ message }`

---

## 4. Real Property Photos

**Status:** Not started
**Location:** `client/src/assets/images/` + `client/src/components/Gallery/Gallery.jsx`

Replace current gallery images with actual La Dolce Vita apartment photos.
Consider optimizing images (WebP, proper sizing) before adding.

---

## 5. First Nav Page

**Status:** Not started
**Location:** `client/src/components/SideNav/SideNav.jsx` — disabled items

Build out at least one of:

- **Amenities** — pool, kitchen, WiFi, AC details with visuals
- **Services** — concierge, cleaning, transfers
- **Beaches** — nearby beaches with descriptions/photos
- **Excursions** — local activities

Pattern to follow: `client/src/pages/GalleryPage/` as reference for page structure.

---

## 6. Google Analytics / Search Console

**Status:** Not started

Set up tracking to monitor traffic and indexing:

- Create a Google Analytics 4 (GA4) property
- Add the GA4 measurement ID (`G-XXXXXXXXXX`) script tag to `client/index.html`
- Set up Google Search Console and verify domain ownership
- Submit `sitemap.xml` (already created at `client/public/sitemap.xml`)
- Monitor: indexing status, search queries, click-through rates

---

## 7. Contact Page — Email Address

**Status:** Not started
**Location:** `client/src/pages/ContactPage/ContactPage.jsx` — comment marked `{/* Email — stretch goal */}`

Add an email contact row once the address is ready:

```jsx
<li className="contact-row">
  <span className="contact-row-label">Email</span>
  <span className="contact-row-dash" />
  <a className="contact-row-value" href="mailto:YOUR@EMAIL.com">YOUR@EMAIL.com</a>
</li>
```

---

## 8. Contact Page — Booking.com Link

**Status:** Not started
**Location:** `client/src/pages/ContactPage/ContactPage.jsx` — comment marked `{/* Booking.com — stretch goal */}`

Add once the Booking.com property URL is confirmed:

```jsx
<li className="contact-row">
  <span className="contact-row-label">Booking.com</span>
  <span className="contact-row-dash" />
  <a className="contact-row-value" href="YOUR_BOOKING_URL" target="_blank" rel="noopener noreferrer">
    View listing ↗
  </a>
</li>
```

Also consider adding the 9.7/10 Booking.com recognition to the About page recognition block once the link is confirmed.

---

## 9. Accessibility — Image Alt Text

**Status:** Not started

Audit all `<img>` tags across the React app and add descriptive `alt` attributes:

- `client/src/components/Gallery/Gallery.jsx`
- `client/src/components/Hero/Hero.jsx`
- `client/src/pages/GalleryPage/GalleryPage.jsx`
- Any other components rendering images

Good alt text improves SEO (Google uses it to understand images) and is required for screen readers.
Example: `alt="Beachfront pool at La Dolce Vita residence"` instead of `alt="pool"`.
