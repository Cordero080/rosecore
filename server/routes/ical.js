import express from 'express'
import { getBlockedDates } from '../lib/getBlockedDates.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const blockedDates = await getBlockedDates()
    const source = process.env.ICAL_URL ? 'airbnb' : 'mock'
    res.json({ blockedDates, source })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch calendar' })
  }
})

export default router
