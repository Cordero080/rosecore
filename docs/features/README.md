# Feature Documentation — La Dolce Vita Beach Rental

This folder documents every feature of the website and AI chatbot, with honest assessments of what's innovative, what's standard, and what matters to guests vs. employers.

---

## Documents

| File                                       | Contents                                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| [ai-chatbot.md](ai-chatbot.md)             | Vita the AI concierge — full chatbot architecture, every feature, and token cost breakdown |
| [website-features.md](website-features.md) | Every visual, interactive, and structural feature of the site                              |

---

## How It Works — The Plain-English Version

### What is Vita?

Vita is a trilingual AI concierge chatbot built into the vacation rental website. A guest opens the chat, types a question in English, Spanish, or French, and gets an instant, personalized answer. It can check live availability, answer property questions, recommend local restaurants, and link directly to the Airbnb booking page.

### The Personality Prompt — Not Just an API Call

Vita isn't a generic chatbot. It has a crafted personality and strict guardrails baked into the system prompt:

**Personality:**
- Warm, witty, Caribbean-relaxed — like a friend who happens to know everything about the property
- Never repeats itself — if a guest asks something similar twice, it rephrases with a fresh angle
- Light humor when it fits, never forced — charming dinner-party host, not a stand-up comedian
- Weaves in local color — the breeze, the ocean, the smell of fresh coffee — so the guest *feels* the place before they arrive
- Auto-detects language (English/Spanish/French) and responds entirely in that language — never asks "what language do you prefer?"

**Guardrails (what Vita is NOT allowed to do):**
- Never invents amenities, prices, or details — it can only use the property data from the Google Sheet and the curated local knowledge
- If the answer isn't in the data, it says "let me connect you with the host" instead of making something up
- Never mentions spreadsheets, databases, or that it's an AI reading data
- Never says "as a concierge" or "as an AI" — it just *is* the concierge
- Always includes the Airbnb booking link when a guest wants to book
- Responses capped at 300 tokens — keeps replies concise, controls costs

**Curated local knowledge built into the prompt:**
- Real beaches with real descriptions (Playa Bonita, Cosón, Las Ballenas, Punta Popy)
- Real restaurants by name (Boulangerie Française, Restaurant Luis, Paco Cabana, Mosquito Bar)
- Real activities (El Limón waterfall, Los Haitises National Park, whale watching seasons)
- Transportation tips, nightlife areas, airport info, weather seasons

This isn't just "I plugged in ChatGPT." The system prompt is ~800 tokens of carefully written personality, rules, and local knowledge — plus the dynamic property data from Google Sheets. The AI reads all of this on every message so it responds in character, with real information, without hallucinating.

### How does it pull data from Google Sheets?

The property owners (non-technical) can't edit code. So all property information — pricing, amenities, house rules, check-in instructions, local recommendations — lives in a Google Sheet.

