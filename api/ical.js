const https = require("https");
const ical = require("node-ical");

const ICAL_URL = process.env.ICAL_URL || "";

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; calendar-reader/1.0)",
          Accept: "text/calendar, text/plain, */*",
        },
      },
      (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          return fetchText(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      },
    );
    req.on("error", reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

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
