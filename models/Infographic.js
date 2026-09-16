import mongoose from "mongoose";

// ── Infographic schema ──────────────────────────────────────
// Backs the public /infographics page (frontend/src/comp/Infographics.jsx).
// Mirrors the shape of frontend/src/lib/infographicsData.js so the admin
// panel can fully replace that static file with live, editable content.
const infographicSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },

    category: {
      type: String,
      required: true,
      default: "CBG Basics",
    },

    // Free-text display date (matches the "August 10, 2026" style already
    // used on the site) so admins can type it however they like.
    date: { type: String, required: true },

    img: { type: String, required: true },

    status: { type: String, enum: ["draft", "published"], default: "draft" },

    // Lower number = shown first on the public grid.
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

infographicSchema.index({ status: 1, order: 1, createdAt: -1 });
infographicSchema.index({ category: 1 });

export default mongoose.model("Infographic", infographicSchema);
