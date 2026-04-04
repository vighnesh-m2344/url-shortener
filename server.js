const QRCode = require("qrcode");
const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

app.use(express.json());


//BASE URL (works for local + production)
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";


// ROOT ROUTE (prevents 404 on base URL)
app.get("/", (req, res) => {
  res.send("URL Shortener API is running 🚀");
});


// generate short id
function generateShortId() {
  return Math.random().toString(36).substring(2, 8);
}


// SHORTEN URL
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

    const shortUrl = `${BASE_URL}/${shortId}`;



    //QR generation
    const qrCodeImage = await QRCode.toDataURL(shortUrl);

    return res.json({
      shortUrl,
      statsUrl: `${BASE_URL}/stats/${newUrl.shortId}`,
      qrCode: qrCodeImage,
    });

  } 
    catch (err) {
    console.error("ERROR:", err); // IMPORTANT
    return res.status(500).json({
      error: "Server error",
      message: err.message, //this will show real issue in Postman
    });
  }
});


// STATS ROUTE (BEFORE redirect)
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


    // increment clicks
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


// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});