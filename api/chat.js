const responses = {
  availability: {
    keywords: [
      // English
      "available",
      "availability",
      "book",
      "dates",
      "open",
      "free",
      // Spanish
      "disponible",
      "disponibilidad",
      "reservar",
      "reserva",
      "fechas",
      "libre",
      // French
      "disponible",
      "réserver",
      "réservation",
      "dates",
      "libre",
    ],
    reply: "Let me check the calendar for you. What dates are you looking at?",
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
    reply:
      "Nightly rates start at $130/night. Weekend and holiday rates may vary. Contact us for extended stay discounts. Book here: https://www.airbnb.com/rooms/37812103",
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
      "ac",
      "air",
      // Spanish
      "comodidades",
      "cocina",
      "piscina",
      "estacionamiento",
      "lavadora",
      "secadora",
      "aire",
      // French
      "équipements",
      "cuisine",
      "piscine",
      "stationnement",
      "climatisation",
    ],
    reply:
      "The property includes a full kitchen, high-speed WiFi, private pool, parking, washer/dryer, and central AC.",
  },
  checkin: {
    keywords: [
      // English
      "check in",
      "check-in",
      "checkin",
      "check out",
      "check-out",
      "checkout",
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
    reply: "Check-in is at 3:00 PM and check-out is at 11:00 AM.",
  },
  pets: {
    keywords: [
      // English
      "pet",
      "dog",
      "cat",
      "animal",
      // Spanish
      "mascota",
      "perro",
      "gato",
      // French
      "animal",
      "chien",
      "chat",
      "animaux",
    ],
    reply:
      "We are a pet-friendly property! Please let us know in advance so we can prepare accordingly.",
  },
  location: {
    keywords: [
      // English
      "where",
      "location",
      "address",
      "area",
      "near",
      "close",
      "beach",
      "town",
      // Spanish
      "ubicación",
      "dirección",
      "dónde",
      "donde",
      "playa",
      "pueblo",
      "cerca",
      // French
      "emplacement",
      "adresse",
      "où",
      "plage",
      "ville",
      "près",
    ],
    reply:
      "We are located in Las Terrenas, Samana, just 5 minutes from the beach and 10 minutes from the town center.",
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
      "contact",
      "appeler",
      "courriel",
      "téléphone",
      "parler",
    ],
    reply:
      "You can reach us at [email] or [phone]. We typically respond within a few hours.",
  },
};

const fallback =
  "I'm not sure about that — feel free to reach out to us directly and we'll be happy to help!";

module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const lower = message.toLowerCase();

  for (const category of Object.values(responses)) {
    if (category.keywords.some((kw) => lower.includes(kw))) {
      return res.json({ reply: category.reply });
    }
  }

  res.json({ reply: fallback });
};
