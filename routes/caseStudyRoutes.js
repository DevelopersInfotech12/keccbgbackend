import express from "express";
import {
  getCaseStudies, getPublishedCaseStudies, getAllSlugs, getCaseStudyStats,
  getCaseStudyById, getCaseStudyBySlug,
  createCaseStudy, updateCaseStudy,
  toggleStatus, toggleFeatured,
  deleteCaseStudy, bulkAction,
} from "../controllers/caseStudyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public routes ──────────────────────────────────────────
router.get("/published", getPublishedCaseStudies);
router.get("/public/all-slugs", getAllSlugs);
router.get("/public/:slug", getCaseStudyBySlug);

// ── Protected admin routes ─────────────────────────────────
router.use(protect);

router.get("/", getCaseStudies);
router.get("/stats", getCaseStudyStats);
router.get("/:id", getCaseStudyById);

router.post("/", createCaseStudy);
router.post("/bulk", bulkAction);

router.put("/:id", updateCaseStudy);
router.patch("/:id/status", toggleStatus);
router.patch("/:id/featured", toggleFeatured);

router.delete("/:id", deleteCaseStudy);

export default router;
