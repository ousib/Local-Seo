
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Middleware for JSON
app.use(express.json());

// Enhanced Health Check to debug Vercel environment
app.get("/api/health", (req, res) => {
  console.log("[API] Health check requested");
  res.json({ 
    status: "ok",
    environment: process.env.VERCEL ? "vercel" : "standard",
    nodeEnv: process.env.NODE_ENV,
    paddle: {
      hasToken: !!process.env.VITE_PADDLE_CLIENT_TOKEN,
      token: process.env.VITE_PADDLE_CLIENT_TOKEN, // Client tokens are public
      starter: process.env.VITE_PADDLE_PRICE_ID_STARTER,
      pro: process.env.VITE_PADDLE_PRICE_ID_PRO,
      agency: process.env.VITE_PADDLE_PRICE_ID_AGENCY
    }
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

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Quick check for SMTP credentials before even trying to connect
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("[Contact] Missing SMTP_USER or SMTP_PASS");
    return res.status(500).json({ 
      error: "Server configuration error", 
      details: "Email service is not configured (missing credentials)." 
    });
  }

  try {
    let recipient = "gomgomtechnologies@gmail.com";
    if (process.env.CONTACT_RECIPIENT) {
      const r = process.env.CONTACT_RECIPIENT.replace(/^["']|["']$/g, '').trim();
      if (r && r !== 'undefined' && r.includes('@')) {
        recipient = r;
      }
    }

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "465");
    const isSecure = port === 465;

    console.log(`[Contact] Sending to ${recipient} via ${host}:${port} (SSL: ${isSecure})`);

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Aggressive timeouts to fail before Vercel kills the function
      connectionTimeout: 5000, 
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });

    const info = await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_USER}>`, // Best practice: 'from' matches authenticated user
      replyTo: email,
      to: recipient,
      subject: `New SEO Machine Lead: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #1a1a1a;">New Contact Lead</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <div style="background: #fdfdfd; padding: 15px; border-radius: 8px; border: 1px solid #f0f0f0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
      `,
    });

    console.log(`[Contact] Success: ${info.messageId}`);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("[Contact] Detailed Error:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    
    return res.status(500).json({ 
      error: "Mail service error", 
      message: error.message || "Failed to connect to mail server"
    });
  }
});

// Middleware for static files / Vite
async function configureStaticServing() {
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn("[Server] Vite middleware failed to load, probably production mode");
    }
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

configureStaticServing();

// Standalone start (non-serverless)
if (!process.env.VERCEL) {
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
    console.log("[Paddle] Startup Check:", {
      tokenSet: !!process.env.VITE_PADDLE_CLIENT_TOKEN,
      starter: process.env.VITE_PADDLE_PRICE_ID_STARTER,
      pro: process.env.VITE_PADDLE_PRICE_ID_PRO,
      agency: process.env.VITE_PADDLE_PRICE_ID_AGENCY
    });
  });
}
