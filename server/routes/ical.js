import express from 'express'
import ical from 'node-ical'

const router = express.Router()

// Replace with real Airbnb iCal URL when available
const ICAL_URL = process.env.ICAL_URL || ''

router.get('/', async (req, res) => {
  if (!ICAL_URL) {
    // Return mock blocked dates for development
    return res.json({
      blockedDates: [
        '2026-03-01',
        '2026-03-02',
        '2026-03-03',
        '2026-03-15',
        '2026-03-16',
      ],
      source: 'mock',
    })
  }

  try {
    const events = await ical.async.fromURL(ICAL_URL)
    const blockedDates = []

    for (const event of Object.values(events)) {
      if (event.type !== 'VEVENT') continue
      const start = new Date(event.start)
      const end = new Date(event.end)

      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        blockedDates.push(d.toISOString().split('T')[0])
      }
    }

    res.json({ blockedDates, source: 'airbnb' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch calendar' })
  }
})

export default router
