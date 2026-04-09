const express = require("express");
const QRCode = require("qrcode");
const cors = require("cors");
const prisma = require("./prisma");

const app = express();


// DB CONNECT
prisma.$connect()
  .then(() => console.log("Prisma connected"))
  .catch((err) => console.error("Prisma connection error:", err));


// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.set("trust proxy", 1);


// BASE URL
const BASE_URL = process.env.BASE_URL || "https://url-shortener-z980.onrender.com";


// ROOT
app.get("/", (req, res) => {
  res.send("URL Shortener API is running");
});


// SHORT ID GENERATOR
function generateShortId() {
  return Math.random().toString(36).substring(2, 8);
}


// SHORTEN URL API
app.post("/shorten", async (req, res) => {
  try {
    const { originalUrl, customId } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: "originalUrl is required" });
    }


    // validate URL
    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    let baseId = customId?.trim().toLowerCase();
    let shortId = baseId || generateShortId();

    let counter = 1;

    
    // UNIQUE ID
    while (await prisma.url.findUnique({ where: { shortId } })) {
      if (baseId) {
        shortId = `${baseId}-${counter}`;
        counter++;
      } else {
        shortId = generateShortId();
      }
    }


    // save to DB
    await prisma.url.create({
      data: {
        originalUrl,
        shortId,
      },
    });

    const shortUrl = `${BASE_URL}/${shortId}`;
    const qrCodeImage = await QRCode.toDataURL(shortUrl);

    return res.status(201).json({
      shortUrl,
      statsUrl: `${BASE_URL}/stats/${shortId}`,
      qrCode: qrCodeImage,
    });

  } catch (err) {
    console.error("SHORTEN ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


// STATS API
app.get("/stats/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await prisma.url.findUnique({
      where: { shortId },
      include: { clicksLog: true },
    });

    if (!url) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.json({
      shortId: url.shortId,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      totalEvents: url.clicksLog.length,
      clickHistory: url.clicksLog,
      createdAt: url.createdAt,
    });

  } catch (err) {
    console.error("STATS ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


// REDIRECT + TRACKING
app.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await prisma.url.findUnique({
      where: { shortId },
    });

    if (!url) {
      return res.status(404).send("URL not found");
    }


    // increment clicks
    await prisma.url.update({
      where: { shortId },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });


    // store click event
    await prisma.clickEvent.create({
      data: {
        urlId: url.id,
      },
    });

    return res.redirect(302, url.originalUrl);

  } catch (err) {
    console.error("REDIRECT ERROR:", err);
    return res.status(500).send("Server error");
  }
});


// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});