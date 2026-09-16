import mongoose from "mongoose";

// ── GalleryImage schema ──────────────────────────────────────
// Backs the "KEC Gallery at a CBG Glance" auto-scrolling grid on Home
// (frontend/src/comp/GalleryGlimpse.jsx). Stored as one flat, ordered
// list — the frontend splits it evenly across its 4 scroll columns.
const galleryImageSchema = new mongoose.Schema(
  {
    img: { type: String, required: true },
    alt: { type: String, trim: true, default: "" },
    // Which of the 4 scroll columns to place this in (1-4). Leave unset
    // to auto-distribute evenly by order — see GalleryGlimpse.jsx.
    column: { type: Number, enum: [1, 2, 3, 4], default: null },
    // Lower number = shown earlier in the gallery.
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

galleryImageSchema.index({ order: 1 });

export default mongoose.model("GalleryImage", galleryImageSchema);
