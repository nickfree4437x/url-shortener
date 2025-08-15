import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true },
  short_code: { type: String, required: true, unique: true },
  visit_count: { type: Number, default: 0 },
  expiresAt: { type: Date }, // Optional for expiry feature
}, { timestamps: true });

export default mongoose.model("Url", urlSchema);
