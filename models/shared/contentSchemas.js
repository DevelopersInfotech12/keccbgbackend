import mongoose from "mongoose";

// Shared building blocks used by both Blog and CaseStudy documents, so the
// admin panel's block/section editor and public content renderer work
// identically for both content types.

// ── Content block sub-schema (rich body content) ────────────────
export const contentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["p", "h3", "ul", "ol", "callout", "callout-warn", "steps", "img"],
    required: true,
  },
  text: { type: String },
  items: { type: [String] },
  stepItems: [
    {
      n: String,
      title: String,
      desc: String,
      tip: String,
    },
  ],
  src: { type: String },
  alt: { type: String },
}, { _id: false });

// ── Section sub-schema ───────────────────────────────────────
export const sectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  heading: { type: String, required: true },
  // Optional section-level image, separate from an "img" content block —
  // shown once, right under the heading, with its own caption. Every
  // section can carry one; none of these fields are required.
  image: { type: String },
  imageAlt: { type: String },
  imageCaption: { type: String },
  content: [contentBlockSchema],
}, { _id: false });

// ── TOC entry ────────────────────────────────────────────────
export const tocSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
}, { _id: false });

// ── Meta entry (sidebar key/value rows) ─────────────────────
export const metaSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

// ── SEO sub-schema ───────────────────────────────────────────
export const seoSchema = new mongoose.Schema({
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: { type: [String], default: [] },
  ogTitle: { type: String },
  ogDescription: { type: String },
  ogImage: { type: String },
  canonicalUrl: { type: String },
  structuredData: { type: String },
  noIndex: { type: Boolean, default: false },
}, { _id: false });
