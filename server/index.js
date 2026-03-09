import "dotenv/config";
import express from "express";
import cors from "cors";
import icalRoute from "./routes/ical.js";
import chatRoute from "./routes/chat.js";

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://rose-core.vercel.app",
      "https://ladolcevitabeach.com",
      "https://www.ladolcevitabeach.com",
    ],
  }),
);
app.use(express.json());

app.use("/api/ical", icalRoute);
app.use("/api/chat", chatRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
