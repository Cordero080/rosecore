import express from 'express'

const router = express.Router()

// Mock property data — replace with real content
const responses = {
  availability: {
    keywords: ['available', 'availability', 'book', 'dates', 'open', 'free'],
    reply: 'Let me check the calendar for you. What dates are you looking at?',
  },
  pricing: {
    keywords: ['price', 'cost', 'rate', 'how much', 'fee', 'charge'],
    reply: 'Nightly rates start at $XXX/night. Weekend and holiday rates may vary. Contact us for extended stay discounts.',
  },
  amenities: {
    keywords: ['amenities', 'kitchen', 'wifi', 'pool', 'parking', 'washer', 'dryer', 'ac', 'air'],
    reply: 'The property includes a full kitchen, high-speed WiFi, private pool, parking, washer/dryer, and central AC.',
  },
  checkin: {
    keywords: ['check in', 'check-in', 'checkin', 'check out', 'check-out', 'checkout', 'arrival', 'departure'],
    reply: 'Check-in is at 3:00 PM and check-out is at 11:00 AM.',
  },
  pets: {
    keywords: ['pet', 'dog', 'cat', 'animal'],
    reply: 'We are a pet-friendly property! Please let us know in advance so we can prepare accordingly.',
  },
  location: {
    keywords: ['where', 'location', 'address', 'area', 'near', 'close', 'beach', 'town'],
    reply: 'We are located in [Location], just [X] minutes from the beach and [X] minutes from the town center.',
  },
  contact: {
    keywords: ['contact', 'call', 'email', 'reach', 'speak', 'talk', 'phone'],
    reply: 'You can reach us at [email] or [phone]. We typically respond within a few hours.',
  },
}

const fallback = "I'm not sure about that — feel free to reach out to us directly and we'll be happy to help!"

router.post('/', (req, res) => {
  const { message } = req.body
  if (!message) return res.status(400).json({ error: 'Message is required' })

  const lower = message.toLowerCase()

  for (const category of Object.values(responses)) {
    if (category.keywords.some((kw) => lower.includes(kw))) {
      return res.json({ reply: category.reply })
    }
  }

  res.json({ reply: fallback })
})

export default router
