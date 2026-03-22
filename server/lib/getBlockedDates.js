import { get as httpsGet } from "node:https";
import ical from "node-ical";

const ICAL_URL = process.env.ICAL_URL || "";

const MOCK_BLOCKED = [
  "2026-03-01",
  "2026-03-02",
  "2026-03-03",
  "2026-03-15",
  "2026-03-16",
];

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = httpsGet(
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

export async function getBlockedDates() {
  if (!ICAL_URL) return MOCK_BLOCKED;

  const text = await fetchText(ICAL_URL);
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
