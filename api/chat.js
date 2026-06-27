const { fetchText } = require("./_fetchText");
const ical = require("node-ical");
const OpenAI = require("openai");
const { MongoClient } = require("mongodb");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ICAL_URL = process.env.ICAL_URL || "";

// ── MongoDB (chat history) ────────────────────────────────────────────────────
let _mongoClient;
async function saveChat(sessionId, userMessage, botReply) {
  if (!process.env.MONGO_URI) return;
  try {
    if (!_mongoClient) {
      _mongoClient = new MongoClient(process.env.MONGO_URI);
      await _mongoClient.connect();
    }
    await _mongoClient
      .db()
      .collection("conversations")
      .insertOne({ sessionId, userMessage, botReply, timestamp: new Date() });
  } catch {
    // non-fatal
  }
}

// ── Date parsing ──────────────────────────────────────────────────────────────
const MONTHS = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

const WEEK_NUM = {
  first: 1,
  "1st": 1,
  second: 2,
  "2nd": 2,
  third: 3,
  "3rd": 3,
  fourth: 4,
  "4th": 4,
};

function pad(n) {
  return String(n).padStart(2, "0");
}
function toStr(y, m, d) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

function expandRange(start, end) {
  const dates = [];
  const d = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  while (d <= e) {
    dates.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function inferYear(month, day = 28) {
  const now = new Date();
  const candidate = new Date(now.getFullYear(), month - 1, day);
  return candidate < now ? now.getFullYear() + 1 : now.getFullYear();
}

function parseDates(text) {
  const lower = text.toLowerCase();

  const weekMatch = lower.match(
    /(first|second|third|fourth|1st|2nd|3rd|4th)\s+week\s+of\s+([a-z]+)/,
  );
  if (weekMatch) {
    const weekNum = WEEK_NUM[weekMatch[1]];
    const month = MONTHS[weekMatch[2]];
    if (weekNum && month) {
      const startDay = (weekNum - 1) * 7 + 1;
      const year = inferYear(month, startDay);
      const endDay = Math.min(startDay + 6, new Date(year, month, 0).getDate());
      return expandRange(
        toStr(year, month, startDay),
        toStr(year, month, endDay),
      );
    }
  }

  const rangeMatch = lower.match(
    /([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:[-–]|to)\s*(?:([a-z]+)\s+)?(\d{1,2})(?:st|nd|rd|th)?/,
  );
  if (rangeMatch) {
    const month1 = MONTHS[rangeMatch[1]];
    if (month1) {
      const startDay = parseInt(rangeMatch[2]);
      const month2 = rangeMatch[3] ? MONTHS[rangeMatch[3]] || month1 : month1;
      const endDay = parseInt(rangeMatch[4]);
      const year = inferYear(month1, startDay);
      return expandRange(
        toStr(year, month1, startDay),
        toStr(year, month2, endDay),
      );
    }
  }

  const singleMatch = lower.match(/([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?/);
  if (singleMatch) {
    const month = MONTHS[singleMatch[1]];
    if (month) {
      const day = parseInt(singleMatch[2]);
      return [toStr(inferYear(month, day), month, day)];
    }
  }

  return [];
}

// ── Date formatting ───────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function friendlyDate(str) {
  const [, m, d] = str.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${d}`;
}

function friendlyRange(dates) {
  if (dates.length === 1) return friendlyDate(dates[0]);
  return `${friendlyDate(dates[0])} – ${friendlyDate(dates[dates.length - 1])}`;
}

// ── iCal helpers ──────────────────────────────────────────────────────────────
function toRanges(sortedDates) {
  if (!sortedDates.length) return "";
  const ranges = [];
  let start = sortedDates[0],
    prev = sortedDates[0];
  for (let i = 1; i < sortedDates.length; i++) {
    const expected = new Date(prev + "T00:00:00");
    expected.setDate(expected.getDate() + 1);
    if (expected.toISOString().split("T")[0] === sortedDates[i]) {
      prev = sortedDates[i];
    } else {
      ranges.push(start === prev ? start : `${start} to ${prev}`);
      start = prev = sortedDates[i];
    }
  }
  ranges.push(start === prev ? start : `${start} to ${prev}`);
  return ranges.join("; ");
}

function computeWindows(blockedSet, today, daysAhead = 180) {
  const base = new Date(today + "T00:00:00");
  const windows = [];
  let wStart = null,
    wEnd = null;
  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const key = d.toISOString().split("T")[0];
    if (!blockedSet.has(key)) {
      if (!wStart) wStart = key;
      wEnd = key;
    } else if (wStart) {
      windows.push(`${wStart} to ${wEnd}`);
      wStart = wEnd = null;
    }
  }
  if (wStart) windows.push(`${wStart} onwards`);
  return windows.length > 0 ? windows.join("; ") : "none in the next 6 months";
}

async function getBlockedDates() {
  if (!ICAL_URL) return [];
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
  return blocked;
}

async function getAvailabilitySection() {
  if (!ICAL_URL)
    return "AVAILABILITY: Calendar data unavailable — direct guests to contact the host.";
  try {
    const blocked = await getBlockedDates();
    const today = new Date().toISOString().split("T")[0];
    const future = blocked.filter((d) => d >= today).sort();
    if (future.length > 0) {
      return `LIVE AVAILABILITY (as of ${today}):
NOT AVAILABLE (booked): ${toRanges(future)}
AVAILABLE WINDOWS: ${computeWindows(new Set(future), today)}`;
    }
    return `LIVE AVAILABILITY (as of ${today}): No bookings found — all upcoming dates are available.`;
  } catch {
    return "AVAILABILITY: Calendar data unavailable — direct guests to contact the host.";
  }
}

// ── Language detection ────────────────────────────────────────────────────────
const SPANISH_MARKERS = [
  "cuánto",
  "cuanto",
  "cuántas",
  "cuantas",
  "cuántos",
  "cuantos",
  "dónde",
  "donde",
  "cómo",
  "como está",
  "qué",
  "cuál",
  "cual",
  "cuándo",
  "cuando",
  "tiene",
  "tengo",
  "puedo",
  "quiero",
  "necesito",
  "hay",
  "están",
  "está",
  "es que",
  "por favor",
  "muchas gracias",
  "gracias",
  "hola",
  "buenos días",
  "buenas tardes",
  "buenas noches",
  "buenas",
  "buen día",
  "de nada",
  "claro",
  "sí",
  "también",
  "cómo así",
  "disponible",
  "habitación",
  "habitaciones",
  "dormitorio",
  "dormitorios",
  "precio",
  "tarifa",
  "mascota",
  "ubicación",
  "estacionamiento",
  "baño",
  "baños",
  "cocina",
  "piscina",
  "lavadora",
  "entrada",
  "salida",
  "llegada",
  "reservar",
  "reserva",
  "contacto",
  "llamar",
  "correo",
  "teléfono",
  "hogar",
  "casa",
  "propiedad",
  "alquiler",
  "alojamiento",
  "estadía",
];

const FRENCH_MARKERS = [
  "bonjour",
  "merci",
  "s'il vous plaît",
  "comment",
  "combien",
  "où",
  "qu'est",
  "disponible",
  "réserver",
  "réservation",
  "chambre",
  "salle de bain",
  "prix",
  "tarif",
  "piscine",
  "cuisine",
  "stationnement",
  "climatisation",
  "arrivée",
  "départ",
  "animaux",
  "chien",
  "emplacement",
  "adresse",
];

function detectLang(text) {
  const lower = text.toLowerCase();
  const esScore = SPANISH_MARKERS.filter((m) => lower.includes(m)).length;
  const frScore = FRENCH_MARKERS.filter((m) => lower.includes(m)).length;
  if (esScore > 0 && esScore >= frScore) return "es";
  if (frScore > 0) return "fr";
  return "en";
}

// ── Keyword responses ─────────────────────────────────────────────────────────
const responses = {
  greeting: {
    keywords: [
      "hi",
      "hey",
      "hello",
      "good morning",
      "good afternoon",
      "good evening",
      "hola",
      "buenos",
      "buenas",
      "saludos",
      "bonjour",
      "salut",
      "bonsoir",
    ],
    reply: {
      en: "Hello! I'm Vita, your villa concierge. I can help with availability, pricing, amenities, check-in times, and more. What can I help you with?",
      es: "¡Hola! Soy Vita, su conserje de la villa. Puedo ayudarle con disponibilidad, tarifas, comodidades, horarios de check-in y más. ¿En qué le puedo ayudar?",
      fr: "Bonjour ! Je suis Vita, votre conciergerie de villa. Je peux vous aider avec les disponibilités, les tarifs, les équipements, les horaires d'arrivée et plus encore. Comment puis-je vous aider ?",
    },
  },
  pricing: {
    keywords: [
      "price",
      "cost",
      "rate",
      "how much",
      "fee",
      "charge",
      "precio",
      "costo",
      "tarifa",
      "cuánto",
      "cuanto",
      "prix",
      "coût",
      "combien",
    ],
    reply: {
      en: "Nightly rates start at $130/night. Weekend and holiday rates may vary. Contact us for extended stay discounts.",
      es: "Las tarifas comienzan en $130/noche. Las tarifas de fin de semana y festivos pueden variar. Contáctenos para descuentos en estadías prolongadas.",
      fr: "Les tarifs commencent à 130 $/nuit. Les tarifs du week-end et des jours fériés peuvent varier. Contactez-nous pour des réductions sur les longs séjours.",
    },
  },
  amenities: {
    keywords: [
      "amenities",
      "kitchen",
      "wifi",
      "pool",
      "parking",
      "washer",
      "dryer",
      "air conditioning",
      "air conditioner",
      "comodidades",
      "cocina",
      "piscina",
      "estacionamiento",
      "lavadora",
      "secadora",
      "aire acondicionado",
      "équipements",
      "cuisine",
      "stationnement",
      "climatisation",
    ],
    reply: {
      en: "The property includes a full kitchen, high-speed WiFi, private pool, parking, washer/dryer, and central AC.",
      es: "La propiedad cuenta con cocina completa, WiFi de alta velocidad, piscina privada, estacionamiento, lavadora/secadora y aire acondicionado central.",
      fr: "La propriété comprend une cuisine équipée, le WiFi haut débit, une piscine privée, un parking, un lave-linge/sèche-linge et la climatisation centrale.",
    },
  },
  checkInOut: {
    keywords: [
      "check in",
      "check-in",
      "check out",
      "check-out",
      "arrival",
      "departure",
      "entrada",
      "salida",
      "llegada",
      "hora de entrada",
      "arrivée",
      "départ",
      "heure d'arrivée",
    ],
    reply: {
      en: "Check-in is at 3:00 PM and check-out is at 10:00 AM.",
      es: "El check-in es a las 3:00 PM y el check-out es a las 10:00 AM.",
      fr: "L'arrivée est à 15h00 et le départ est à 10h00.",
    },
  },
  pets: {
    keywords: [
      "pet",
      "dog",
      "cats",
      "animal",
      "mascota",
      "perro",
      "gato",
      "chien",
      "chat",
      "animaux",
    ],
    reply: {
      en: "Unfortunately, pets are not allowed at the property.",
      es: "Lamentablemente, no se permiten mascotas en la propiedad.",
      fr: "Malheureusement, les animaux de compagnie ne sont pas autorisés dans la propriété.",
    },
  },
  location: {
    keywords: [
      "location",
      "address",
      "where is the property",
      "where are you located",
      "how far",
      "ubicación",
      "dirección",
      "dónde está",
      "donde queda",
      "donde está",
      "emplacement",
      "adresse",
      "où se trouve",
      "localisation",
    ],
    reply: {
      en: "La Dolce Vita is located in Las Terrenas, Dominican Republic — just 5 minutes from the beach and 10 minutes from the town center.",
      es: "La Dolce Vita está ubicada en Las Terrenas, República Dominicana — a solo 5 minutos de la playa y 10 minutos del centro del pueblo.",
      fr: "La Dolce Vita est située à Las Terrenas, en République dominicaine — à seulement 5 minutes de la plage et 10 minutes du centre-ville.",
    },
  },
  rooms: {
    keywords: [
      "bedroom",
      "bathroom",
      "bed",
      "room",
      "layout",
      "sleep",
      "capacity",
      "twin",
      "master",
      "how many people",
      "floor plan",
      "suite",
      "habitación",
      "habitaciones",
      "dormitorio",
      "dormitorios",
      "baño",
      "baños",
      "cama",
      "camas",
      "cuántas personas",
      "cuantas personas",
      "capacidad",
      "recámara",
      "cuartos",
      "chambre",
      "salle de bain",
      "lit",
      "combien de personnes",
      "capacité",
    ],
    reply: {
      en: "The residence has two bedrooms and two bathrooms. The master bedroom has a private en-suite bathroom. The second bedroom has two twin beds with its own bathroom.",
      es: "La residencia cuenta con dos habitaciones y dos baños. La habitación principal tiene baño privado en suite. La segunda habitación tiene dos camas individuales con su propio baño.",
      fr: "La résidence dispose de deux chambres et deux salles de bain. La chambre principale dispose d'une salle de bain privative. La deuxième chambre a deux lits simples avec sa propre salle de bain.",
    },
  },
  contact: {
    keywords: [
      "contact",
      "call",
      "email",
      "reach",
      "speak",
      "talk",
      "phone",
      "contacto",
      "llamar",
      "correo",
      "teléfono",
      "hablar",
      "appeler",
      "courriel",
      "téléphone",
      "parler",
    ],
    reply: {
      en: "You can reach us by phone or WhatsApp at +1 (718) 759-8441 or +1 (917) 674-6543. We typically respond within a few hours.",
      es: "Puede contactarnos por teléfono o WhatsApp al +1 (718) 759-8441 o +1 (917) 674-6543. Generalmente respondemos en pocas horas.",
      fr: "Vous pouvez nous joindre par téléphone ou WhatsApp au +1 (718) 759-8441 ou +1 (917) 674-6543. Nous répondons généralement en quelques heures.",
    },
  },
};

const AVAIL_KEYWORDS = [
  "available",
  "availability",
  "book",
  "dates",
  "open",
  "free",
  "reserve",
  "stay",
  "disponible",
  "disponibilidad",
  "reservar",
  "reserva",
  "fechas",
  "libre",
  "quedarse",
  "réserver",
  "réservation",
];

const fallback = {
  en: "I'm not sure about that — reach out to the host directly at +1 (718) 759-8441 (call or WhatsApp) and they'll help you right away!",
  es: "No estoy seguro sobre eso — contáctenos directamente al +1 (718) 759-8441 (llamada o WhatsApp) y le ayudaremos de inmediato.",
  fr: "Je ne suis pas sûr de cela — contactez directement l'hôte au +1 (718) 759-8441 (appel ou WhatsApp) et il vous répondra immédiatement.",
};

// ── System prompt ─────────────────────────────────────────────────────────────
const LANG_INSTRUCTION =
  "Detect the language the guest is writing in and respond in that exact language — Spanish if they write Spanish, French if French, English if English. Follow their language naturally even if it changes mid-conversation. Never respond in a different language than what the guest is currently using.";

function buildPrompt(availabilitySection) {
  return `${LANG_INSTRUCTION}

You are the concierge for "La Dolce Vita", a luxury vacation rental in Las Terrenas, Dominican Republic.

PERSONALITY:
- You are warm, witty, and Caribbean-relaxed — like a friend who happens to know everything about the property.
- Never repeat yourself. If a guest asks something similar twice, rephrase your answer with a fresh angle.
- Sprinkle in light humor when it fits — but never forced. Think charming host at a dinner party, not a stand-up comedian.
- Keep answers concise — 2-3 sentences max unless the question genuinely needs more.
- Occasionally weave in a little local color — a mention of the breeze, the sound of the ocean, the smell of fresh coffee. Make them feel the place.

RULES:
- Use ONLY the property data and local knowledge below. Never invent amenities, prices, or details.
- AVAILABILITY: Always check the LIVE AVAILABILITY section before answering any date question. Never confirm a date is available if it appears in NOT AVAILABLE.
- If a guest asks what dates are available (without specifying), list the AVAILABLE WINDOWS in a friendly way — do NOT ask them to pick dates first. They may be planning around availability, not the other way around.
- If a guest mentions a date and the year is ambiguous (e.g. "April 20" when April is almost over), ask: "Just to confirm — are you thinking this year or next year?" before answering. One clarifying question beats a wrong answer.
- When you are unsure what a guest is asking, ask a short curious follow-up question instead of guessing.
- If the answer is not in the data, say: "I'd love to help with that — reach out to the host directly at +1 (718) 759-8441 (call or WhatsApp) and they'll have the answer right away."
- Never mention spreadsheets, databases, or that you're an AI reading data.
- Never say "as a concierge" or "as an AI."
- When a guest wants to book or reserve, always include: https://www.airbnb.com/rooms/37812103

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
- Playa Esperanza: 15-min walk from Portillo, small secluded bay with extremely calm transparent water.
- Playa Escondida: hidden beach between cliffs, only accessible by boat or foot from Playa Bonita, completely preserved.
- Playa El Limón: ~30 min east, 5km of golden sand with views of Cayo El Limón.
- Playa Morón: remote deserted beach surrounded by lush palms, great for solitude.
- Playa Rincón: by boat or car (~1hr), often listed among the best beaches in the Caribbean — 3km of white sand, coconut palms, mangroves, and a river.
- Playa Frontón: accessible by boat or jungle hike, dramatic cliffs, crystal water, excellent snorkeling.

RIVERS & WATERFALLS:
- Salto El Limón: ~30 min away, 40-meter waterfall into a jade pool. Best by horseback with a local guide. Entrance fee: 50 pesos/person.
- Río Marico: runs through Playa Las Ballenas — cool fresh water meets the sea.
- Saltos de Jima: 9 waterfalls and natural spa pools.

OTHER NATURAL ATTRACTIONS:
- Los Haitises National Park: ~1.5 hrs by boat, virgin rainforest, mangroves, caves with Taíno petroglyphs, 230 bird species.
- Whale watching: January–March, humpback whales in Samaná Bay — one of the best whale watching experiences in the world.

DINING:
- Mosquito Bar: beachfront at Playa Bonita, cocktails and fresh seafood.
- Bodega Bonita: Playa Bonita, gourmet wines, cheeses, fresh produce.
- Boulangerie Française: best croissants and pastries in town.
- Restaurant Luis: fresh grilled seafood overlooking the ocean.
- El Dieciocho: top-rated Italian.
- Paco Cabana: amazing ramen — yes, ramen in the Caribbean.
- Food truck park: opens daily at 4pm, 12 trucks, Dominican and European street food.

GETTING AROUND:
- Mototaxi: agree on price before riding — best for short beach hops.
- Scooter rental: ~$15/day, ideal for exploring.
- Car rental: recommended for day trips to Rincón, El Limón, or Los Haitises.

PRACTICAL:
- Las Terrenas has a strong French and Italian expat community — cosmopolitan but Caribbean-relaxed.
- Nearest airport: Samaná El Catey International (AZS), ~45 min. Santo Domingo (SDQ) ~2 hrs.
- Best weather: December–March. April–May great weather, fewer crowds. Rainy season starts June.
- Activities: kitesurfing, snorkeling, ATV tours, whale watching (Jan–Mar), El Limón waterfall, bachata and merengue lessons.

${availabilitySection}`;
}

// ── Handler ───────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { message, sessionId } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const lower = message.toLowerCase();
  const lang = detectLang(message);
  const sid = sessionId || "anonymous";
  let reply;

  // ── Availability path ─────────────────────────────────────────────────────
  const requestedDates = parseDates(message);
  const isAvailQuery = AVAIL_KEYWORDS.some((kw) => lower.includes(kw));

  if (requestedDates.length > 0 || isAvailQuery) {
    if (requestedDates.length > 0) {
      try {
        const blocked = await getBlockedDates();
        const blockedSet = new Set(blocked);
        const conflicts = requestedDates.filter((d) => blockedSet.has(d));

        if (conflicts.length === 0) {
          const range = friendlyRange(requestedDates);
          const plural = requestedDates.length !== 1;
          if (lang === "es") {
            reply = `¡Buenas noticias! ${range} ${plural ? "están" : "está"} disponible${plural ? "s" : ""}. Puede reservar su estadía aquí: https://www.airbnb.com/rooms/37812103`;
          } else if (lang === "fr") {
            reply = `Bonne nouvelle — ${range} ${plural ? "sont" : "est"} disponible${plural ? "s" : ""} ! Vous pouvez réserver votre séjour ici : https://www.airbnb.com/rooms/37812103`;
          } else {
            reply = `Good news — ${range} ${plural ? "are" : "is"} available! You can reserve your stay here: https://www.airbnb.com/rooms/37812103`;
          }
        } else {
          const range = friendlyRange(conflicts);
          const plural = conflicts.length !== 1;
          if (lang === "es") {
            reply = `Lamentablemente, ${range} ya ${plural ? "están reservadas" : "está reservada"}. ¿Le gustaría consultar otras fechas?`;
          } else if (lang === "fr") {
            reply = `Malheureusement, ${range} ${plural ? "sont déjà réservées" : "est déjà réservée"}. Souhaitez-vous vérifier d'autres dates ?`;
          } else {
            reply = `Unfortunately, ${range} ${plural ? "are" : "is"} already booked. Would you like to check alternative dates?`;
          }
        }
      } catch {
        reply =
          lang === "es"
            ? "No pude verificar el calendario en este momento — contáctenos directamente y confirmaremos la disponibilidad."
            : lang === "fr"
              ? "Je n'ai pas pu vérifier le calendrier pour le moment — contactez-nous directement et nous confirmerons la disponibilité."
              : "I wasn't able to check the calendar right now — please contact us directly and we'll confirm availability.";
      }
    }

    if (!reply) {
      // General availability query — compute and list open windows
      try {
        const blocked = await getBlockedDates();
        const today = new Date().toISOString().split("T")[0];
        const futureBlocked = new Set(blocked.filter((d) => d >= today));
        const base = new Date(today + "T00:00:00");
        const windows = [];
        let wStart = null,
          wEnd = null;
        for (let i = 0; i <= 90; i++) {
          const d = new Date(base);
          d.setDate(base.getDate() + i);
          const key = d.toISOString().split("T")[0];
          if (!futureBlocked.has(key)) {
            if (!wStart) wStart = key;
            wEnd = key;
          } else if (wStart) {
            windows.push(`${friendlyDate(wStart)} – ${friendlyDate(wEnd)}`);
            wStart = wEnd = null;
          }
        }
        if (wStart) windows.push(`${friendlyDate(wStart)} onwards`);

        if (windows.length > 0) {
          const list = windows.join(", ");
          reply =
            lang === "es"
              ? `¡Claro! Los períodos disponibles próximamente son: ${list}. ¿Alguno le funciona?`
              : lang === "fr"
                ? `Bien sûr ! Voici les périodes disponibles prochainement : ${list}. L'une d'elles vous convient-elle ?`
                : `Here are the upcoming available windows: ${list}. Do any of those work for you?`;
        } else {
          reply =
            lang === "es"
              ? "Las próximas semanas están bastante ocupadas. Contáctenos al +1 (718) 759-8441 y revisamos opciones juntos."
              : lang === "fr"
                ? "Les prochaines semaines sont très chargées. Contactez-nous au +1 (718) 759-8441 et nous trouverons quelque chose ensemble."
                : "The coming weeks are pretty fully booked. Reach out at +1 (718) 759-8441 and we can look at options together.";
        }
      } catch {
        reply =
          lang === "es"
            ? "Puedo verificar la disponibilidad — ¿qué fechas le interesan?"
            : lang === "fr"
              ? "Je peux vérifier la disponibilité — quelles dates vous intéressent ?"
              : "I can check availability for you — which dates are you looking at?";
      }
    }

    await saveChat(sid, message, reply);
    return res.json({ reply });
  }

  // ── Keyword match ─────────────────────────────────────────────────────────
  for (const category of Object.values(responses)) {
    if (category.keywords.some((kw) => lower.includes(kw))) {
      reply = category.reply[lang] || category.reply.en;
      await saveChat(sid, message, reply);
      return res.json({ reply });
    }
  }

  // ── OpenAI fallback ───────────────────────────────────────────────────────
  try {
    const availabilitySection = await getAvailabilitySection();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 400,
      messages: [
        { role: "system", content: buildPrompt(availabilitySection) },
        { role: "user", content: message },
      ],
    });
    reply = completion.choices[0].message.content;
  } catch (err) {
    console.error("OpenAI error:", err.message);
    reply = fallback[lang] || fallback.en;
  }

  await saveChat(sid, message, reply);
  return res.json({ reply });
};
