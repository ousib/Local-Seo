
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Middleware for JSON
app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  console.log("[API] Health check reached");
  res.json({ 
    status: "ok",
    environment: process.env.VERCEL ? "vercel" : "standard",
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

app.post("/api/contact", async (req, res) => {
  console.log("[Contact Form] Received request:", JSON.stringify(req.body));
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    console.log("[Contact Form] Missing fields:", { name: !!name, email: !!email, message: !!message });
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("[Contact Form] Error: SMTP_USER or SMTP_PASS environment variables are not set.");
      return res.status(500).json({ 
        error: "Server configuration error", 
        details: "Contact form is not properly configured. Please set SMTP_USER and SMTP_PASS environment variables." 
      });
    }

    let recipient = "gomgomtechnologies@gmail.com";
    let envRecip = process.env.CONTACT_RECIPIENT;
    
    if (envRecip) {
      // Strip literal quotes and common placeholder strings
      envRecip = envRecip.replace(/^["']|["']$/g, '').trim();
      if (envRecip && envRecip !== 'undefined' && envRecip !== 'null' && envRecip.includes('@')) {
        recipient = envRecip;
      }
    }

    console.log(`[Contact Form] Raw Recipient Env: ${process.env.CONTACT_RECIPIENT}`);
    console.log(`[Contact Form] Resolved Recipient: ${recipient}`);

    const transportConfig: any = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    const transporter = nodemailer.createTransport(transportConfig);

    const mailOptions = {
      from: process.env.SMTP_USER || "gomgomtechnologies@gmail.com",
      replyTo: email,
      to: recipient,
      subject: `New Contact Submission: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 12px;">
          <h2 style="color: #0f172a; margin-bottom: 20px;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; color: #334155;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
      `,
    };

    console.log(`[Contact Form] mailOptions.to value: "${mailOptions.to}" type: ${typeof mailOptions.to}`);

    if (!mailOptions.to || mailOptions.to === 'undefined' || !mailOptions.to.includes('@')) {
      throw new Error(`Invalid recipient address: "${mailOptions.to}"`);
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Contact Form] Email sent successfully: ${info.messageId}`);
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error: any) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email", details: error.message });
  }
});

async function startServer() {
  const PORT = 3000;
  
  if (process.env.NODE_ENV !== "production") {
    // Dynamic import for Vite to avoid loading it in production/Vercel environments
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production (non-Vercel), serve static files from dist
    if (!process.env.VERCEL) {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
    });
  }
}

// Only start the server loop if not on Vercel
// Vercel only needs the exported 'app'
if (!process.env.VERCEL) {
  startServer().catch(console.error);
} else {
  console.log("[Server] Running in Vercel environment, skipping startServer boot");
}
