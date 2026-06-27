const { fetchText } = require("./_fetchText");
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
        "2026-12-20",
        "2026-12-21",
        "2026-12-22",
        "2026-12-26",
        "2026-12-27",
      ],
      source: "mock",
    });
  }

  try {
    const text = await fetchText(ICAL_URL);
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
    console.error("iCal fetch error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch calendar", detail: err.message });
  }
};
