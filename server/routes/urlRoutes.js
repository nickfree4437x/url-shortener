import express from "express";
import Url from "../models/Url.js";
import { nanoid } from "nanoid";
import ogs from "open-graph-scraper";

const router = express.Router();

// Create Short URL with optional expiry date
router.post("/api/shorten", async (req, res) => {
  try {
    const { original_url } = req.body;
    if (!original_url) return res.status(400).json({ message: "URL is required" });

    const short_code = nanoid(6);
    const newUrl = new Url({ original_url, short_code });
    await newUrl.save();

    res.json({ short_url: `http://localhost:5000/${short_code}` });
  } catch (err) {
    console.error("Error creating short URL:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});


// Redirect with expiry check
router.get("/:shortcode", async (req, res) => {
  try {
    const { shortcode } = req.params;
    const urlData = await Url.findOne({ short_code: shortcode });

    if (!urlData) {
      return res.status(404).json({ message: "URL not found" });
    }

    // 🆕 Check if expired
    if (urlData.expiryDate && new Date() > urlData.expiryDate) {
      return res.status(410).send("This link has expired");
    }

    urlData.visit_count++;
    await urlData.save();

    res.redirect(urlData.original_url);
  } catch (err) {
    res.status(500).json({ message: "Error processing request" });
  }
});

// Get all URLs (Admin Only)
router.get("/api/admin/urls", async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    res.json(urls);
  } catch (error) {
    res.status(500).json({ message: "Error fetching URLs" });
  }
});

// Link Preview Route
router.post("/api/preview", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  try {
    const { error, result } = await ogs({ url });

    if (error) {
      return res.status(500).json({ message: "Failed to fetch preview" });
    }

    res.json({
      title: result.ogTitle || "No title found",
      description: result.ogDescription || "No description found",
      image: result.ogImage?.[0]?.url || "",
      favicon: result.favicon || "",
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
