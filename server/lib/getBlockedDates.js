import ical from 'node-ical'

const ICAL_URL = process.env.ICAL_URL || ''

const MOCK_BLOCKED = [
  '2026-03-01', '2026-03-02', '2026-03-03',
  '2026-03-15', '2026-03-16',
]

export async function getBlockedDates() {
  if (!ICAL_URL) return MOCK_BLOCKED

  const events = await ical.async.fromURL(ICAL_URL)
  const blocked = []

  for (const event of Object.values(events)) {
    if (event.type !== 'VEVENT') continue
    const start = new Date(event.start)
    const end   = new Date(event.end)
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      blocked.push(d.toISOString().split('T')[0])
    }
  }

  return blocked
}
