import express from "express";
import { getBlockedDates } from "../lib/getBlockedDates.js";
import { saveChat } from "../lib/chatHistory.js";

const router = express.Router();

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

function toStr(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
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

function inferYear(month) {
  const now = new Date();
  const candidate = new Date(now.getFullYear(), month - 1, 1);
  return candidate < now ? now.getFullYear() + 1 : now.getFullYear();
}

function parseDates(text) {
  const lower = text.toLowerCase();

  // "first week of March", "second week of April"
  const weekMatch = lower.match(
    /(first|second|third|fourth|1st|2nd|3rd|4th)\s+week\s+of\s+([a-z]+)/,
  );
  if (weekMatch) {
    const weekNum = WEEK_NUM[weekMatch[1]];
    const month = MONTHS[weekMatch[2]];
    if (weekNum && month) {
      const year = inferYear(month);
      const startDay = (weekNum - 1) * 7 + 1;
      const endDay = Math.min(startDay + 6, new Date(year, month, 0).getDate());
      return expandRange(
        toStr(year, month, startDay),
        toStr(year, month, endDay),
      );
    }
  }

  // "March 15-20", "March 15 to 20", "March 15 to April 2"
  const rangeMatch = lower.match(
    /([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:[-–]|to)\s*(?:([a-z]+)\s+)?(\d{1,2})(?:st|nd|rd|th)?/,
  );
  if (rangeMatch) {
    const month1 = MONTHS[rangeMatch[1]];
    if (month1) {
      const startDay = parseInt(rangeMatch[2]);
      const month2 = rangeMatch[3] ? MONTHS[rangeMatch[3]] || month1 : month1;
      const endDay = parseInt(rangeMatch[4]);
      const year = inferYear(month1);
      return expandRange(
        toStr(year, month1, startDay),
        toStr(year, month2, endDay),
      );
    }
  }

  // "March 15", "March 15th"
  const singleMatch = lower.match(/([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?/);
  if (singleMatch) {
    const month = MONTHS[singleMatch[1]];
    if (month) {
      const day = parseInt(singleMatch[2]);
      const year = inferYear(month);
      return [toStr(year, month, day)];
    }
  }

  return [];
}

// ── Natural date formatting ───────────────────────────────────────────────────

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

// ── Language detection ────────────────────────────────────────────────────────

const SPANISH_MARKERS = [
  // question words
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
  // common verbs / phrases
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
  // property-specific
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
      // English
      "price",
      "cost",
      "rate",
      "how much",
      "fee",
      "charge",
      // Spanish
      "precio",
      "costo",
      "tarifa",
      "cuánto",
      "cuanto",
      // French
      "prix",
      "coût",
      "tarif",
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
      // English
      "amenities",
      "kitchen",
      "wifi",
      "pool",
      "parking",
      "washer",
      "dryer",
      "air conditioning",
      "air conditioner",
      // Spanish
      "comodidades",
      "cocina",
      "piscina",
      "estacionamiento",
      "lavadora",
      "secadora",
      "aire acondicionado",
      // French
      "équipements",
      "cuisine",
      "piscine",
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
      // English
      "check in",
      "check-in",
      "check out",
      "check-out",
      "arrival",
      "departure",
      // Spanish
      "entrada",
      "salida",
      "llegada",
      "hora de entrada",
      // French
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
      // English
      "pet",
      "dog",
      "cats",
      "animal",
      // Spanish
      "mascota",
      "perro",
      "gato",
      // French
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
      // English
      "location",
      "address",
      "where is the property",
      "where are you located",
      "how far",
      // Spanish
      "ubicación",
      "dirección",
      "dónde está",
      "donde queda",
      "donde está",
      // French
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
      // English
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
      // Spanish
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
      // French
      "chambre",
      "salle de bain",
      "lit",
      "combien de personnes",
      "capacité",
    ],
    reply: {
      en: "The residence has two bedrooms and two bathrooms. The master bedroom has a private en-suite bathroom. The second bedroom has two twin beds with its own bathroom. There's also a comfortable living room and a full kitchen.",
      es: "La residencia cuenta con dos habitaciones y dos baños. La habitación principal tiene baño privado en suite. La segunda habitación tiene dos camas individuales con su propio baño. También hay una sala de estar y cocina completa.",
      fr: "La résidence dispose de deux chambres et deux salles de bain. La chambre principale dispose d'une salle de bain privative. La deuxième chambre a deux lits simples avec sa propre salle de bain. Il y a aussi un salon confortable et une cuisine complète.",
    },
  },
  contact: {
    keywords: [
      // English
      "contact",
      "call",
      "email",
      "reach",
      "speak",
      "talk",
      "phone",
      // Spanish
      "contacto",
      "llamar",
      "correo",
      "teléfono",
      "hablar",
      // French
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

const fallback = {
  en: "I'm not sure about that — reach out to the host directly at +1 (718) 759-8441 (call or WhatsApp) and they'll help you right away!",
  es: "No estoy seguro sobre eso — contáctenos directamente al +1 (718) 759-8441 (llamada o WhatsApp) y le ayudaremos de inmediato.",
  fr: "Je ne suis pas sûr de cela — contactez directement l'hôte au +1 (718) 759-8441 (appel ou WhatsApp) et il vous répondra immédiatement.",
};

// ── Route ─────────────────────────────────────────────────────────────────────

const AVAIL_KEYWORDS = [
  // English
  "available",
  "availability",
  "book",
  "dates",
  "open",
  "free",
  "reserve",
  "stay",
  // Spanish
  "disponible",
  "disponibilidad",
  "reservar",
  "reserva",
  "fechas",
  "libre",
  "quedarse",
  // French
  "disponible",
  "réserver",
  "réservation",
  "dates",
  "libre",
];

router.post("/", async (req, res) => {
  const { message, sessionId, lang: clientLang } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const lower = message.toLowerCase();
  const lang = clientLang || detectLang(message);
  let reply;

  // Availability check
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
        if (lang === "es") {
          reply =
            "No pude verificar el calendario en este momento — contáctenos directamente y confirmaremos la disponibilidad.";
        } else if (lang === "fr") {
          reply =
            "Je n'ai pas pu vérifier le calendrier pour le moment — contactez-nous directement et nous confirmerons la disponibilité.";
        } else {
          reply =
            "I wasn't able to check the calendar right now — please contact us directly and we'll confirm availability.";
        }
      }
    }

    if (!reply) {
      if (lang === "es") {
        reply = "Puedo verificar la disponibilidad — ¿qué fechas le interesan?";
      } else if (lang === "fr") {
        reply =
          "Je peux vérifier la disponibilité — quelles dates vous intéressent ?";
      } else {
        reply =
          "I can check availability for you — which dates are you looking at?";
      }
    }

    try {
      await saveChat(sessionId || "anonymous", message, reply);
    } catch (e) {
      console.error("Mongo save error:", e.message);
    }
    return res.json({ reply });
  }

  // Keyword responses
  for (const category of Object.values(responses)) {
    if (category.keywords.some((kw) => lower.includes(kw))) {
      reply = category.reply[lang] || category.reply.en;
      try {
        await saveChat(sessionId || "anonymous", message, reply);
      } catch (e) {
        console.error("Mongo save error:", e.message);
      }
      return res.json({ reply });
    }
  }

  // OpenAI fallback
  try {
    const { askAI } = await import("../lib/openaiChat.js");
    reply = await askAI(message, lang);
  } catch (err) {
    console.error("OpenAI error:", err.message);
    reply = fallback[lang] || fallback.en;
  }

  try {
    await saveChat(sessionId || "anonymous", message, reply);
  } catch (e) {
    console.error("Mongo save error:", e.message);
  }
  return res.json({ reply });
});

export default router;
