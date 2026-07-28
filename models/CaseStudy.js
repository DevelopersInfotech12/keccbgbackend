import mongoose from "mongoose";
import { contentBlockSchema, sectionSchema, tocSchema, metaSchema, seoSchema } from "./shared/contentSchemas.js";

// ── Headline result stat (the plinth numbers on the card/detail hero) ──
const resultSchema = new mongoose.Schema({
  value: { type: String, required: true },   // e.g. "70%"
  label: { type: String, required: true },   // e.g. "of site gas demand met"
  tone: { type: String, enum: ["leaf", "blush"], default: "leaf" },
}, { _id: false });

// ── Related case study (case study → case study) ────────────
const relatedSchema = new mongoose.Schema({
  img: String,
  tag: String,
  date: String,
  title: String,
  slug: { type: String, default: null },
}, { _id: false });

// ── Main CaseStudy schema ────────────────────────────────────
const caseStudySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true },

    // Classification — used for the listing page's filter chips
    sector: { type: String, required: true }, // e.g. "Life Sciences", "Agriculture"
    client: { type: String },
    location: { type: String },
    capacity: { type: String }, // e.g. "12 t/day CBG"

    date: { type: String, required: true },
    readTime: { type: String, default: "4 min read" },
    author: { type: String, default: "Bio CBG Team" },
    featured: { type: Boolean, default: false }, // shown on the homepage case-study section
    status: { type: String, enum: ["draft", "published"], default: "draft" },

    // Images
    img: { type: String, required: true },     // listing card thumbnail
    heroImg: { type: String },                  // detail page hero
    heroGradient: { type: String, default: "linear-gradient(135deg,rgba(10,19,16,0.94) 0%,rgba(26,106,66,0.80) 100%)" },
    gallery: { type: [String], default: [] },

    // SEO
    seo: seoSchema,

    // Content
    highlights: { type: [String], default: [] },
    results: [resultSchema],
    toc: [tocSchema],
    meta: [metaSchema],
    sections: [sectionSchema],
    tags: { type: [String], default: [] },

    sidebarCta: {
      title: String,
      body: String,
      btn: String,
    },

    ctaTitle: { type: String },
    ctaBody: { type: String },

    related: [relatedSchema],

    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

caseStudySchema.index({ status: 1, createdAt: -1 });
caseStudySchema.index({ sector: 1 });
caseStudySchema.index({ featured: 1 });

export default mongoose.model("CaseStudy", caseStudySchema);
