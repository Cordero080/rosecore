import express from 'express'
import { getBlockedDates } from '../lib/getBlockedDates.js'

const router = express.Router()

// ── Date parsing ──────────────────────────────────────────────────────────────

const MONTHS = {
  january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3,
  april: 4, apr: 4, may: 5, june: 6, jun: 6, july: 7, jul: 7,
  august: 8, aug: 8, september: 9, sep: 9, sept: 9, october: 10, oct: 10,
  november: 11, nov: 11, december: 12, dec: 12,
}

const WEEK_NUM = { first: 1, '1st': 1, second: 2, '2nd': 2, third: 3, '3rd': 3, fourth: 4, '4th': 4 }

function pad(n) { return String(n).padStart(2, '0') }

function toStr(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`
}

function expandRange(start, end) {
  const dates = []
  const d = new Date(start + 'T00:00:00')
  const e = new Date(end   + 'T00:00:00')
  while (d <= e) {
    dates.push(d.toISOString().split('T')[0])
    d.setDate(d.getDate() + 1)
  }
  return dates
}

function inferYear(month) {
  const now = new Date()
  const candidate = new Date(now.getFullYear(), month - 1, 1)
  return candidate < now ? now.getFullYear() + 1 : now.getFullYear()
}

function parseDates(text) {
  const lower = text.toLowerCase()

  // "first week of March", "second week of April"
  const weekMatch = lower.match(/(first|second|third|fourth|1st|2nd|3rd|4th)\s+week\s+of\s+([a-z]+)/)
  if (weekMatch) {
    const weekNum = WEEK_NUM[weekMatch[1]]
    const month   = MONTHS[weekMatch[2]]
    if (weekNum && month) {
      const year     = inferYear(month)
      const startDay = (weekNum - 1) * 7 + 1
      const endDay   = Math.min(startDay + 6, new Date(year, month, 0).getDate())
      return expandRange(toStr(year, month, startDay), toStr(year, month, endDay))
    }
  }

  // "March 15-20", "March 15 to 20", "March 15 to April 2"
  const rangeMatch = lower.match(
    /([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:[-–]|to)\s*(?:([a-z]+)\s+)?(\d{1,2})(?:st|nd|rd|th)?/
  )
  if (rangeMatch) {
    const month1 = MONTHS[rangeMatch[1]]
    if (month1) {
      const startDay = parseInt(rangeMatch[2])
      const month2   = rangeMatch[3] ? (MONTHS[rangeMatch[3]] || month1) : month1
      const endDay   = parseInt(rangeMatch[4])
      const year     = inferYear(month1)
      return expandRange(toStr(year, month1, startDay), toStr(year, month2, endDay))
    }
  }

  // "March 15", "March 15th"
  const singleMatch = lower.match(/([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?/)
  if (singleMatch) {
    const month = MONTHS[singleMatch[1]]
    if (month) {
      const day  = parseInt(singleMatch[2])
      const year = inferYear(month)
      return [toStr(year, month, day)]
    }
  }

  return []
}

// ── Natural date formatting ───────────────────────────────────────────────────

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December']

function friendlyDate(str) {
  const [, m, d] = str.split('-').map(Number)
  return `${MONTH_NAMES[m - 1]} ${d}`
}

function friendlyRange(dates) {
  if (dates.length === 1) return friendlyDate(dates[0])
  return `${friendlyDate(dates[0])} – ${friendlyDate(dates[dates.length - 1])}`
}

// ── Keyword responses ─────────────────────────────────────────────────────────

const responses = {
  pricing: {
    keywords: ['price', 'cost', 'rate', 'how much', 'fee', 'charge'],
    reply: 'Nightly rates start at $130/night. Weekend and holiday rates may vary. Contact us for extended stay discounts.',
  },
  amenities: {
    keywords: ['amenities', 'kitchen', 'wifi', 'pool', 'parking', 'washer', 'dryer', 'ac', 'air'],
    reply: 'The property includes a full kitchen, high-speed WiFi, private pool, parking, washer/dryer, and central AC.',
  },
  checkInOut: {
    keywords: ['check in', 'check-in', 'check out', 'check-out', 'arrival', 'departure'], // cspell:disable-line
    reply: 'Check-in is at 3:00 PM and check-out is at 11:00 AM.',
  },
  pets: {
    keywords: ['pet', 'dog', 'cat', 'animal'],
    reply: 'We are a pet-friendly property! Please let us know in advance so we can prepare accordingly.',
  },
  location: {
    keywords: ['where', 'location', 'address', 'area', 'near', 'close', 'beach', 'town'],
    reply: 'La Dolce Vita is located in Las Terrenas, Dominican Republic — just 5 minutes from the beach and 10 minutes from the town center.', // cspell:disable-line
  },
  contact: {
    keywords: ['contact', 'call', 'email', 'reach', 'speak', 'talk', 'phone'],
    reply: 'You can reach us at [email] or [phone]. We typically respond within a few hours.',
  },
}

const fallback = "I'm not sure about that — feel free to reach out to us directly and we'll be happy to help!"

// ── Route ─────────────────────────────────────────────────────────────────────

const AVAIL_KEYWORDS = ['available', 'availability', 'book', 'dates', 'open', 'free', 'reserve', 'stay']

router.post('/', async (req, res) => {
  const { message } = req.body
  if (!message) return res.status(400).json({ error: 'Message is required' })

  const lower = message.toLowerCase()

  // Availability check — triggers if dates are found OR explicit availability keyword used
  const requestedDates = parseDates(message)
  const isAvailQuery   = AVAIL_KEYWORDS.some(kw => lower.includes(kw))

  if (requestedDates.length > 0 || isAvailQuery) {
    if (requestedDates.length > 0) {
      try {
        const blocked    = await getBlockedDates()
        const blockedSet = new Set(blocked)
        const conflicts  = requestedDates.filter(d => blockedSet.has(d))

        if (conflicts.length === 0) {
          return res.json({
            reply: `Good news — ${friendlyRange(requestedDates)} ${requestedDates.length === 1 ? 'is' : 'are'} available! Would you like to go ahead and reserve your stay?`,
          })
        } else {
          return res.json({
            reply: `Unfortunately, ${friendlyRange(conflicts)} ${conflicts.length === 1 ? 'is' : 'are'} already booked. Would you like to check alternative dates?`,
          })
        }
      } catch {
        return res.json({ reply: "I wasn't able to check the calendar right now — please contact us directly and we'll confirm availability." })
      }
    }

    // No specific dates parsed — ask for them
    return res.json({ reply: 'I can check availability for you — which dates are you looking at?' })
  }

  // Other keyword responses
  for (const category of Object.values(responses)) {
    if (category.keywords.some(kw => lower.includes(kw))) {
      return res.json({ reply: category.reply })
    }
  }

  res.json({ reply: fallback })
})

export default router
