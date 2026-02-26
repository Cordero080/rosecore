import { google } from 'googleapis'

const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}')

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

const sheets = google.sheets({ version: 'v4', auth })
const SHEET_ID = process.env.GOOGLE_SHEET_ID

let cache = null
let cacheTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getSheetData() {
  if (cache && Date.now() - cacheTime < CACHE_TTL) return cache

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1',
  })

  const rows = res.data.values || []
  if (rows.length < 2) return 'No property data available yet.'

  const headers = rows[0]
  const lines = rows.slice(1).map(row => {
    return headers.map((h, i) => `${h}: ${row[i] || 'N/A'}`).join(' | ')
  })

  cache = lines.join('\n')
  cacheTime = Date.now()
  return cache
}