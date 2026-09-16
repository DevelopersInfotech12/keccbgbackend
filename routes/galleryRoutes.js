import express from "express";
import {
  getGalleryImages, getPublishedGalleryImages, getGalleryImageById,
  createGalleryImage, updateGalleryImage, deleteGalleryImage,
} from "../controllers/galleryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public ───────────────────────────────────────────────────
router.get("/published", getPublishedGalleryImages);

// ── Protected admin routes ─────────────────────────────────
router.use(protect);

router.get("/", getGalleryImages);
router.get("/:id", getGalleryImageById);

router.post("/", createGalleryImage);
router.put("/:id", updateGalleryImage);
router.delete("/:id", deleteGalleryImage);

export default router;
