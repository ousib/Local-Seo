
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok",
      paddleConfigured: !!process.env.PADDLE_API_KEY,
      webhookSecretSet: !!process.env.PADDLE_WEBHOOK_SECRET
    });
  });

  // Paddle Webhook placeholder (Optional for now)
  app.post("/api/paddle-webhook", (req, res) => {
    // In production, verify Paddle signature and update database
    console.log("Paddle Webhook received:", req.body);
    res.status(200).send("OK");
  });

  // Mock city search for US cities
  const CITIES = [
    "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
    "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA",
    "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "Indianapolis, IN",
    "Charlotte, NC", "San Francisco, CA", "Seattle, WA", "Denver, CO", "Washington, DC",
    "Boston, MA", "Nashville, TN", "El Paso, TX", "Detroit, MI", "Oklahoma City, OK",
    "Portland, OR", "Las Vegas, NV", "Memphis, TN", "Louisville, KY", "Baltimore, MD",
    "Milwaukee, WI", "Albuquerque, NM", "Tucson, AZ", "Fresno, CA", "Sacramento, CA",
    "Kansas City, MO", "Mesa, AZ", "Atlanta, GA", "Omaha, NE", "Colorado Springs, CO",
    "Raleigh, NC", "Virginia Beach, VA", "Long Beach, CA", "Miami, FL", "Oakland, CA",
    "Minneapolis, MN", "Tulsa, OK", "Bakersfield, CA", "Wichita, KS", "Arlington, TX"
  ];

  app.get("/api/cities", (req, res) => {
    const query = (req.query.q as string || "").toLowerCase();
    if (!query) return res.json([]);
    const matches = CITIES.filter(city => city.toLowerCase().includes(query)).slice(0, 10);
    res.json(matches);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
