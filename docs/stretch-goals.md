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
*"what about the 16th?"* after *"is March 15 available?"*:

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
