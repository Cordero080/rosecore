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
npm workspaces with three package roots: `client/` (React/Vite), `server/` (Express), and `api/` (Vercel serverless functions).

### Dual Backend — Critical Distinction
There are two separate implementations of the API:

| | `server/routes/` | `api/` |
|---|---|---|
| **Used when** | Local dev (`npm run dev`) | Production (Vercel) |
| **Entry** | `server/index.js` → Express router | `api/chat.js`, `api/ical.js` as serverless handlers |
| **Chat logic** | keyword → date parse → OpenAI (property data from Google Sheets via `server/lib/getSheetData.js`) | OpenAI only — property data, local knowledge, and personality prompt are **hardcoded** in `api/chat.js` |

**When changing chat or calendar behavior, you must update both** `server/routes/chat.js` and `api/chat.js` (or `server/routes/ical.js` and `api/ical.js`) to keep local and production in sync.

### Server Lib Utilities (`server/lib/`)
Shared helpers used by the Express routes (not available to Vercel functions):
- `getBlockedDates.js` — fetches iCal feed and returns blocked date strings (`YYYY-MM-DD`). Falls back to a hardcoded mock array when `ICAL_URL` is unset.
- `chatHistory.js` — saves `(sessionId, userMessage, reply)` to MongoDB Atlas.
- `getSheetData.js` — fetches property data from a Google Sheet using a service account.
- `openaiChat.js` — GPT-4o-mini fallback called when no keyword matches in `server/routes/chat.js`.

### Client → API Connection
```js
// ChatWidget.jsx — DEV hits Express directly, PROD uses Vercel rewrites
const CHAT_URL = import.meta.env.DEV ? 'http://localhost:3001/api/chat' : '/api/chat'
```
`vercel.json` rewrites `/api/*` → `api/*.js` serverless functions and `/((?!api/).*)` → `index.html`.

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

### Environment Variables
Set in `server/.env` for local dev, in Vercel dashboard for production:
- `OPENAI_API_KEY` — GPT-4o-mini for chat
- `ICAL_URL` — Airbnb iCal feed for availability
- `MONGO_URI` — MongoDB Atlas for chat history
- `GOOGLE_CREDENTIALS` — Google service account JSON for Sheets property data
- `GOOGLE_SHEET_ID` — Sheet ID for property data
