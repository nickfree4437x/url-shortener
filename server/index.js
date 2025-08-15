import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron"; // 🆕 Added for scheduled tasks
import urlRoutes from "./routes/urlRoutes.js";
import Url from "./models/Url.js"; // 🆕 To access the URL model

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// Routes
app.use("/", urlRoutes);

// 🆕 Cron Job to delete expired links every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const result = await Url.deleteMany({
      expiryDate: { $ne: null, $lt: new Date() }
    });
    if (result.deletedCount > 0) {
      console.log(`🗑️ Deleted ${result.deletedCount} expired links`);
    }
  } catch (err) {
    console.error("❌ Error deleting expired links:", err);
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
