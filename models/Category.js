import mongoose from "mongoose";

// ── Category schema ─────────────────────────────────────────
// One collection backs both category dropdowns in the admin panel:
//   type "blog"        → the blog "Tag / Category" (Blog.tag)
//   type "infographic" → the infographic category (Infographic.category)
// Admins can add and delete entries; blogs / infographics keep storing the
// category NAME as a plain string, so deleting an entry never breaks
// existing content.
const categorySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["blog", "infographic"], required: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    // Badge colours (used for blog tag pills on the public site).
    color: {
      bg: { type: String, default: "#EAF6EF" },
      text: { type: String, default: "#124B2F" },
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Same name may exist once per type (case-insensitive).
categorySchema.index(
  { type: 1, name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

export default mongoose.model("Category", categorySchema);
