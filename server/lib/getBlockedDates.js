import ical from "node-ical";

const ICAL_URL = process.env.ICAL_URL || "";

const MOCK_BLOCKED = [
  "2026-03-01",
  "2026-03-02",
  "2026-03-03",
  "2026-03-15",
  "2026-03-16",
];

export async function getBlockedDates() {
  if (!ICAL_URL) return MOCK_BLOCKED;

  const res = await fetch(ICAL_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; calendar-reader/1.0)",
      Accept: "text/calendar, text/plain, */*",
    },
  });
  if (!res.ok) throw new Error(`iCal fetch failed: ${res.status}`);
  const text = await res.text();
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
