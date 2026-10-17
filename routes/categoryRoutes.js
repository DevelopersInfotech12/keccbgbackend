import express from "express";
import { getCategories, createCategory, deleteCategory } from "../controllers/categoryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public (the public Blog page reads the list for its filters) ──
router.get("/", getCategories);

// ── Protected admin routes ─────────────────────────────────
router.post("/", protect, createCategory);
router.delete("/:id", protect, deleteCategory);

export default router;
