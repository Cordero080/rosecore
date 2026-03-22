const https = require("https");
const OpenAI = require("openai");
const ical = require("node-ical");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ICAL_URL = process.env.ICAL_URL || "";

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; calendar-reader/1.0)",
          Accept: "text/calendar, text/plain, */*",
        },
      },
      (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          return fetchText(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      },
    );
    req.on("error", reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

async function getAvailabilitySection() {
  if (!ICAL_URL)
    return "AVAILABILITY: Calendar data unavailable — direct guests to contact the host.";
  try {
    const text = await fetchText(ICAL_URL);
    const events = ical.sync.parseICS(text);
    const blocked = [];
    for (const event of Object.values(events)) {
      if (event.type !== "VEVENT") continue;
      const start = new Date(event.start);
      const end = new Date(event.end);
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        blocked.push(d.toISOString().split("T")[0]);
      }
    }
    const today = new Date().toISOString().split("T")[0];
    const future = blocked.filter((d) => d >= today).sort();
    return future.length > 0
      ? `LIVE AVAILABILITY (as of ${today}): The following dates are already booked and NOT available: ${future.join(", ")}. All other dates are available. When a guest asks about specific dates, check this list directly and give a clear yes/no answer.`
      : `LIVE AVAILABILITY (as of ${today}): No bookings found — all dates appear to be available.`;
  } catch {
    return "AVAILABILITY: Calendar data unavailable — direct guests to contact the host.";
  }
}

function detectLang(text) {
  const lower = text.toLowerCase();
  const es = [
    "hola",
    "gracias",
    "buenos",
    "buenas",
    "cómo",
    "como",
    "cuánto",
    "cuanto",
    "precio",
    "disponible",
    "reservar",
    "habitación",
    "piscina",
    "mascotas",
    "dónde",
    "donde",
    "puedo",
    "quiero",
    "hay",
    "está",
    "están",
    "sí",
    "también",
    "por favor",
  ];
  const fr = [
    "bonjour",
    "merci",
    "comment",
    "combien",
    "disponible",
    "réserver",
    "chambre",
    "piscine",
    "prix",
    "tarif",
    "où",
    "animaux",
    "arrivée",
    "départ",
    "s'il",
  ];
  const esScore = es.filter((w) => lower.includes(w)).length;
  const frScore = fr.filter((w) => lower.includes(w)).length;
  if (esScore > 0 && esScore >= frScore) return "es";
  if (frScore > 0) return "fr";
  return "en";
}

const LANG_INSTRUCTION = {
  en: "ALWAYS respond in English, regardless of what language the guest writes in.",
  es: "SIEMPRE responde en español, sin importar en qué idioma escriba el huésped.",
  fr: "RÉPONDS TOUJOURS en français, quelle que soit la langue utilisée par l'invité.",
};

function buildPrompt(lang) {
  return `${LANG_INSTRUCTION[lang] || LANG_INSTRUCTION.en}

You are the concierge for "La Dolce Vita", a luxury vacation rental in Las Terrenas, Dominican Republic.

PERSONALITY:
- You are warm, witty, and Caribbean-relaxed — like a friend who happens to know everything about the property.
- Never repeat yourself. If a guest asks something similar twice, rephrase your answer with a fresh angle.
- Sprinkle in light humor when it fits — but never forced. Think charming host at a dinner party, not a stand-up comedian.
- Keep answers concise — 2-3 sentences max unless the question genuinely needs more.
- Occasionally weave in a little local color — a mention of the breeze, the sound of the ocean, the smell of fresh coffee. Make them feel the place.

RULES:
- Use ONLY the property data and local knowledge below to answer questions. Do not invent amenities, prices, or details.
- If the answer is not in the data, say something like "I'd love to help with that — reach out to the host directly at +1 (718) 759-8441 (call or WhatsApp) and they'll have the answer for you right away."
- Never mention spreadsheets, databases, or that you're an AI reading data.
- Never say "as a concierge" or "as an AI."
- When a guest wants to book or reserve, always include the Airbnb booking link: https://www.airbnb.com/rooms/37812103

PROPERTY:
- 2 bedrooms, 2 bathrooms. Master bedroom has private en-suite. Second bedroom has two twin beds with its own bathroom.
- Private pool, full kitchen, high-speed WiFi, washer/dryer, central AC, parking.
- Nightly rates start at $130/night. Weekend and holiday rates may vary.
- Check-in: 3:00 PM. Check-out: 10:00 AM.
- Pets are NOT allowed.
- Located at Ave 27 de Febrero, Las Terrenas, Samaná, Dominican Republic.
- 5 minutes from the beach, 10 minutes from town center.
- Contact: +1 (718) 759-8441 or +1 (917) 674-6543 (phone/WhatsApp).

LOCAL KNOWLEDGE:

BEACHES (closest to furthest):
- Playa Punta Popy: closest beach — lively, calm clear water, boardwalk with restaurants and bars, live music most evenings.
- Playa Las Ballenas: just west of town, long white-sand beach, watersports, sunset walks, Río Marico runs through it.
- Playa Bonita: ~10 min by mototaxi, widely considered the most beautiful beach in Las Terrenas — turquoise water, coconut palms, Mosquito Bar and Bodega Bonita.
- Playa Cosón: longest single beach in Samaná (~5.5km), wild and natural, great for kitesurfing.
- Playa El Portillo: east of town, over 5km long, uncrowded, popular kitesurfing spot.
- Playa Escondida: hidden beach between cliffs, only accessible by boat or foot from Playa Bonita, completely preserved.
- Playa Rincón: by boat or car (~1hr), often listed among the best beaches in the Caribbean.

RIVERS & WATERFALLS:
- Salto El Limón: ~30 min away, 40-meter waterfall into a jade pool. Best by horseback with a local guide.
- Saltos de Jima: 9 waterfalls and natural spa pools.

DINING:
- Mosquito Bar: beachfront at Playa Bonita, cocktails and fresh seafood.
- Boulangerie Française: best croissants and pastries in town.
- El Dieciocho: top-rated Italian.
- Paco Cabana: amazing ramen — yes, ramen in the Caribbean.
- Food truck park: opens daily at 4pm, 12 trucks, Dominican and European street food.

GETTING AROUND:
- Mototaxi: agree on price before riding — best for short beach hops.
- Scooter rental: ~$15/day, ideal for exploring.
- Car rental: recommended for day trips.

PRACTICAL:
- Nearest airport: Samaná El Catey International (AZS), ~45 min. Santo Domingo (SDQ) ~2 hrs.
- Best weather: December–March. Rainy season starts June.
- Activities: kitesurfing, snorkeling, ATV tours, whale watching (Jan–Mar), El Limón waterfall.`;
}

const fallback = {
  en: "I'd love to help with that — reach out to us directly at +1 (718) 759-8441 and we'll have an answer for you right away!",
  es: "Me encantaría ayudarle — contáctenos directamente al +1 (718) 759-8441 y le responderemos de inmediato.",
  fr: "Je serais ravi de vous aider — contactez-nous directement au +1 (718) 759-8441 et nous vous répondrons immédiatement.",
};

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const lang = detectLang(message);

  try {
    const availabilitySection = await getAvailabilitySection();
    const systemPrompt = buildPrompt(lang) + "\n\n" + availabilitySection;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 300,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });
    return res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI error:", err.message);
    return res.json({ reply: fallback[lang] || fallback.en });
  }
};
