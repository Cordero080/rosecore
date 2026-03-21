const ical = require("node-ical");

const ICAL_URL = process.env.ICAL_URL || "";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!ICAL_URL) {
    return res.json({
      blockedDates: [
        "2026-03-01",
        "2026-03-02",
        "2026-03-03",
        "2026-03-15",
        "2026-03-16",
      ],
      source: "mock",
    });
  }

  try {
    const res2 = await fetch(ICAL_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; calendar-reader/1.0)",
        Accept: "text/calendar, text/plain, */*",
      },
    });
    if (!res2.ok) throw new Error(`iCal fetch failed: ${res2.status}`);
    const text = await res2.text();
    const events = ical.sync.parseICS(text);
    const blockedDates = [];

    for (const event of Object.values(events)) {
      if (event.type !== "VEVENT") continue;
      const start = new Date(event.start);
      const end = new Date(event.end);

      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        blockedDates.push(d.toISOString().split("T")[0]);
      }
    }

    res.json({ blockedDates, source: "airbnb" });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch calendar" });
  }
};
