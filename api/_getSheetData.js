 // ONE job: read the property Google Sheet and hand it back as plain text.
 // require = this folder's way of pulling in another file or package.
  // The { } picks named thing out of the package, not the whole thing.
  const { google } = require("googleapis");

  // Two places the Google key can live, tried in order:
//   1. credentials.json — the file on your laptop
//   2. GOOGLE_CREDENTIALS — a Vercel setting, since Vercel has no file
// readFileSync throws if the file isn't there, so the catch covers Vercel.
let creds;
try {
  creds = JSON.parse(
    require("fs").readFileSync(
      require("path").resolve(__dirname, "..", "server", "credentials.json"),
      "utf8",
    ),
  );
} catch {
  creds = JSON.parse(process.env.GOOGLE_CREDENTIALS || "{}");
}

  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    // read only = this key can look at the Sheet, never change it.
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
   const sheets = google.sheets({ version: "v4", auth });
   const SHEET_ID = process.env.GOOGLE_SHEET_ID;
   const CACHE_TTL = 5 * 60 * 1000;  // 5 minutes, written in milliseconds

   let cache = null;
   let cacheTime = 0;

   // ---------- MAIN ----------

   async function getSheetData() {
    // Asked again within 5 minutes? Hand back the saved copy, skip Google.
    if (cache && Date.now() - cacheTime < CACHE_TTL) return cache;

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Sheet1",
    });

    const rows = res.data.values || [];
    if (rows.length < 2) return "No property data available yet.";
    const headers = rows[0];
    const lines  = rows
    .slice(1)
    .map((row) => headers.map((h, i) => `${h}: ${row[i] || "N/A"}`).join(" | "));

    cache = lines.join("\n");
    cacheTime = Date.now();
    return cache;
   }
   module.exports = { getSheetData };