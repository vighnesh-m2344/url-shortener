const QRCode = require("qrcode");
const express = require("express");
const prisma = require("./prisma");
const app = express();

// ensure DB connection
prisma.$connect()
  .then(() => console.log("Prisma connected"))
  .catch((err) => console.error("Prisma connection error:", err));

// middleware
app.use(express.json());

// BASE URL
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// ROOT
app.get("/", (req, res) => {
  res.send("URL Shortener API is running");
});

// generate short id
function generateShortId() {
  return Math.random().toString(36).substring(2, 8);
}

// SHORTEN URL
app.post("/shorten", async (req, res) => {
  try {
    const { originalUrl, customId } = req.body;

    // validation
    if (!originalUrl) {
      return res.status(400).json({ error: "originalUrl is required" });
    }

    // URL validation
    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Normalize customId
    let shortId = customId
      ? customId.trim().toLowerCase()
      : generateShortId();

    // Check duplicate
    const existing = await prisma.url.findUnique({
      where: { shortId },
    });

    if (existing) {
      return res.status(400).json({
        error: "Custom ID already taken",
      });
    }

    // save to DB
    const newUrl = await prisma.url.create({
      data: {
        originalUrl,
        shortId,
      },
    });

    const shortUrl = `${BASE_URL}/${shortId}`;

    // QR code generation
    const qrCodeImage = await QRCode.toDataURL(shortUrl);

    return res.status(201).json({
      shortUrl,
      statsUrl: `${BASE_URL}/stats/${shortId}`,
      qrCode: qrCodeImage,
    });

  } catch (err) {
    console.error("ERROR IN /shorten:", err);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// STATS ROUTE
app.get("/stats/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await prisma.url.findUnique({
      where: { shortId },
    });

    if (!url) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.json({
      originalUrl: url.originalUrl,
      shortId: url.shortId,
      clicks: url.clicks,
      createdAt: url.createdAt,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// REDIRECT ROUTE
app.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await prisma.url.findUnique({
      where: { shortId },
    });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    // Increment clicks
    await prisma.url.update({
      where: { shortId },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });

    return res.redirect(url.originalUrl);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});