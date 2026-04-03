const QRCode = require("qrcode");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.send("URL Shortener API is running 🚀");
});

// generate short id (safe version)
function generateShortId() {
  return Math.random().toString(36).substring(2, 8);
}


//SHORTEN URL
app.post("/shorten", async (req, res) => {
  try {
    const { originalUrl } = req.body;

    // validation
    if (!originalUrl) {
      return res.status(400).json({ error: "originalUrl is required" });
    }

    // validate URL format
    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const shortId = generateShortId();

    const newUrl = await prisma.url.create({
      data: {
        originalUrl,
        shortId,
      },
    });

    // create QR code for short URL
    const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
    const shortUrl = `${BASE_URL}/${shortId}`;
    const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

    return res.json({
      shortUrl,
      statsUrl: `${BASE_URL}/stats/${newUrl.shortId}`,
      qrCode: qrCodeImage,
});

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

//REDIRECT ROUTE
app.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await prisma.url.findUnique({
      where: { shortId },
    });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

// IMPORTANT: WAIT for update
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
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


//STATS ROUTE
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


//START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});