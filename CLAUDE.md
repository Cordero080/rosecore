# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (runs client :5173 + server :3001 concurrently)
npm run dev

# Client only
npm run client

# Server only
npm run server

# Build for production
cd client && npm run build

# Lint
cd client && npm run lint
```

## Architecture

### Monorepo Structure
npm workspaces with two package roots: `client/` (React/Vite) and `server/` (Express). The `api/` directory is **not** a workspace — it lives at the repo root and is consumed directly by Vercel as serverless function handlers.

### Dual Backend — Critical Distinction
There are two separate implementations of the API:

| | `server/routes/` | `api/` |
|---|---|---|
| **Used when** | Local dev (`npm run dev`) | Production (Vercel) |
| **Entry** | `server/index.js` → Express router | `api/chat.js`, `api/ical.js` as serverless handlers |
| **Chat logic** | keyword → date parse → OpenAI (property data from Google Sheets via `server/lib/getSheetData.js`) | All property data, local knowledge, and the personality prompt are **hardcoded** in `api/chat.js` — no Sheets integration |

**When changing chat or calendar behavior, you must update both** `server/routes/chat.js` and `api/chat.js` (or `server/routes/ical.js` and `api/ical.js`) to keep local and production in sync.

### Chat Request Pipeline
Each incoming message goes through these stages in order (in both `server/routes/chat.js` and `api/chat.js`):
1. **Availability path** — if the message contains date references or availability keywords, parse dates and check against the iCal feed. Short-circuit and return.
2. **Keyword matching** — scan the `responses` object for category keyword hits (greeting, pricing, amenities, check-in/out, pets, location, rooms, contact). First match wins.
3. **OpenAI fallback** — `askAI()` in `server/lib/openaiChat.js` (dev) or the inline equivalent in `api/chat.js` (prod). `gpt-4o-mini`, `max_tokens: 300`.

Language is detected from the message text itself (Spanish/French marker lists), not from a UI locale header.

### Server Lib Utilities (`server/lib/`)
Shared helpers used by the Express routes (not available to Vercel functions):
- `getBlockedDates.js` — fetches iCal feed, returns blocked date strings (`YYYY-MM-DD`). Falls back to a hardcoded mock array when `ICAL_URL` is unset.
- `chatHistory.js` — saves `(sessionId, userMessage, reply)` to MongoDB Atlas.
- `getSheetData.js` — fetches property data from a Google Sheet using a service account.
- `openaiChat.js` — GPT-4o-mini fallback; builds system prompt from live sheet data + live blocked dates.

### Client → API Connection
```js
// ChatWidget.jsx — DEV hits Express directly, PROD uses Vercel rewrites
const CHAT_URL = import.meta.env.DEV ? 'http://localhost:3001/api/chat' : '/api/chat'
```
`vercel.json` rewrites `/api/*` → `api/*.js` serverless functions (10s max duration) and `/((?!api/).*)` → `index.html` for SPA routing.

### Routing
React Router v7 with `BrowserRouter`. Routes: `/` (HomePage), `/gallery`, `/beaches`, `/excursions`, `/amenities`, `/about`, `/contact`. All served by the same `index.html` via Vercel SPA rewrite.

### Styling System
- **Tokens**: `client/src/styles/tokens.scss` — all CSS custom properties (colors, fonts, metal recipe, glass recipe)
- **Global**: `client/src/styles/global.scss` — reset, base font, background image
- **Responsive**: `client/src/styles/_responsive.scss` — breakpoint mixins (`mobile` 480px, `tablet` 768px) + all mobile overrides
- **Components**: Plain `.css` file per component (not SCSS)
- **Full-bleed pattern**: Sections that extend under the 60px sidenav use `margin-left: -60px; width: calc(100% + 60px)`, reset to `margin-left: 0; width: 100%` at `@include tablet`

### Multilingual
`react-i18next` with locale files at `client/src/i18n/locales/{en,es,fr}.json`. Language detected from `localStorage` → browser navigator. The `lang` value is passed in the chat POST body so the AI responds in the correct language.

**When adding any new UI string, add the key to all three locale files** (`en.json`, `es.json`, `fr.json`). Missing keys silently fall back to the key name.

### Environment Variables
Set in `server/.env` for local dev, in Vercel dashboard for production:
- `OPENAI_API_KEY` — GPT-4o-mini for chat
- `ICAL_URL` — Airbnb iCal feed for availability
- `MONGO_URI` — MongoDB Atlas for chat history
- `GOOGLE_CREDENTIALS` — Google service account JSON for Sheets property data
- `GOOGLE_SHEET_ID` — Sheet ID for property data
