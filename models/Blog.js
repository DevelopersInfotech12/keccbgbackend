import mongoose from "mongoose";
import { contentBlockSchema, sectionSchema, tocSchema, metaSchema, seoSchema } from "./shared/contentSchemas.js";

// ── Related post (blog → blog) ───────────────────────────────
const relatedSchema = new mongoose.Schema({
  img: String,
  tag: String,
  tagBg: String,
  tagColor: String,
  date: String,
  title: String,
  slug: { type: String, default: null },
}, { _id: false });

// ── Main Blog schema ─────────────────────────────────────────
const blogSchema = new mongoose.Schema(
  {
    // Core — unique:true already creates the index; no separate schema.index needed
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true },

    // Which public blog vertical this post belongs to — drives which
    // section of the Blog screen (KEC Insights vs The BioEnergy Brief vs Blog)
    // the post appears under, and which admin filter surfaces it.
    category: {
      type: String,
      enum: ["kec-insights", "bioenergy-brief", "blog"],
      required: true,
      default: "bioenergy-brief",
    },

    tag: { type: String, required: true },
    tagStyle: {
      bg: { type: String, default: "#EAF6EF" },
      text: { type: String, default: "#1A6A42" },
    },

    // Dates & meta
    date: { type: String, required: true },
    readTime: { type: String, default: "5 min read" },
    author: { type: String, default: "Bio CBG Team" },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "draft" },

    // Images
    img: { type: String, required: true },
    heroImg: { type: String },
    heroGradient: { type: String, default: "linear-gradient(135deg,rgba(10,19,16,0.94) 0%,rgba(26,106,66,0.80) 100%)" },

    // SEO
    seo: seoSchema,

    // Content
    highlights: { type: [String], default: [] },
    toc: [tocSchema],
    meta: [metaSchema],
    sections: [sectionSchema],
    tags: { type: [String], default: [] },

    // Sidebar
    sidebarCta: {
      title: String,
      body: String,
      btn: String,
    },

    // CTA band
    ctaTitle: { type: String },
    ctaBody: { type: String },

    // Related posts
    related: [relatedSchema],

    // Analytics
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────
// slug index is auto-created by unique:true above — do NOT add schema.index({ slug: 1 })
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ tag: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ featured: 1 });

export default mongoose.model("Blog", blogSchema);