When a guest sends a message, the server:
1. Pulls the spreadsheet data via the Google Sheets API
2. Caches it for 5 minutes (so we're not hammering the API)
3. Injects it into the AI's system prompt as context

The AI doesn't have hardcoded knowledge — it reads the sheet every time. If the owners change the price from $150 to $200 a night, or add a new restaurant recommendation, the chatbot knows about it within 5 minutes. No code change. No redeploy. They edit a cell and the AI picks it up.

### Why is it efficient? The 3-tier pipeline

Not every message goes to OpenAI. That's the obvious approach — and it's expensive and slow. Instead, messages flow through three tiers:

**Tier 1 — Date Parsing (free, instant).** If the guest types "are you available March 15 to 20?", a custom date parser extracts the dates — no AI involved — and checks them against the live Airbnb calendar via iCal. The guest gets an instant answer with a booking link.

**Tier 2 — Keyword Matching (free, instant).** If it's a common question like "how much per night?" or "do you allow pets?" — in English, Spanish, or French — keywords are matched and a canned answer is returned from the property data. No API call needed.

**Tier 3 — GPT-4o-mini (pennies, ~1 second).** Only if the message doesn't match tiers 1 or 2 does it go to OpenAI. This handles genuinely unique questions like "what's the best beach for kids?" or "can you recommend a day trip?"

**The result:** ~70% of messages never hit OpenAI. The whole chatbot costs roughly **3 cents per month** at normal traffic. And common questions are answered *faster* because there's no API round-trip.

### Why not just use ChatGPT for everything?

Anyone can call the OpenAI API — that's 10 lines of code. The interesting engineering decision was knowing when NOT to use it. If 500 guests ask "how much per night?", paying OpenAI to answer the same question 500 times is wasteful. The tiered approach delivers AI quality where it matters and instant free responses everywhere else. It scales without the cost scaling with it.

### One-liner

> A trilingual AI concierge that pulls live data from Google Sheets and Airbnb, answers 70% of questions without AI for zero cost, and only escalates to GPT when it actually needs to think.

---

## Quick Feature Inventory

### Genuinely Innovative (Rare in Vacation Rental Sites)

| #   | Feature                                    | Why It's Innovative                                                                            |
| --- | ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| 1   | **3-tier chatbot pipeline**                | The decision to NOT send everything to GPT is more interesting than the decision to use GPT at all. Anyone can call an API in 10 lines. This pipeline intercepts 70%+ of messages before they reach OpenAI — instant responses, zero cost, and it scales without the bill scaling with it. That's a cost/performance tradeoff, and those are the decisions that separate junior devs from engineers who've thought about production. |
| 2   | **Google Sheets → AI knowledge pipeline**  | Non-technical property owners update a spreadsheet → the chatbot automatically absorbs the changes into its personality and knowledge. No redeploy, no code change, no CMS. This solves a real problem in a way that's rare even in production chatbots. |
| 3   | **Natural language dates + live iCal in chat** | A guest types "March 15-20" in a chat bubble and gets real-time Airbnb availability with a booking link. That interaction — conversational input → calendar API → actionable response — is genuinely novel for a rental site. Most competitors have a separate calendar page you have to go find. |

### Well-Crafted (Not Innovative, But Shows Skill)

These aren't inventions — they're well-executed implementations of known patterns. But they demonstrate craft, attention to detail, and production-quality thinking.

| Feature                    | Honest Assessment                                                                 |
| -------------------------- | --------------------------------------------------------------------------------- |
| SVG tongue hero transition | Looks great, but SVG section dividers are common in modern templates. It's a polished design choice, not an invention. |
| Photo scrubber track       | Nice UX, but gallery scrubbers ship with most lightbox libraries. Custom-building it shows skill, but the pattern exists everywhere. |
| RAF-throttled parallax     | That's the *correct* way to do scroll effects. It would be a bug if you didn't use RAF. Good practice ≠ innovation. |
| Dual backend               | Smart resilience, but it's a pragmatic workaround for Render's cold starts, not an architectural breakthrough. |
| Trilingual keywords        | Great product thinking for Las Terrenas' market, but technically it's three arrays of strings. |
| Ken Burns gallery          | Cinematic feel for property photos — effective, not novel.                         |
| JSON-LD structured data    | Three overlapping schemas (VacationRental, LodgingBusiness, FAQPage) — thorough, standard practice. |
| MongoDB chat logging       | Good data pipeline thinking — standard in any production system.                  |
| PWA / installable          | Rare for rentals, common in modern web apps.                                      |

### Standard but Complete

| Feature                    | Note                                                                 |
| -------------------------- | -------------------------------------------------------------------- |
| React SPA + Vite           | Clean setup, well-structured                                         |
| Responsive design          | Mobile-first, no breakpoint gaps                                     |
| Open Graph / Twitter Cards | Complete and correct                                                 |
| Lightbox with keyboard nav | Standard but smooth                                                  |
| Image compression          | Thorough — every image optimized                                     |

---

## Who Cares About What?

### If you're a **guest** looking to book

The features that directly improve your experience:

- 💬 Chat with Vita in English, Spanish, or French and get instant answers
- 📅 Ask about dates in plain language — no forms to fill out
- 🔗 Get a direct booking link when dates are available
- 📸 Browse a beautiful gallery that feels like a magazine
- 📱 Install the site on your phone like an app
- 📆 Check real-time availability without leaving the site

### If you're an **employer** evaluating this project

The features that demonstrate engineering skill:

- **Architecture:** Dual-backend resilience, serverless fallback, environment-based config
- **AI/ML:** Custom NLP date parser, 3-tier response pipeline, dynamic system prompts
- **Data:** Google Sheets API integration, MongoDB logging, iCal parsing
- **Performance:** RAF-throttled animations, image optimization pipeline, 5-minute caching
- **Design systems:** 50+ design tokens, component-based SCSS, consistent visual language
- **SEO:** Three JSON-LD schemas, hreflang, dynamic meta tags, sitemap, robots.txt
- **DevOps:** Vercel + Render, automatic builds, custom domain with SSL
- **Documentation:** Feature docs, setup logs, cost analysis — you're reading it

---

## Cost to Run

The entire site costs effectively **$0/month** at low-to-medium traffic:

| Service                   | Cost                          |
| ------------------------- | ----------------------------- |
| Vercel (frontend hosting) | Free tier                     |
| Render (backend server)   | Free tier                     |
| OpenAI GPT-4o-mini        | ~$0.03/month at 500 messages  |
| MongoDB Atlas             | Free tier (512MB)             |
| Google Sheets API         | Free                          |
| Namecheap domain          | ~$9/year                      |
| **Total**                 | **~$9/year + pennies for AI** |

See [ai-chatbot.md](ai-chatbot.md) for detailed token cost breakdown.
