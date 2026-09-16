import GalleryImage from "../models/GalleryImage.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

// ── GET /api/gallery/published ─ public, all images ─────────
export const getPublishedGalleryImages = asyncHandler(async (req, res) => {
  const images = await GalleryImage.find().select("img alt column order").sort({ order: 1, createdAt: 1 }).lean();
  res.json({ success: true, data: images });
});

// ── GET /api/gallery ─ list all (admin) ────────────────────
export const getGalleryImages = asyncHandler(async (req, res) => {
  const images = await GalleryImage.find().sort({ order: 1, createdAt: 1 }).lean();
  res.json({ success: true, data: images });
});

// ── GET /api/gallery/:id ─ single (admin) ──────────────────
export const getGalleryImageById = asyncHandler(async (req, res) => {
  const image = await GalleryImage.findById(req.params.id).lean();
  if (!image) throw new AppError("Gallery image not found", 404);
  res.json({ success: true, data: image });
});

// ── POST /api/gallery ─ create ──────────────────────────────
export const createGalleryImage = asyncHandler(async (req, res) => {
  const image = await GalleryImage.create(req.body);
  res.status(201).json({ success: true, data: image, message: "Gallery image added successfully" });
});

// ── PUT /api/gallery/:id ─ update ──────────────────────────
export const updateGalleryImage = asyncHandler(async (req, res) => {
  const image = await GalleryImage.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!image) throw new AppError("Gallery image not found", 404);
  res.json({ success: true, data: image, message: "Gallery image updated successfully" });
});

// ── DELETE /api/gallery/:id ─ delete ───────────────────────
export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const image = await GalleryImage.findByIdAndDelete(req.params.id);
  if (!image) throw new AppError("Gallery image not found", 404);
  res.json({ success: true, message: "Gallery image deleted successfully" });
});
